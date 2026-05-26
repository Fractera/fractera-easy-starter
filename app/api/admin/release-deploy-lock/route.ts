import { NextRequest, NextResponse } from 'next/server'
import { releaseDeployLock } from '@/lib/deploy-lock'

// Admin-only endpoint to force-release a stuck Redis deploy lock.
// Use when a previous bootstrap was killed and the 20-min NX TTL is still
// blocking a fresh deploy attempt on the same IP.
// Auth: x-install-secret header (same secret as bootstrap scripts use).
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { ip?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const ip = typeof body.ip === 'string' ? body.ip.trim() : ''
  if (!ip) {
    return NextResponse.json({ error: 'Missing ip' }, { status: 400 })
  }

  await releaseDeployLock(ip)
  console.log(`[admin/release-deploy-lock] released deploy-lock:${ip}`)
  return NextResponse.json({ ok: true, ip })
}
