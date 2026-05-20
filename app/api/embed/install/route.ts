import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'
import { initProgress, appendStep } from '@/lib/kv'
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

  // Fire-and-forget the actual deploy. The widget does not stream progress —
  // the user gets details via email, the cabinet shows the server later.
  deployToServer({
    ip,
    login,
    password,
    session_id: sessionId,
    serverToken: serverToken.token,
  }).catch(err => console.error('[embed/install] deployToServer failed', err))

  // Mark session as deployed (not pending anymore — bootstrap has been kicked
  // off). Final status flip to actually-deployed happens in the existing
  // server-token lifecycle.
  await db.embedSession.update({
    where: { id: session.id },
    data: { status: 'deployed' },
  })

  return NextResponse.json({ sessionId, status: 'installing' })
}
