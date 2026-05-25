import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deployLightToServer } from '@/lib/deploy-light'
import { wipeServerLight } from '@/lib/wipe-script-light'
import { initProgress, appendStep, failProgress } from '@/lib/kv'
import { sendLightInstallStartedEmail, sendLightDeployFailedEmail, sendLightRecoveryTokenEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Token-authenticated install for the embed widget. Mirrors /api/install but
// resolves the user via the EmbedSession token instead of NextAuth session
// (iframe third-party cookies are not reliable, so we use a localStorage
// token issued at signup time).
export async function POST(req: NextRequest) {
  let body: { token?: unknown; ip?: unknown; password?: unknown; login?: unknown; sessionId?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = typeof body.token === 'string' ? body.token : ''
  const ip = typeof body.ip === 'string' ? body.ip.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const login = typeof body.login === 'string' && body.login.trim() ? body.login.trim() : 'root'
  // The widget generates the session id client-side so it can start polling
  // /api/progress immediately, without awaiting this whole request.
  const clientSessionId = typeof body.sessionId === 'string' && /^light-\d+-[a-z0-9]+$/.test(body.sessionId)
    ? body.sessionId
    : null

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

  const sessionId = clientSessionId ?? `light-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

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
    try { await sendLightInstallStartedEmail(session.email) } catch (err) { console.error('[embed/install/light] start email failed', err) }
    // Best-effort follow-up with the recovery token for MCP retry path.
    try { await sendLightRecoveryTokenEmail(session.email, serverToken.token) } catch (err) {
      console.error('[embed/install/light] recovery-token email failed', err)
    }
  }

  // Wipe any previous installation BEFORE bootstrap runs. Required because
  // bootstrap.sh's soft_step bodies have idempotency checks that misbehave
  // when partial leftovers exist (e.g. cached LightRAG webui dir triggers
  // a `exit 0` that kills the whole script). Failing here is fatal — we
  // refuse to deploy onto a server we couldn't clean, because the failure
  // mode is silent and 2-hours-stuck-at-57%.
  await appendStep(sessionId, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
  try {
    await wipeServerLight(ip, login, password)
    await appendStep(sessionId, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[embed/install/light] wipeServer failed', err)
    // Mark error with a recognizable prefix so embed-flow's deploy-error UI
    // can render an MCP-retry hint instead of a generic "try again" — the
    // user can re-launch deploy via the Fractera MCP tool, which will run
    // the same wipe path (likely passing on a retry after transient SSH
    // hiccups, or surfacing a real diagnosable error).
    const wipeErr = `WIPE_FAILED: could not clean previous installation — ${errMsg}`
    try {
      await failProgress(sessionId, wipeErr)
      await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: wipeErr } })
    } catch (writeErr) {
      console.error('[embed/install/light] failProgress write error', writeErr)
    }
    if (session.email) {
      try { await sendLightDeployFailedEmail(session.email, wipeErr, serverToken.token) } catch (mailErr) { console.error('[embed/install/light] sendLightDeployFailedEmail failed', mailErr) }
    }
    return NextResponse.json({ sessionId, status: 'error', recovery: 'mcp' })
  }

  // AWAIT the deploy — must not be fire-and-forget. On Vercel the serverless
  // function is frozen the moment the HTTP response is returned, so a detached
  // promise gets its SSH connection killed mid-upload and bootstrap.sh is
  // never written to the target. deployToServer only SSHes in, uploads
  // bootstrap.sh and launches it detached (setsid ... &) — it resolves in a
  // few seconds, well within maxDuration. bootstrap.sh then runs independently
  // on the target and reports its steps via POST /api/progress.
  try {
    await deployLightToServer({
      ip,
      login,
      password,
      session_id: sessionId,
      serverToken: serverToken.token,
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[embed/install/light] deployToServer failed', err)
    try {
      await failProgress(sessionId, errMsg)
      await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: errMsg } })
    } catch (writeErr) {
      console.error('[embed/install/light] failProgress write error', writeErr)
    }
    // Notify the user — they may have closed the widget waiting for a result.
    if (session.email) {
      try {
        await sendLightDeployFailedEmail(session.email, errMsg, serverToken.token)
      } catch (mailErr) {
        console.error('[embed/install/light] sendLightDeployFailedEmail failed', mailErr)
      }
    }
    // Still return the sessionId — the widget's progress poller will read the
    // failProgress error from KV and switch to its deploy-error state.
    return NextResponse.json({ sessionId, status: 'error' })
  }

  // EmbedSession.status stays at 'installing' — the existing ServerToken
  // lifecycle / /api/progress callbacks drive the actual deployment state.
  return NextResponse.json({ sessionId, status: 'installing' })
}
