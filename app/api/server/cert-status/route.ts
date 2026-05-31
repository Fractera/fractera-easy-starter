import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendCertExpiryWarningEmail } from '@/lib/email'

// Daily cert-status relay from the customer server (ai-workspace
// scripts/cert-relay.sh). The server reports the FRESH certificate expiry it
// reads off disk (openssl), so this both keeps ServerToken.certExpiresAt in
// sync after auto-renewal AND lets L1 send a single expiry-warning email when
// the cert drops to <= WARN_DAYS. Reuses the same server -> L1 -> email channel
// as /api/server/domain-activated (Bearer SERVER_TOKEN).

const WARN_DAYS = 14
const RESET_DAYS = 30 // expiry farther out than this = cert renewed -> re-arm the warning
const DAY_MS = 86_400_000

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

  let body: { certExpiresAt?: string; domain?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const expiry = body.certExpiresAt ? new Date(body.certExpiresAt) : null
  if (!expiry || Number.isNaN(expiry.getTime())) {
    return NextResponse.json({ error: 'Missing/invalid certExpiresAt' }, { status: 400 })
  }

  // Prefer the domain the server reports; fall back to the stored subdomain.
  const domain = (body.domain ?? '').trim().toLowerCase()
    || (serverToken.subdomain && !serverToken.subdomain.startsWith('ip-') ? serverToken.subdomain : '')

  const daysLeft = Math.floor((expiry.getTime() - Date.now()) / DAY_MS)

  // Decide on the warning email (idempotent, one per cert lifecycle).
  let warned = false
  let nextCertWarnedAt: Date | null | undefined = undefined // undefined = leave column unchanged
  if (daysLeft > RESET_DAYS) {
    // Renewed / plenty of runway — clear any previous warning so the next
    // lifecycle warns again.
    if (serverToken.certWarnedAt) nextCertWarnedAt = null
  } else if (daysLeft <= WARN_DAYS && !serverToken.certWarnedAt && domain && serverToken.user.email) {
    try {
      await sendCertExpiryWarningEmail(serverToken.user.email, Math.max(daysLeft, 0), domain)
      warned = true
      nextCertWarnedAt = new Date()
    } catch (e) {
      console.error('[cert-status] warning email failed:', e)
    }
  }

  await db.serverToken.update({
    where: { token },
    data: {
      certExpiresAt: expiry,
      ...(nextCertWarnedAt !== undefined ? { certWarnedAt: nextCertWarnedAt } : {}),
    },
  })

  return NextResponse.json({ ok: true, daysLeft, warned })
}
