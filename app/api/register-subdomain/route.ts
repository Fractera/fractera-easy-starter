import { NextRequest, NextResponse } from 'next/server'
import { createDnsRecord } from '@/lib/cloudflare'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ip, subdomain } = await req.json()
  // subdomain = "auth.happy-wolf-86" (без .fractera.ai)
  if (!ip || !subdomain) {
    return NextResponse.json({ error: 'ip and subdomain required' }, { status: 400 })
  }

  await createDnsRecord(ip, subdomain)

  return NextResponse.json({ domain: `${subdomain}.fractera.ai` })
}
