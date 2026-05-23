import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const VALID_TIERS = ['s1', 's5', 's20']

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tier = req.nextUrl.searchParams.get('tier')?.trim() ?? ''
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  const where: Record<string, unknown> = {}
  if (tier && VALID_TIERS.includes(tier)) where.tier = tier
  if (q) where.user = { email: { contains: q, mode: 'insensitive' } }

  const sponsorships = await db.sponsorship.findMany({
    where,
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
