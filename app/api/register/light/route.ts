import { NextRequest, NextResponse } from 'next/server'
import { createDnsRecord } from '@/lib/cloudflare'
import { generateSubdomain } from '@/lib/subdomain'

export async function POST(req: NextRequest) {
  const TAG = '[register/light]'
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { ip?: unknown; session_id?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const ip = typeof body.ip === 'string' ? body.ip.trim() : ''
  const session_id = typeof body.session_id === 'string' ? body.session_id : ''

  if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return NextResponse.json({ error: 'Invalid IP address' }, { status: 400 })
  }

  const hasZone = Boolean(process.env.CLOUDFLARE_ZONE_ID)
  const hasToken = Boolean(process.env.CLOUDFLARE_API_TOKEN)
  console.log(`${TAG} hasZone=${hasZone} hasToken=${hasToken} ip=${ip} session=${session_id}`)
  if (!hasZone || !hasToken) {
    const envErr = `Cloudflare env missing: zoneId=${hasZone} token=${hasToken}`
    console.error(`${TAG} ${envErr}`)
    return NextResponse.json({ error: envErr, code: 'CF_ENV_MISSING' }, { status: 500 })
  }

  const subdomain = `light-${generateSubdomain()}`
  const fullDomain = `${subdomain}.fractera.ai`

  try {
    await createDnsRecord(ip, subdomain)
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`${TAG} createDnsRecord failed for ${fullDomain}:`, errMsg)
    return NextResponse.json({ error: `Cloudflare DNS failed: ${errMsg}`, code: 'CF_DNS_FAIL', subdomain: fullDomain }, { status: 500 })
  }

  console.log(`${TAG} success ${fullDomain} -> ${ip}`)
  return NextResponse.json({
    subdomain: fullDomain,
    session_id,
  })
}
