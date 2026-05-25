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
          //
          // `systemd-run --scope --no-block` is intentional and CRITICAL —
          // see step 70 post-mortem. The previous incarnation used
          // `setsid bash X args > log 2>&1 < /dev/null &`. On Ubuntu 24.04
          // (systemd 255+) the default is `KillUserProcesses=yes` and
          // root has Linger=no, so when the SSH session that launched the
          // setsid process closes, systemd-logind reaps the whole
          // user-0.slice cgroup — killing the "detached" bootstrap with
          // SIGTERM before it can reach the git-clone step. setsid only
          // detaches the controlling terminal; it does NOT escape the
          // user slice cgroup.
          //
          // systemd-run --scope --slice= places the process in a separate
          // slice (fractera-light.slice) that logind does not touch on
          // session cleanup. --no-block makes systemd-run return as soon
          // as the unit is scheduled, so our SSH exec returns in ~1s and
          // Vercel's after() can finish. The bootstrap then runs
          // independently of any user session.
          //
          // Why /api/embed/install/light path "worked" before this fix:
          // the developer happened to be holding an interactive SSH
          // session to the same VPS while testing, which kept
          // user-0.slice alive. MCP has no such accidental keep-alive.
          const bootstrapInner = `bash ${remoteScript} '${session_id}' '${secret}' '${safeGithubToken}' '${safeToken}' '${safeSubdomain}' > /tmp/fractera-light-install.log 2>&1`
          const cmd = [
            `chmod +x ${remoteScript}`,
            `&& systemd-run --quiet --no-block --slice=fractera-light.slice`,
            `bash -c "${bootstrapInner.replace(/"/g, '\\"')}"`,
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
