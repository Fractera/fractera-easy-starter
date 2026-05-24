import { NextRequest, NextResponse } from 'next/server'
import { createDnsRecord } from '@/lib/cloudflare'
import { generateSubdomain } from '@/lib/subdomain'

// Light-specific subdomain registration. Mirrors /api/register but wraps
// the generated name with a `light-` prefix so Light deployments live at
// e.g. `light-pure-deer-75.fractera.ai`. The shared /api/register endpoint
// (frozen infrastructure) is left untouched on purpose.
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

  const subdomain = `light-${generateSubdomain()}`
  const fullDomain = `${subdomain}.fractera.ai`

  await createDnsRecord(ip, subdomain)

  return NextResponse.json({
    subdomain: fullDomain,
    session_id,
  })
}
