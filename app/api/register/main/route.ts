import { NextRequest, NextResponse } from 'next/server'
import { createDnsRecord, findMainDnsRecordByIp } from '@/lib/cloudflare'
import { generateSubdomain } from '@/lib/subdomain'

export async function POST(req: NextRequest) {
  const TAG = '[register/main]'
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
  if (!hasZone || !hasToken) {
    return NextResponse.json({ error: `Cloudflare env missing: zoneId=${hasZone} token=${hasToken}` }, { status: 500 })
  }

  const existingDomain = await findMainDnsRecordByIp(ip)
  const subdomain = existingDomain
    ? existingDomain.replace(/\.fractera\.ai$/, '')
    : `main-${generateSubdomain()}`
  const fullDomain = `${subdomain}.fractera.ai`
  if (existingDomain) {
    console.log(`${TAG} reusing existing subdomain: ${subdomain} for IP ${ip}`)
  }

  try {
    await createDnsRecord(ip, subdomain)
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`${TAG} createDnsRecord failed for ${fullDomain}:`, errMsg)
    return NextResponse.json({ error: `Cloudflare DNS failed: ${errMsg}` }, { status: 500 })
  }

  console.log(`${TAG} success ${fullDomain} -> ${ip}`)
  return NextResponse.json({ subdomain: fullDomain, session_id })
}
