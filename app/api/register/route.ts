import { NextRequest, NextResponse } from 'next/server'
import { createDnsRecord } from '@/lib/cloudflare'
import { generateSubdomain } from '@/lib/subdomain'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { ip, session_id } = body

  if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return NextResponse.json({ error: 'Invalid IP address' }, { status: 400 })
  }

  const subdomain = generateSubdomain()
  const fullDomain = `${subdomain}.fractera.ai`

  await createDnsRecord(ip, subdomain)

  return NextResponse.json({
    subdomain: fullDomain,
    session_id,
  })
}
