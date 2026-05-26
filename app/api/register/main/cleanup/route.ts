import { NextRequest, NextResponse } from 'next/server'
import { deleteDnsRecord } from '@/lib/cloudflare'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { subdomain?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const subdomain = typeof body.subdomain === 'string' ? body.subdomain.trim() : ''
  if (!subdomain || !subdomain.endsWith('.fractera.ai')) {
    return NextResponse.json({ error: 'Invalid subdomain' }, { status: 400 })
  }

  if (!subdomain.startsWith('main-')) {
    return NextResponse.json({ error: 'Only main-* subdomains can be cleaned up' }, { status: 403 })
  }

  try {
    await deleteDnsRecord(subdomain)
    return NextResponse.json({ ok: true, deleted: subdomain })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
