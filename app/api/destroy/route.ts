import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
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

export async function POST(req: NextRequest) {
  const { ip, login, password, domain } = await req.json()

  if (!ip || !login || !password) {
    return NextResponse.json({ error: 'Missing ip, login or password' }, { status: 400 })
  }

  await new Promise<void>((resolve, reject) => {
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

    ssh.connect({
      host: ip,
      port: 22,
      username: login,
      password,
      readyTimeout: 20000,
    })
  })

  if (domain) {
    await deleteDnsRecord(domain).catch(() => {})
  }

  return NextResponse.json({ status: 'destroyed' })
}
