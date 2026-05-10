import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return new Response(null, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Pass ?email=user@example.com' }, { status: 400 })
  }

  const user = await db.user.findFirst({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const [subscriptions, serverTokens, poolStatus] = await Promise.all([
    db.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    db.serverToken.findMany({
      where: { userId: user.id },
      include: {
        subscription: { select: { id: true, stripeSubscriptionId: true, status: true, planId: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.vpsReserve.count({ where: { status: 'ready' } }),
  ])

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    subscriptions,
    serverTokens: serverTokens.map(t => ({
      id: t.id,
      status: t.status,
      subdomain: t.subdomain,
      serverIp: t.serverIp,
      createdAt: t.createdAt,
      subscriptionId: t.subscriptionId,
      subscription: t.subscription,
    })),
    poolReadyCount: poolStatus,
  })
}
