import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') ?? ''
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const session = await db.embedSession.findUnique({
    where: { token },
    select: { status: true, userId: true, email: true },
  })

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    status: session.status,
    activated: session.status !== 'pending',
    email: session.email,
  })
}
