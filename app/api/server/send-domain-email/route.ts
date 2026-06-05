import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendDomainActivatedEmail } from '@/lib/email'

// Manual "email me my subdomain list" trigger, invoked by a customer server's
// admin panel (Personal Domain wizard) when the user presses the button.
//
// The server sends its own IP + domain. We resolve the owner by IP: one account
// can have many servers/IPs, so we find the most recent ServerToken for this IP
// and email that user. This is deliberately IP-based (not per-server-token based)
// so the button works even when a server's SERVER_TOKEN is out of sync. The
// recipient is always the resolved owner — never attacker-controlled — and the
// body is the fixed domain-activated template.
export async function POST(req: NextRequest) {
  let body: { ip?: string; domain?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const ip = (body.ip ?? '').trim()
  const domain = (body.domain ?? '').trim().toLowerCase()
  if (!ip || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return NextResponse.json({ error: 'Missing or invalid ip' }, { status: 400 })
  }
  if (!domain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 })
  }

  // Most recent ServerToken for this IP (the IP may have been redeployed
  // several times — newest wins), with its owner.
  const serverToken = await db.serverToken.findFirst({
    where: { serverIp: ip },
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })

  if (!serverToken || !serverToken.user?.email) {
    return NextResponse.json({ error: 'No account found for this server IP.' }, { status: 404 })
  }

  // Best-effort: record the domain on this token so the dashboard reflects it.
  try {
    await db.serverToken.update({ where: { id: serverToken.id }, data: { subdomain: domain } })
  } catch { /* non-fatal */ }

  try {
    await sendDomainActivatedEmail(serverToken.user.email, domain)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send email', detail: String(e) }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
