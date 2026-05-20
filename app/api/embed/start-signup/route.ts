import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function generateEmbedToken(): string {
  return randomBytes(24).toString('base64url') // 32-char URL-safe random token
}

export async function POST(req: Request) {
  let body: { email?: unknown; ref?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const ref = typeof body.ref === 'string' ? body.ref.trim() : null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  let partnerId: string | null = null
  if (ref) {
    const partner = await db.partner.findUnique({
      where: { slug: ref },
      select: { id: true, status: true },
    })
    if (partner && partner.status === 'active') partnerId = partner.id
  }

  const session = await db.embedSession.create({
    data: {
      token: generateEmbedToken(),
      email,
      partnerId,
      status: 'pending',
    },
    select: { token: true },
  })

  return NextResponse.json({ embedToken: session.token })
}
