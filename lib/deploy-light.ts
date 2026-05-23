import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initProgress, appendStep } from '@/lib/kv'

interface DeployLightOptions {
  ip: string
  login: string
  password: string
  session_id: string
  githubToken?: string
  serverToken?: string
  subdomainOverride?: string
}

export async function testSSHConnectionLight(ip: string, password: string, timeoutMs = 15000): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()
    ssh.on('ready', () => { ssh.end(); resolve() })
    ssh.on('error', reject)
    ssh.connect({ host: ip, port: 22, username: 'root', password, readyTimeout: timeoutMs })
  })
}

export async function deployLightToServer({
  ip,
  login,
  password,
  session_id,
  githubToken = '',
  serverToken = '',
  subdomainOverride = '',
}: DeployLightOptions) {
  const safeToken = serverToken.replace(/['"\\`$]/g, '')
  const safeSubdomain = subdomainOverride.replace(/['"\\`$]/g, '')
  // GITHUB_DEPLOY_TOKEN is the server-side token for cloning Fractera/ai-workspace (private repo).
  // githubToken from the form is the user's personal token — reserved for future git-sync pre-config.
  const safeGithubToken = (process.env.GITHUB_DEPLOY_TOKEN ?? '').replace(/['"\\`$]/g, '')
  const secret = process.env.INSTALL_SCRIPT_SECRET!

  const bootstrapPath = join(process.cwd(), 'lib', 'bootstrap-light.sh')
  const bootstrapContent = readFileSync(bootstrapPath, 'utf-8')

  await initProgress(session_id)

  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()

    ssh.on('ready', () => {
      appendStep(session_id, { id: 'connect', label: 'Connecting to server', done: true, ts: Date.now() }).catch(() => {})
      ssh.sftp((err, sftp) => {
        if (err) { reject(err); ssh.end(); return }

        const remoteScript = '/tmp/fractera-light-bootstrap.sh'
        const writeStream = sftp.createWriteStream(remoteScript)

        writeStream.on('error', (err: Error) => { reject(err); ssh.end() })

        writeStream.on('close', () => {
          sftp.end()
          // Args: SESSION_ID INSTALL_SECRET GITHUB_TOKEN SERVER_TOKEN SUBDOMAIN_OVERRIDE
          const cmd = [
            `chmod +x ${remoteScript}`,
            `&& setsid bash ${remoteScript}`,
            `"${session_id}" "${secret}" "${safeGithubToken}" "${safeToken}" "${safeSubdomain}"`,
            `> /tmp/fractera-light-install.log 2>&1 < /dev/null &`,
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
