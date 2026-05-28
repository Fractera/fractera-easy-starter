import { NextRequest, NextResponse } from 'next/server'
import { deployToServer } from '@/lib/deploy'
import { wipeServer } from '@/lib/wipe-script'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { initProgress, appendStep, failProgress } from '@/lib/kv'
import { sendInstallStartedEmail, sendRecoveryTokenEmail } from '@/lib/email'

export const maxDuration = 300

// IP-only deploy endpoint — no DNS, no Cloudflare, no HTTPS.
// User reaches their server at http://<server-ip>:<port> directly.
// Customer can later attach a custom domain via the admin panel.
export async function POST(req: NextRequest) {
  const { ip, login, password, session_id, platform, serverToken: existingToken } = await req.json()

  if (!ip || !login || !password || !session_id) {
    return NextResponse.json({ error: 'Missing ip, login, password or session_id' }, { status: 400 })
  }

  let tokenForBootstrap = existingToken ?? ''
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
        // Synthetic subdomain for IP-mode servers — used as identifier
        // in the dashboard; never resolved as DNS.
        subdomain: `ip-${ip}`,
      },
    })
    tokenForBootstrap = newToken.token
  }

  await initProgress(session_id)
  if (userEmail) {
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    await sendInstallStartedEmail(userEmail)
    if (tokenForBootstrap) {
      try { await sendRecoveryTokenEmail(userEmail, tokenForBootstrap) } catch (err) {
        console.error('[install/ip] recovery-token email failed', err)
      }
    }
  }

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

  await deployToServer({
    ip,
    login,
    password,
    session_id,
    platform,
    serverToken: tokenForBootstrap,
    deployMode: 'ip',
  })

  return NextResponse.json({ session_id, status: 'installing', mode: 'ip' })
}
