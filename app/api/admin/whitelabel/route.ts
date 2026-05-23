import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const where: Record<string, unknown> = { productType: 'white_label' }
  if (q) {
    where.OR = [
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { serverSubdomain: { contains: q, mode: 'insensitive' } },
      { serverIp: { contains: q, mode: 'insensitive' } },
    ]
  }
  const rows = await db.purchase.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      serverIp: true,
      serverSubdomain: true,
      stripePaymentId: true,
      user: { select: { email: true } },
      serverToken: { select: { token: true, subdomain: true, status: true, whiteLabelActive: true } },
    },
  })
  const totalRevenue = rows.length * 100
  return NextResponse.json({ total: rows.length, totalRevenue, rows })
}
