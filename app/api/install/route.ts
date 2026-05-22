import { NextRequest, NextResponse } from 'next/server'
import { deployToServer } from '@/lib/deploy'
import { wipeServer } from '@/lib/wipe-script'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { initProgress, appendStep, failProgress } from '@/lib/kv'
import { sendInstallStartedEmail, sendRecoveryTokenEmail } from '@/lib/email'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { ip, login, password, session_id, platform, serverToken: existingToken } = await req.json()

  if (!ip || !login || !password || !session_id) {
    return NextResponse.json({ error: 'Missing ip, login, password or session_id' }, { status: 400 })
  }

  // For authenticated users: create a serverToken so the server appears in dashboard
  // and the email pipeline has a known recipient. Pool provisioning uses /api/pool/provision
  // and never hits this route — this block is own-server only.
  let tokenForBootstrap = existingToken ?? ''
  const session = await auth()
  const userEmail = session?.user?.email ?? null
  const userId = session?.user?.id ?? null

  if (userId && userEmail) {
    // Create free subscription (idempotent — reuse if one already exists and isn't cancelled)
    let sub = await db.subscription.findFirst({
      where: { userId, planId: 'free', status: { not: 'cancelled' } },
    })
    if (!sub) {
      sub = await db.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'free',
          status: 'active',
          planId: 'free',
          currentPeriodEnd: new Date('2099-01-01'),
        },
      })
    }

    const newToken = await db.serverToken.create({
      data: {
        userId,
        subscriptionId: sub.id,
        status: 'pending',
        deploySessionId: session_id,
        serverIp: ip,
        serverPassword: password,
      },
    })
    tokenForBootstrap = newToken.token
  }

  // Step 1: init progress + send confirmation email BEFORE SSH so it always fires
  await initProgress(session_id)
  if (userEmail) {
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    await sendInstallStartedEmail(userEmail)
    // Best-effort recovery-token follow-up. The install-started email above
    // does not carry the token because the ServerToken row may not exist for
    // existing-token paths; but if we DO have a token now, send the recovery
    // email so the user can re-engage via MCP later if anything breaks.
    if (tokenForBootstrap) {
      try { await sendRecoveryTokenEmail(userEmail, tokenForBootstrap) } catch (err) {
        console.error('[install] recovery-token email failed', err)
      }
    }
  }

  // Step 2: wipe any previous installation BEFORE bootstrap runs. See
  // lib/wipe-script.ts for why this is mandatory (idempotency-check
  // soft_step bodies in bootstrap.sh silently skip work when stale
  // artifacts exist, causing 2-hour-frozen-at-57% deploys).
  await appendStep(session_id, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
  try {
    await wipeServer(ip, login, password)
    await appendStep(session_id, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const wipeErr = `WIPE_FAILED: could not clean previous installation — ${errMsg}`
    await failProgress(session_id, wipeErr)
    return NextResponse.json({ error: wipeErr, recovery: 'mcp' }, { status: 500 })
  }

  // Step 3: SSH + upload bootstrap + launch (initProgress is idempotent — won't wipe email_start step)
  await deployToServer({ ip, login, password, session_id, platform, serverToken: tokenForBootstrap })

  return NextResponse.json({ session_id, status: 'installing' })
}
