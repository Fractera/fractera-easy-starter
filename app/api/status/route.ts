import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'

export const maxDuration = 30

const STATUS_CMD =
  'test -f /opt/fractera/app/.env.local ' +
  '&& grep NEXT_PUBLIC_MEDIA_URL /opt/fractera/app/.env.local ' +
  '|| echo NOT_INSTALLED'

function parseSubdomain(line: string): string | null {
  const match = line.match(/https?:\/\/([^/]+)/)
  return match ? match[1] : null
}

export async function POST(req: NextRequest) {
  const { ip, login, password } = await req.json()
  if (!ip || !login || !password)
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

  try {
    const output = await new Promise<string>((resolve, reject) => {
      const ssh = new Client()
      ssh.on('ready', () => {
        ssh.exec(STATUS_CMD, (err, stream) => {
          if (err) { reject(err); ssh.end(); return }
          let out = ''
          stream.on('data', (d: Buffer) => { out += d.toString() })
          stream.stderr.on('data', () => {})
          stream.on('close', () => { ssh.end(); resolve(out) })
        })
      })
      ssh.on('error', reject)
      ssh.connect({ host: ip, port: 22, username: login, password, readyTimeout: 15000 })
    })

    const trimmed = output.trim()
    if (!trimmed || trimmed === 'NOT_INSTALLED')
      return NextResponse.json({ installed: false })

    const subdomain = parseSubdomain(trimmed)
    return NextResponse.json({ installed: true, subdomain: subdomain ?? undefined })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ installed: false, sshError: message })
  }
}
