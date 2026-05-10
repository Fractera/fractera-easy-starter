import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteDnsRecord } from '@/lib/cloudflare'

export const maxDuration = 60

const DESTROY_SCRIPT = `
pm2 delete all 2>/dev/null || true
rm -rf /opt/fractera
rm -rf /etc/fractera
rm -rf /root/.gemini /root/.claude /root/.config/openai /root/.openai /root/.config/qwen-code /root/.qwen /root/.config/kimi-cli /root/.kimi /root/.local/share/kimi-cli /root/.local/share/kimi 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/fractera
rm -f /etc/nginx/sites-available/fractera
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
echo "DESTROYED"
`

async function sshDestroy(ip: string, login: string, password: string) {
  return new Promise<void>((resolve, reject) => {
    const ssh = new Client()
    ssh.on('ready', () => {
      ssh.exec(DESTROY_SCRIPT, (err, stream) => {
        if (err) { reject(err); ssh.end(); return }
        stream.on('close', () => { ssh.end(); resolve() })
        stream.on('data', () => {})
        stream.stderr.on('data', () => {})
      })
    })
    ssh.on('error', reject)
    ssh.connect({ host: ip, port: 22, username: login, password, readyTimeout: 20000 })
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { serverId } = await req.json()
  if (!serverId) {
    return NextResponse.json({ error: 'Missing serverId' }, { status: 400 })
  }

  const serverToken = await db.serverToken.findFirst({
    where: { id: serverId, userId: session.user.id },
  })

  if (!serverToken) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ip = serverToken.serverIp
  const login = 'root'
  const password = serverToken.serverPassword

  // SSH cleanup — fire-and-forget if server is already gone
  if (ip && password) {
    await sshDestroy(ip, login, password).catch(() => {})
  }

  // DNS cleanup for all 4 subdomains
  if (serverToken.subdomain) {
    const base = serverToken.subdomain.replace(/\.fractera\.ai$/, '')
    await Promise.all([
      deleteDnsRecord(serverToken.subdomain).catch(() => {}),
      deleteDnsRecord(`auth.${base}.fractera.ai`).catch(() => {}),
      deleteDnsRecord(`admin.${base}.fractera.ai`).catch(() => {}),
      deleteDnsRecord(`data.${base}.fractera.ai`).catch(() => {}),
    ])
  }

  // Mark server as offline
  await db.serverToken.update({
    where: { id: serverToken.id },
    data: { status: 'offline' },
  })

  return NextResponse.json({ ok: true })
}
