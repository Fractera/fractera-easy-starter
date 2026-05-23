import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const PAGE_SIZE = 100

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1)
  const skip = (page - 1) * PAGE_SIZE

  const where = q
    ? { email: { contains: q, mode: 'insensitive' as const } }
    : {}

  const [total, rows] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: { select: { serverTokens: true, sponsorships: true } },
        partner: { select: { slug: true } },
        referredByPartnerId: true,
      },
    }),
  ])

  return NextResponse.json({
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    rows,
  })
}
