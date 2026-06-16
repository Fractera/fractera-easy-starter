import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initProgress, appendStep } from '@/lib/kv'

interface DeployOptions {
  ip: string
  login: string
  password: string
  session_id: string
  platform?: string
  serverToken?: string
  subdomainOverride?: string
  serverId?: string
  // Selective install (S1/S2). Passed verbatim as bootstrap arg $8.
  //   undefined / '' → bootstrap installs everything (default, unchanged behavior)
  //   'all' | 'none' | csv subset (see lib/components-catalog.ts:serializeComponents)
  components?: string
  // App-slot project (pivot 2026-06-16). Passed as ENV (FRACTERA_APP_FRAMEWORK /
  // FRACTERA_APP_REPO_URL) prefixing the bootstrap command — additive, and when both
  // are empty the env is unset so bootstrap defaults to the cloned reference app
  // (deploy stays byte-identical). framework = fractera-pro | next | own-repo | preset;
  // repoUrl = public git URL (own-repo only). See lib/frameworks-catalog.ts.
  framework?: string
  repoUrl?: string
}

export async function testSSHConnection(ip: string, password: string, timeoutMs = 15000): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()
    ssh.on('ready', () => { ssh.end(); resolve() })
    ssh.on('error', reject)
    ssh.connect({
      host: ip,
      port: 22,
      username: 'root',
      password,
      readyTimeout: timeoutMs,
    })
  })
}

export async function deployToServer({
  ip,
  login,
  password,
  session_id,
  platform = 'claude-code',
  serverToken = '',
  subdomainOverride = '',
  serverId = '',
  components = '',
  framework = '',
  repoUrl = '',
}: DeployOptions) {
  const safePlatform = /^[a-z0-9-]+$/.test(platform) ? platform : 'claude-code'
  const safeToken = serverToken.replace(/['"\\`$]/g, '')
  const safeSubdomain = subdomainOverride.replace(/['"\\`$]/g, '')
  const safeGithubToken = (process.env.GITHUB_DEPLOY_TOKEN ?? '').replace(/['"\\`$]/g, '')
  // Non-secret server identity (ServerToken.id) — baked into bridges/app as
  // NEXT_PUBLIC_SERVER_ID for marketplace links (Skills / Product Loop).
  const safeServerId = serverId.replace(/['"\\`$]/g, '')
  // Component selection ($8). Whitelist to [a-z0-9,-]; anything else (incl. '')
  // collapses to '' which bootstrap treats as "install everything" (default).
  const safeComponents = /^[a-z0-9,-]+$/.test(components) ? components : ''
  // App-slot (env-passed). framework: id whitelist [a-z0-9-]; repoUrl: only a clean
  // public http(s) URL (no shell metacharacters, no inline credentials). Anything
  // unsafe collapses to '' → env unset → bootstrap keeps the default reference app.
  const safeFramework = /^[a-z0-9-]+$/.test(framework) ? framework : ''
  const safeRepoUrl = /^https?:\/\/[a-zA-Z0-9._~:/?#@!$&'()*+,;=%-]+$/.test(repoUrl) && !repoUrl.includes('@')
    ? repoUrl
    : ''
  const secret = process.env.INSTALL_SCRIPT_SECRET!

  const bootstrapPath = join(process.cwd(), 'lib', 'bootstrap.sh')
  const bootstrapContent = readFileSync(bootstrapPath, 'utf-8')

  await initProgress(session_id)

  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()

    ssh.on('ready', () => {
      // Mark the 'connect' step as done so UI doesn't stay stuck on it
      appendStep(session_id, { id: 'connect', label: 'Connecting to server', done: true, ts: Date.now() }).catch(() => {})
      ssh.sftp((err, sftp) => {
        if (err) { reject(err); ssh.end(); return }

        const remoteScript = '/tmp/fractera-bootstrap.sh'
        const writeStream = sftp.createWriteStream(remoteScript)

        writeStream.on('error', (err: Error) => { reject(err); ssh.end() })

        writeStream.on('close', () => {
          sftp.end()
          // App-slot env prefix — present ONLY when a non-default project was chosen,
          // so a normal deploy emits the exact same command as before.
          const appSlotEnv = [
            safeFramework ? `FRACTERA_APP_FRAMEWORK="${safeFramework}"` : '',
            safeRepoUrl ? `FRACTERA_APP_REPO_URL="${safeRepoUrl}"` : '',
          ].filter(Boolean).join(' ')
          const cmd = [
            `chmod +x ${remoteScript}`,
            `&& ${appSlotEnv ? appSlotEnv + ' ' : ''}setsid bash ${remoteScript}`,
            `"${session_id}" "${secret}" "${safePlatform}" "${safeToken}" "${safeSubdomain}" "${safeGithubToken}" "${safeServerId}" "${safeComponents}"`,
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
