import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subdomain, serverIp } = await req.json().catch(() => ({})) as {
    subdomain?: string
    serverIp?: string
  }
  if (!subdomain) return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 })

  const userId = session.user.id

  // Idempotent — return existing token if already registered
  const existing = await db.serverToken.findFirst({ where: { userId, subdomain } })
  if (existing) return NextResponse.json({ serverTokenId: existing.id })

  const sub = await db.subscription.create({
    data: {
      userId,
      stripeCustomerId: 'free',
      status: 'active',
      planId: 'free',
      currentPeriodEnd: new Date('2099-01-01'),
    },
  })

  const token = await db.serverToken.create({
    data: {
      userId,
      subscriptionId: sub.id,
      status: 'active',
      subdomain,
      serverIp: serverIp ?? null,
    },
  })

  return NextResponse.json({ serverTokenId: token.id })
}
