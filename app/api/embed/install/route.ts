import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'
import { initProgress, appendStep, failProgress } from '@/lib/kv'
import { sendInstallStartedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Token-authenticated install for the embed widget. Mirrors /api/install but
// resolves the user via the EmbedSession token instead of NextAuth session
// (iframe third-party cookies are not reliable, so we use a localStorage
// token issued at signup time).
export async function POST(req: NextRequest) {
  let body: { token?: unknown; ip?: unknown; password?: unknown; login?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = typeof body.token === 'string' ? body.token : ''
  const ip = typeof body.ip === 'string' ? body.ip.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const login = typeof body.login === 'string' && body.login.trim() ? body.login.trim() : 'root'

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  if (!ip || !password) return NextResponse.json({ error: 'Missing IP or password' }, { status: 400 })

  const session = await db.embedSession.findUnique({
    where: { token },
    select: { id: true, status: true, userId: true, email: true },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.status === 'pending' || !session.userId) {
    return NextResponse.json({ error: 'Not activated yet' }, { status: 409 })
  }

  // Create free subscription + ServerToken so the deploy pipeline can attribute
  // progress and emails to the user (same shape /api/install uses).
  let sub = await db.subscription.findFirst({
    where: { userId: session.userId, planId: 'free', status: { not: 'cancelled' } },
  })
  if (!sub) {
    sub = await db.subscription.create({
      data: {
        userId: session.userId,
        stripeCustomerId: 'free',
        status: 'active',
        planId: 'free',
        currentPeriodEnd: new Date('2099-01-01'),
      },
    })
  }

  const sessionId = `embed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const serverToken = await db.serverToken.create({
    data: {
      userId: session.userId,
      subscriptionId: sub.id,
      status: 'pending',
      deploySessionId: sessionId,
      serverIp: ip,
      serverPassword: password,
    },
  })

  await db.embedSession.update({
    where: { id: session.id },
    data: { status: 'installing' },
  })

  // Init progress + send confirmation email before SSH so it always fires.
  await initProgress(sessionId)
  if (session.email) {
    await appendStep(sessionId, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    try { await sendInstallStartedEmail(session.email) } catch (err) { console.error('[embed/install] start email failed', err) }
  }

  // AWAIT the deploy — must not be fire-and-forget. On Vercel the serverless
  // function is frozen the moment the HTTP response is returned, so a detached
  // promise gets its SSH connection killed mid-upload and bootstrap.sh is
  // never written to the target. deployToServer only SSHes in, uploads
  // bootstrap.sh and launches it detached (setsid ... &) — it resolves in a
  // few seconds, well within maxDuration. bootstrap.sh then runs independently
  // on the target and reports its steps via POST /api/progress.
  try {
    await deployToServer({
      ip,
      login,
      password,
      session_id: sessionId,
      serverToken: serverToken.token,
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[embed/install] deployToServer failed', err)
    try {
      await failProgress(sessionId, errMsg)
      await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: errMsg } })
    } catch (writeErr) {
      console.error('[embed/install] failProgress write error', writeErr)
    }
    // Still return the sessionId — the widget's progress poller will read the
    // failProgress error from KV and switch to its deploy-error state.
    return NextResponse.json({ sessionId, status: 'error' })
  }

  // EmbedSession.status stays at 'installing' — the existing ServerToken
  // lifecycle / /api/progress callbacks drive the actual deployment state.
  return NextResponse.json({ sessionId, status: 'installing' })
}
