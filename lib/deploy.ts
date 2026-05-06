import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initProgress } from '@/lib/kv'

interface DeployOptions {
  ip: string
  login: string
  password: string
  session_id: string
  platform?: string
  serverToken?: string
}

export async function deployToServer({
  ip,
  login,
  password,
  session_id,
  platform = 'claude-code',
  serverToken = '',
}: DeployOptions) {
  const safePlatform = /^[a-z0-9-]+$/.test(platform) ? platform : 'claude-code'
  const safeToken = serverToken.replace(/['"\\`$]/g, '')
  const secret = process.env.INSTALL_SCRIPT_SECRET!

  const bootstrapPath = join(process.cwd(), 'lib', 'bootstrap.sh')
  const bootstrapContent = readFileSync(bootstrapPath, 'utf-8')

  await initProgress(session_id)

  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()

    ssh.on('ready', () => {
      ssh.sftp((err, sftp) => {
        if (err) { reject(err); ssh.end(); return }

        const remoteScript = '/tmp/fractera-bootstrap.sh'
        const writeStream = sftp.createWriteStream(remoteScript)

        writeStream.on('error', (err: Error) => { reject(err); ssh.end() })

        writeStream.on('close', () => {
          sftp.end()
          const cmd = [
            `chmod +x ${remoteScript}`,
            `&& setsid bash ${remoteScript}`,
            `"${session_id}" "${secret}" "${safePlatform}" "${safeToken}"`,
            `> /tmp/fractera-install.log 2>&1 < /dev/null &`,
          ].join(' ')

          ssh.exec(cmd, (err, stream) => {
            if (err) { reject(err); ssh.end(); return }
            stream.on('close', () => { ssh.end(); resolve() })
            stream.on('data', () => {})
            stream.stderr.on('data', () => {})
          })
        })

        writeStream.end(bootstrapContent)
      })
    })

    ssh.on('error', reject)

    ssh.connect({ host: ip, port: 22, username: login, password, readyTimeout: 20000 })
  })

  return { session_id, status: 'installing' }
}
