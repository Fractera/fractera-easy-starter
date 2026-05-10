import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'
import { initProgress } from '@/lib/kv'

export const maxDuration = 300

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') return null
  return session
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { vpsReserveId } = await req.json()
  if (!vpsReserveId) return NextResponse.json({ error: 'vpsReserveId required' }, { status: 400 })

  const reserve = await db.vpsReserve.findUnique({ where: { id: vpsReserveId } })
  if (!reserve) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (reserve.status !== 'available') {
    return NextResponse.json({ error: `Cannot provision server with status '${reserve.status}'` }, { status: 409 })
  }

  const adminUser = await db.user.findUnique({ where: { email: 'admin@fractera.ai' } })
  if (!adminUser) return NextResponse.json({ error: 'Admin user not found' }, { status: 500 })

  const deploySessionId = `pool-${vpsReserveId}-${Date.now()}`

  const tempToken = await db.serverToken.create({
    data: {
      userId: adminUser.id,
      status: 'pending',
      deploySessionId,
      serverIp: reserve.ip,
      serverPassword: reserve.password,
    },
  })

  await db.vpsReserve.update({
    where: { id: vpsReserveId },
    data: { status: 'provisioning', provisioningServerTokenId: tempToken.id },
  })

  await initProgress(deploySessionId)

  try {
    await deployToServer({
      ip: reserve.ip,
      login: reserve.login,
      password: reserve.password,
      session_id: deploySessionId,
      platform: 'claude-code',
      serverToken: tempToken.token,
      subdomainOverride: reserve.subdomain ?? undefined,
    })
  } catch (err) {
    const errMsg = String(err)
    await db.vpsReserve.update({
      where: { id: vpsReserveId },
      data: { status: 'available', provisioningServerTokenId: null },
    }).catch(() => {})
    await db.serverToken.update({
      where: { id: tempToken.id },
      data: { status: 'error', deployError: errMsg },
    }).catch(() => {})
    return NextResponse.json({ error: 'SSH failed', detail: errMsg }, { status: 500 })
  }

  return NextResponse.json({ ok: true, deploySessionId, serverTokenId: tempToken.id })
}
