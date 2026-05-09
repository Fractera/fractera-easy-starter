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

  const serverTokenId = req.nextUrl.searchParams.get('serverTokenId')
  if (!serverTokenId) return NextResponse.json({ error: 'serverTokenId required' }, { status: 400 })

  const attempts = await db.deployAttempt.findMany({
    where: { serverTokenId },
    orderBy: { startedAt: 'asc' },
  })

  return NextResponse.json(attempts)
}
