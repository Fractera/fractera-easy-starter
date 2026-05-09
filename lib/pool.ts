import { db } from '@/lib/db'

export async function getPoolStatus(): Promise<{ available: number }> {
  const available = await db.vpsReserve.count({ where: { status: 'ready' } })
  return { available }
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
  const server = await db.vpsReserve.findFirst({
    where: { status: 'ready' },
    orderBy: { createdAt: 'asc' },
  })
  if (!server) throw new Error('NO_SERVERS_AVAILABLE')

  const serverToken = await db.serverToken.findUnique({
    where: { id: serverTokenId },
    include: { user: { select: { id: true } } },
  })
  if (!serverToken) throw new Error('SERVER_TOKEN_NOT_FOUND')

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

  return { ip: server.ip, subdomain: server.subdomain }
}
