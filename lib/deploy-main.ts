import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initProgress, appendStep } from '@/lib/kv'

interface DeployMainOptions {
  ip: string
  login: string
  password: string
  session_id: string
  githubToken?: string
  serverToken?: string
  subdomainOverride?: string
}

export async function deployMainToServer({
  ip,
  login,
  password,
  session_id,
  githubToken = '',
  serverToken = '',
  subdomainOverride = '',
}: DeployMainOptions) {
  const safeToken = serverToken.replace(/['"\\`$]/g, '')
  const safeSubdomain = subdomainOverride.replace(/['"\\`$]/g, '')
  const safeGithubToken = (process.env.GITHUB_DEPLOY_TOKEN ?? '').replace(/['"\\`$]/g, '')
  const secret = process.env.INSTALL_SCRIPT_SECRET!

  const bootstrapPath = join(process.cwd(), 'lib', 'bootstrap-main.sh')
  const bootstrapContent = readFileSync(bootstrapPath, 'utf-8')

  await initProgress(session_id)

  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()

    ssh.on('ready', () => {
      appendStep(session_id, { id: 'connect', label: 'Connecting to server', done: true, ts: Date.now() }).catch(() => {})
      ssh.sftp((err, sftp) => {
        if (err) { reject(err); ssh.end(); return }

        const remoteScript = '/tmp/fractera-main-bootstrap.sh'
        const writeStream = sftp.createWriteStream(remoteScript)

        writeStream.on('error', (err: Error) => { reject(err); ssh.end() })

        writeStream.on('close', () => {
          sftp.end()
          // Launch via `setsid ... &` — identical mechanism to the proven
          // original main deploy.ts. This is intentional, NOT systemd-run.
          //
          // Why this matters: systemd-run --scope spawns the bootstrap in a
          // transient unit with a MINIMAL environment where $HOME is unset.
          // The AI installers (uv tool install lightrag/hermes/kimi) resolve
          // paths via $HOME/.local/... — with $HOME empty they expand to
          // /.local/... and fail silently, so LightRAG/Hermes never install.
          //
          // setsid run through ssh.exec inherits the root login environment
          // (HOME=/root), so uv works exactly as it does in the original main
          // bootstrap that has shipped these tools reliably for months.
          //
          // Process survival: the original main uses setsid with no linger and
          // works on this Contabo Ubuntu host. Our bootstrap-main.sh ALSO runs
          // `loginctl enable-linger root` + `systemctl restart pm2-root`, so the
          // PM2 daemon is moved to a persistent service regardless — strictly
          // more protection than the original.
          const cmd = [
            `chmod +x ${remoteScript}`,
            `&& setsid bash ${remoteScript}`,
            `'${session_id}' '${secret}' '${safeGithubToken}' '${safeToken}' '${safeSubdomain}'`,
            `> /tmp/fractera-main-install.log 2>&1 < /dev/null &`,
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
