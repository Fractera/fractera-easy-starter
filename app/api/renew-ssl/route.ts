import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'

export const maxDuration = 60

const RENEW_SCRIPT = `certbot renew --force-renewal 2>&1 | tail -20 && systemctl reload nginx 2>/dev/null; echo "SSL_DONE"`

export async function POST(req: NextRequest) {
  const { ip, login, password } = await req.json()
  if (!ip || !login || !password)
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

  try {
    const output = await new Promise<string>((resolve, reject) => {
      const ssh = new Client()
      ssh.on('ready', () => {
        ssh.exec(RENEW_SCRIPT, (err, stream) => {
          if (err) { reject(err); ssh.end(); return }
          let out = ''
          stream.on('data', (d: Buffer) => { out += d.toString() })
          stream.stderr.on('data', (d: Buffer) => { out += d.toString() })
          stream.on('close', () => { ssh.end(); resolve(out) })
        })
      })
      ssh.on('error', reject)
      ssh.connect({ host: ip, port: 22, username: login, password, readyTimeout: 20000 })
    })

    const ok = output.includes('SSL_DONE')
    return NextResponse.json({ ok, log: output.slice(-500) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
