import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initProgress } from '@/lib/kv'

export const maxDuration = 30

function generateSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function POST(req: NextRequest) {
  const { ip, login, password } = await req.json()

  if (!ip || !login || !password) {
    return NextResponse.json({ error: 'Missing ip, login or password' }, { status: 400 })
  }

  const secret = process.env.INSTALL_SCRIPT_SECRET!
  const session_id = generateSessionId()

  const bootstrapPath = join(process.cwd(), 'lib', 'bootstrap.sh')
  const bootstrapContent = readFileSync(bootstrapPath, 'utf-8')

  await initProgress(session_id)

  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()

    ssh.on('ready', () => {
      ssh.sftp((err, sftp) => {
        if (err) { reject(err); ssh.end(); return }

        const writeStream = sftp.createWriteStream('/tmp/fractera-bootstrap.sh')
        writeStream.write(bootstrapContent)
        writeStream.end()

        writeStream.on('close', () => {
          const cmd = `chmod +x /tmp/fractera-bootstrap.sh && nohup bash /tmp/fractera-bootstrap.sh "${session_id}" "${secret}" > /tmp/fractera-install.log 2>&1 &`
          ssh.exec(cmd, (err, stream) => {
            if (err) { reject(err); ssh.end(); return }
            stream.on('close', () => { ssh.end(); resolve() })
            stream.on('data', () => {})
            stream.stderr.on('data', () => {})
          })
        })

        writeStream.on('error', (err: Error) => { reject(err); ssh.end() })
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

  return NextResponse.json({ session_id, status: 'installing' })
}
