import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendDomainActivatedEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const serverToken = await db.serverToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!serverToken) {
    return NextResponse.json({ error: 'Unknown token' }, { status: 401 })
  }

  let body: { domain?: string; certExpiresAt?: string | null }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const domain = (body.domain ?? '').trim().toLowerCase()
  if (!domain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 })
  }

  // Optional TLS cert expiry (ISO string) reported by the customer server.
  // Parse defensively — a malformed value just leaves the column untouched.
  let certExpiresAt: Date | undefined
  if (body.certExpiresAt) {
    const d = new Date(body.certExpiresAt)
    if (!Number.isNaN(d.getTime())) certExpiresAt = d
  }

  await db.serverToken.update({
    where: { token },
    data: {
      subdomain: domain,
      ...(certExpiresAt ? { certExpiresAt } : {}),
    },
  })

  if (serverToken.user.email) {
    sendDomainActivatedEmail(serverToken.user.email, domain).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
