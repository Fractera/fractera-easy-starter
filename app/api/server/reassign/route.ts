import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendWelcomeEmail, sendQueuedEmail, sendAdminAlertEmail } from '@/lib/email'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const subscription = await db.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  // Idempotency guard: don't create a second token if one already exists
  const existingToken = await db.serverToken.findFirst({
    where: {
      userId,
      subscriptionId: subscription.id,
      status: { not: 'offline' },
    },
  })
  if (existingToken) {
    return NextResponse.json(
      { ok: false, error: 'Server already assigned or pending', status: existingToken.status },
      { status: 409 },
    )
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })

  const poolServer = await db.vpsReserve.findFirst({
    where: { status: 'ready' },
    orderBy: { createdAt: 'asc' },
  })

  if (poolServer) {
    await db.vpsReserve.update({
      where: { id: poolServer.id },
      data: { status: 'paid', paidAt: new Date(), assignedUserId: userId, assignedAt: new Date() },
    })

    await db.serverToken.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        status: 'active',
        serverIp: poolServer.ip,
        serverPassword: poolServer.password,
        subdomain: poolServer.subdomain ?? undefined,
      },
    })

    if (user?.email && poolServer.subdomain) {
      sendWelcomeEmail(user.email, poolServer.subdomain, { ip: poolServer.ip, password: poolServer.password }).catch(console.error)
    }

    return NextResponse.json({ ok: true, status: 'assigned', subdomain: poolServer.subdomain })
  }

  // Path B: no pool server — queue
  await db.serverToken.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      status: 'queued',
    },
  })

  if (user?.email) {
    sendQueuedEmail(user.email).catch(console.error)
    sendAdminAlertEmail(user.email, subscription.id).catch(console.error)
  }

  return NextResponse.json({ ok: true, status: 'queued' })
}
