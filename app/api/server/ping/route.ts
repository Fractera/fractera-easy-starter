import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWelcomeEmail, sendExpiryWarningEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const serverToken = await db.serverToken.findUnique({
    where: { token },
    include: { subscription: true, user: true },
  })

  if (!serverToken) {
    return NextResponse.json({ error: 'Unknown token' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const subdomain = (body.subdomain as string | undefined) ?? serverToken.subdomain ?? ''

  const wasFirstPing = serverToken.status === 'pending'

  await db.serverToken.update({
    where: { token },
    data: {
      lastPingAt: new Date(),
      status: 'active',
      subdomain: subdomain || serverToken.subdomain,
    },
  })

  // Welcome email on first successful ping
  if (wasFirstPing && serverToken.user.email && subdomain) {
    sendWelcomeEmail(serverToken.user.email, subdomain).catch(console.error)
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
