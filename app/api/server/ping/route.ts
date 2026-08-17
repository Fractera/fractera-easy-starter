import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendExpiryWarningEmail } from '@/lib/email'
import { sendWelcomeEmailOnce } from '@/lib/welcome-email'
import { classifySubdomain } from '@/lib/subdomain-helpers'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const serverToken = await db.serverToken.findUnique({
    where: { token },
    include: {
      subscription: true,
      user: true,
    },
  })

  if (!serverToken) {
    return NextResponse.json({ error: 'Unknown token' }, { status: 401 })
  }

  if (serverToken.status === 'offline') {
    return NextResponse.json({ error: 'Server deleted' }, { status: 410 })
  }

  const body = await req.json().catch(() => ({}))
  const incomingSubdomain = (body.subdomain as string | undefined) ?? ''

  // The DB subdomain is the source of truth once it is "meaningful" — i.e.
  // either a real custom domain (Secure mode, set by /api/server/domain-activated)
  // or the synthetic `ip-<IP>` form set by /api/install. The ping payload only
  // ever carries the bare server IP (bootstrap sends SUBDOMAIN=$SERVER_IP), so
  // accepting it here would silently DOWNGRADE the record:
  //   • a real domain → bare IP  → dashboard reverts from https://admin.<domain>
  //     back to insecure http://<ip>:3002 within one 15-min ping cycle;
  //   • an `ip-<IP>` form → bare IP → loses the prefix used by IP-mode detection.
  // So we only adopt the incoming value to fill an empty/first-ping record.
  // classifySubdomain() is the canonical shape classifier (shared with buildUrls
  // + the email layer) — reuse it instead of re-deriving the rules here.
  const dbSubdomain = serverToken.subdomain ?? ''
  const dbIsMeaningful =
    classifySubdomain(dbSubdomain).mode === 'domain' || dbSubdomain.startsWith('ip-')
  const subdomain = dbIsMeaningful
    ? dbSubdomain
    : (incomingSubdomain || dbSubdomain)

  const wasFirstPing = serverToken.status === 'pending'

  await db.serverToken.update({
    where: { token },
    data: {
      lastPingAt: new Date(),
      status: 'active',
      subdomain,
    },
  })

  // If this is a pool provisioning token — mark pool server as ready
  if (wasFirstPing && subdomain) {
    const poolServer = await db.vpsReserve.findFirst({
      where: { provisioningServerTokenId: serverToken.id },
    })
    if (poolServer) {
      await db.vpsReserve.update({
        where: { id: poolServer.id },
        data: { subdomain, status: 'ready' },
      })
      return NextResponse.json({ ok: true })
    }
  }

  // Welcome email — attempted on EVERY ping, not just the first one, because the
  // ping cron (*/15) is what makes a failed send recoverable: the send is claimed
  // through ServerToken.welcomeSentAt, so an already-mailed server costs one
  // indexed no-op write here, while a server whose send failed gets another
  // attempt a quarter of an hour later. Gating on `wasFirstPing` would throw that
  // retry away — the first ping would be the only chance, which is the behaviour
  // being fixed.
  //
  // AWAITED on purpose. It used to be fire-and-forget (`.catch(console.error)`),
  // and on Vercel a serverless function is frozen the moment its response is
  // returned — an unawaited send can be killed mid-flight. This repo already
  // learned that lesson once in lib/mcp-tools.ts (commit 57fcc48 → fab8928); the
  // welcome email was still paying for it.
  //
  // 🔒 POOL TOKENS ARE EXCLUDED, and this guard is load-bearing precisely BECAUSE
  // the call above is no longer gated on `wasFirstPing`. The pool branch a few
  // lines up only returns early on the FIRST ping; a reserve server keeps pinging
  // every 15 minutes for its whole life, so without this it would walk into the
  // send path on ping #2. Same marker the other routes use (a `pool-` session id).
  const isPoolToken = serverToken.deploySessionId?.startsWith('pool-') ?? false
  if (!isPoolToken) {
    await sendWelcomeEmailOnce(serverToken.id)
  }

  const sub = serverToken.subscription
  if (!sub) {
    return NextResponse.json({ ok: true, subscriptionStatus: 'none' })
  }

  const msLeft = sub.currentPeriodEnd.getTime() - Date.now()
  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24))

  // Send 7-day warning once per subscription period
  if (daysLeft <= 7 && daysLeft > 0 && sub.status === 'active' && !serverToken.warningSentAt) {
    if (serverToken.user.email) {
      sendExpiryWarningEmail(serverToken.user.email, daysLeft, subdomain).catch(console.error)
    }
    await db.serverToken.update({
      where: { token },
      data: { warningSentAt: new Date() },
    })
  }

  return NextResponse.json({
    ok: true,
    subscriptionStatus: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
    daysLeft,
    warning: daysLeft <= 7 && sub.status === 'active',
  })
}
