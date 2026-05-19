import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sponsorships = await db.sponsorship.findMany({
    orderBy: [{ tier: 'asc' }, { lastPaymentAt: 'desc' }],
    include: { user: { select: { email: true } } },
  })

  const rows = sponsorships.map(s => ({
    id: s.id,
    tier: s.tier,
    email: s.user.email,
    status: s.status,
    firstPaymentAt: s.firstPaymentAt,
    lastPaymentAt: s.lastPaymentAt,
    paymentsCount: s.paymentsCount,
    createdAt: s.createdAt,
  }))

  return NextResponse.json(rows)
}
