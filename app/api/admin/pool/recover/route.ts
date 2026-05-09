import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Client } from 'ssh2'

export const maxDuration = 60

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') return null
  return session
}

function sshExec(ip: string, password: string, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ssh = new Client()
    let output = ''
    ssh.on('ready', () => {
      ssh.exec(cmd, (err, stream) => {
        if (err) { ssh.end(); reject(err); return }
        stream.on('data', (d: Buffer) => { output += d.toString() })
        stream.stderr.on('data', (d: Buffer) => { output += d.toString() })
        stream.on('close', () => { ssh.end(); resolve(output) })
      })
    })
    ssh.on('error', reject)
    ssh.connect({ host: ip, port: 22, username: 'root', password, readyTimeout: 15000 })
  })
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
    return NextResponse.json({ error: `Server status is '${reserve.status}', expected 'provisioning'` }, { status: 409 })
  }

  const tempToken = reserve.provisioningServerTokenId
    ? await db.serverToken.findUnique({ where: { id: reserve.provisioningServerTokenId } })
    : null

  const sessionId = tempToken?.deploySessionId ?? ''
  const logPath = sessionId ? `/tmp/fractera-install-${sessionId}.log` : ''

  if (!sessionId || !logPath) {
    return NextResponse.json({ ok: false, reason: 'no_session', message: 'No provisioning session found' })
  }

  let subdomain: string | null = null

  // Only read the session-specific log — never the generic /tmp/fractera-install.log
  // (the generic log may contain FRACTERA_READY from previous unrelated bootstrap runs)
  try {
    const logOutput = await sshExec(reserve.ip, reserve.password, `grep "FRACTERA_READY" "${logPath}" 2>/dev/null || true`)
    const match = logOutput.match(/FRACTERA_READY:\s*https?:\/\/(\S+)/)
    if (match) subdomain = match[1]
  } catch {
    return NextResponse.json({ ok: false, reason: 'ssh_failed', message: 'Cannot connect to server via SSH' })
  }

  if (!subdomain) {
    return NextResponse.json({ ok: false, reason: 'not_ready', message: 'Bootstrap not yet complete or log not found' })
  }

  await db.vpsReserve.update({
    where: { id: reserve.id },
    data: { status: 'ready', subdomain },
  })

  if (tempToken) {
    await db.serverToken.update({
      where: { id: tempToken.id },
      data: { status: 'active', subdomain },
    })
  }

  return NextResponse.json({ ok: true, subdomain })
}
