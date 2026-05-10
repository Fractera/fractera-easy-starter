import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') return null
  return session
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { vpsReserveId } = await req.json()
  if (!vpsReserveId) return NextResponse.json({ error: 'vpsReserveId required' }, { status: 400 })

  const reserve = await db.vpsReserve.findUnique({ where: { id: vpsReserveId } })
  if (!reserve) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (reserve.status !== 'provisioning') {
    return NextResponse.json({ error: `Status is '${reserve.status}', expected 'provisioning'` }, { status: 409 })
  }

  if (reserve.provisioningServerTokenId) {
    await db.serverToken.delete({ where: { id: reserve.provisioningServerTokenId } }).catch(() => {})
  }

  await db.vpsReserve.update({
    where: { id: reserve.id },
    data: { status: 'available', provisioningServerTokenId: null },
    // subdomain is kept intentionally: next Bootstrap will use subdomainOverride
    // to skip Cloudflare re-registration (see provision route)
  })

  return NextResponse.json({ ok: true })
}
