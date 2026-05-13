import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const servers = await db.serverToken.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      subdomain: true,
      deploySessionId: true,
      createdAt: true,
      serverIp: true,
      serverPassword: true,
      whiteLabelActive: true,
      subscription: {
        select: {
          id: true,
          stripeSubscriptionId: true,
          currentPeriodEnd: true,
          status: true,
          planId: true,
        },
      },
    },
  })

  return NextResponse.json({
    servers: servers.map(s => ({
      id: s.id,
      status: s.status,
      subdomain: s.subdomain,
      deploySessionId: s.deploySessionId,
      createdAt: s.createdAt,
      serverIp: s.serverIp,
      serverPassword: s.serverPassword,
      whiteLabelActive: s.whiteLabelActive,
      subscription: s.subscription,
    })),
  })
}
