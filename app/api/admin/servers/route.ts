import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  if (search) {
    const user = await db.user.findFirst({ where: { email: search } })
    if (!user) return NextResponse.json([])
    const tokens = await db.serverToken.findMany({
      where: { userId: user.id, status: { not: 'queued' } },
      include: { subscription: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tokens.map(t => ({
      id: t.id,
      email: search,
      ip: t.serverIp,
      paidAt: t.createdAt,
      subdomain: t.subdomain,
      status: t.status,
    })))
  }

  if (status === 'queued') {
    const tokens = await db.serverToken.findMany({
      where: { status: 'queued' },
      include: { user: { select: { email: true } }, subscription: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(tokens.map(t => ({
      id: t.id,
      email: t.user.email,
      planId: t.subscription?.planId,
      paidAt: t.createdAt,
    })))
  }

  // Проблемные деплои: status=error ИЛИ pending с admin-редеплоем ИЛИ зависший первый деплой (>30 мин без subdomain)
  if (status === 'deploy-issues') {
    const staleThreshold = new Date(Date.now() - 30 * 60 * 1000)
    const tokens = await db.serverToken.findMany({
      where: {
        OR: [
          { status: 'error' },
          { status: 'pending', deployAttempts: { some: { triggeredBy: 'admin' } } },
          { status: 'pending', subdomain: null, createdAt: { lt: staleThreshold } },
        ],
      },
      include: {
        user: { select: { email: true } },
        deployAttempts: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tokens.map(t => ({
      id: t.id,
      email: t.user?.email ?? null,
      status: t.status,
      serverIp: t.serverIp,
      serverPassword: t.serverPassword,
      deployError: t.deployError,
      createdAt: t.createdAt,
      latestAttempt: t.deployAttempts[0] ?? null,
    })))
  }

  // Старый маршрут — оставляем для обратной совместимости
  if (status === 'error') {
    const tokens = await db.serverToken.findMany({
      where: { status: 'error' },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tokens.map(t => ({
      id: t.id,
      email: t.user?.email ?? null,
      serverIp: t.serverIp,
      serverPassword: t.serverPassword,
      deployError: t.deployError,
      createdAt: t.createdAt,
    })))
  }

  const statuses = status ? status.split(',') : ['available', 'pending_payment']
  const servers = await db.vpsReserve.findMany({
    where: { status: { in: statuses } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(servers)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { ip, login = 'root', password, activatedAt, paidAmount, expiresAt } = body

  if (!ip || !password) return NextResponse.json({ error: 'ip and password required' }, { status: 400 })

  const server = await db.vpsReserve.create({
    data: {
      ip,
      login,
      password,
      activatedAt: activatedAt ? new Date(activatedAt) : new Date(),
      paidAmount: paidAmount ? parseFloat(paidAmount) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })
  return NextResponse.json(server, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, status } = body

  if (!id || status !== 'available') return NextResponse.json({ error: 'id and status=available required' }, { status: 400 })

  const server = await db.vpsReserve.update({
    where: { id },
    data: { status: 'available', assignedUserId: null, assignedAt: null, reservedUntil: null },
  })
  return NextResponse.json(server)
}
