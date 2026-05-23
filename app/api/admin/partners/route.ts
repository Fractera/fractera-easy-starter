import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const rows = await db.partner.findMany({
    where: q
      ? {
          OR: [
            { slug: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
            { companyEmail: { contains: q, mode: 'insensitive' } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      status: true,
      companyName: true,
      companyEmail: true,
      createdAt: true,
      user: { select: { email: true } },
      _count: { select: { referrals: true } },
    },
  })
  return NextResponse.json({ total: rows.length, rows })
}
