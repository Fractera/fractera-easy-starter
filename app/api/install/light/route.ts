import { NextRequest, NextResponse } from 'next/server'
import { deployLightToServer } from '@/lib/deploy-light'
import { wipeServerLight } from '@/lib/wipe-script-light'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { initProgress, appendStep, failProgress } from '@/lib/kv'
import { sendLightInstallStartedEmail, sendLightRecoveryTokenEmail, sendLightDeployFailedEmail } from '@/lib/email'
import { acquireDeployLock } from '@/lib/deploy-lock'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { ip, login, password, session_id, githubToken } = await req.json()

  if (!ip || !login || !password || !session_id) {
    return NextResponse.json({ error: 'Missing ip, login, password or session_id' }, { status: 400 })
  }

  const lockAcquired = await acquireDeployLock(ip, session_id)
  if (!lockAcquired) {
    return NextResponse.json({
      error: 'Deploy already in progress for this server',
    }, { status: 409 })
  }

  let tokenForBootstrap = ''
  const session = await auth()
  const userEmail = session?.user?.email ?? null
  const userId = session?.user?.id ?? null

  if (userId && userEmail) {
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

  await initProgress(session_id)
  if (userEmail) {
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    try { await sendLightInstallStartedEmail(userEmail) } catch (err) { console.error('[install/light] start email failed', err) }
    if (tokenForBootstrap) {
      try { await sendLightRecoveryTokenEmail(userEmail, tokenForBootstrap) } catch (err) {
        console.error('[install/light] recovery-token email failed', err)
      }
    }
  }

  await appendStep(session_id, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
  try {
    await wipeServerLight(ip, login, password)
    await appendStep(session_id, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const wipeErr = `WIPE_FAILED: could not clean previous installation — ${errMsg}`
    await failProgress(session_id, wipeErr)
    if (userEmail) {
      try { await sendLightDeployFailedEmail(userEmail, wipeErr, tokenForBootstrap || undefined) } catch (mailErr) {
        console.error('[install/light] sendLightDeployFailedEmail failed', mailErr)
      }
    }
    return NextResponse.json({ error: wipeErr }, { status: 500 })
  }

  await deployLightToServer({
    ip,
    login,
    password,
    session_id,
    githubToken: githubToken ?? '',
    serverToken: tokenForBootstrap,
  })

  return NextResponse.json({ session_id, status: 'installing' })
}
