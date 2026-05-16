import { db } from '@/lib/db'

export async function getPoolStatus(): Promise<{ available: number }> {
  const available = await db.vpsReserve.count({ where: { status: 'ready' } })
  return { available }
}

// Return the user's existing non-expired pending_payment reservation, if any.
// Used by checkout / webhook / reassign / assignServerToQueued to avoid
// orphaning a previously-reserved server when a second flow attempt happens
// (e.g. drawer remount, page refresh, retry).
export async function findActiveReserveForUser(userId: string) {
  return db.vpsReserve.findFirst({
    where: {
      assignedUserId: userId,
      status: 'pending_payment',
      OR: [
        { reservedUntil: null },
        { reservedUntil: { gt: new Date() } },
      ],
    },
    orderBy: { assignedAt: 'desc' },
  })
}

export async function reserveServer(userId: string, reservedUntil: Date) {
  const server = await db.vpsReserve.findFirst({
    where: { status: 'ready' },
    orderBy: { createdAt: 'asc' },
  })
  if (!server) throw new Error('NO_SERVERS_AVAILABLE')

  return db.vpsReserve.update({
    where: { id: server.id },
    data: { status: 'pending_payment', assignedUserId: userId, assignedAt: new Date(), reservedUntil },
  })
}

export async function releaseServer(vpsReserveId: string) {
  return db.vpsReserve.update({
    where: { id: vpsReserveId },
    data: { status: 'ready', assignedUserId: null, assignedAt: null, reservedUntil: null },
  })
}

export async function confirmServerPayment(vpsReserveId: string) {
  return db.vpsReserve.update({
    where: { id: vpsReserveId },
    data: { status: 'paid', paidAt: new Date(), reservedUntil: null },
  })
}

export async function assignServerToQueued(serverTokenId: string) {
  const serverToken = await db.serverToken.findUnique({
    where: { id: serverTokenId },
    include: { user: { select: { id: true } } },
  })
  if (!serverToken) throw new Error('SERVER_TOKEN_NOT_FOUND')

  // Prefer the user's own hanging reservation over a random ready server
  // (otherwise admin manual assign leaves the user's pending_payment server
  // orphaned and the user gets a different one).
  let server = await findActiveReserveForUser(serverToken.user.id)
  if (!server) {
    server = await db.vpsReserve.findFirst({
      where: { status: 'ready' },
      orderBy: { createdAt: 'asc' },
    })
  }
  if (!server) throw new Error('NO_SERVERS_AVAILABLE')

  await db.vpsReserve.update({
    where: { id: server.id },
    data: {
      status: 'paid',
      paidAt: new Date(),
      assignedUserId: serverToken.user.id,
      assignedAt: new Date(),
    },
  })

  await db.serverToken.update({
    where: { id: serverTokenId },
    data: {
      serverIp: server.ip,
      serverPassword: server.password,
      subdomain: server.subdomain ?? undefined,
      status: 'active',
    },
  })

  return { ip: server.ip, subdomain: server.subdomain, password: server.password }
}
