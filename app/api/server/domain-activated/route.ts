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

  let body: { domain?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const domain = (body.domain ?? '').trim().toLowerCase()
  if (!domain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 })
  }

  await db.serverToken.update({
    where: { token },
    data: { subdomain: domain },
  })

  if (serverToken.user.email) {
    sendDomainActivatedEmail(serverToken.user.email, domain).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
