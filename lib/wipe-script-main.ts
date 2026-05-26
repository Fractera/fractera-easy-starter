import { Client } from 'ssh2'

export const WIPE_SCRIPT_MAIN = `
pm2 kill 2>/dev/null || true
systemctl stop pm2-root 2>/dev/null || true
systemctl disable pm2-root 2>/dev/null || true
rm -rf /root/.pm2
rm -f /etc/systemd/system/pm2-root.service
systemctl daemon-reload 2>/dev/null || true
rm -rf /opt/fractera /opt/fractera-main /opt/fractera-light /opt/hermes-webui
rm -rf /etc/fractera /etc/fractera-main /etc/fractera-light
rm -rf /usr/local/lib/hermes-agent
rm -rf /root/.hermes
rm -rf /root/.local/share/uv /root/.cache/uv
rm -rf /root/.bun
rm -rf /root/.gemini /root/.claude /root/.config/openai /root/.openai \\
       /root/.config/qwen-code /root/.qwen \\
       /root/.config/kimi-cli /root/.kimi /root/.local/share/kimi-cli /root/.local/share/kimi 2>/dev/null || true
rm -f /root/.local/bin/hermes /root/.local/bin/claude /root/.local/bin/kimi \\
      /root/.local/bin/uv /root/.local/bin/uvx 2>/dev/null || true
rm -f /usr/local/bin/claude /usr/local/bin/kimi 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/* /etc/nginx/sites-available/fractera /etc/nginx/sites-available/fractera-main /etc/nginx/sites-available/fractera-light
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
rm -f /tmp/fractera-*
echo "WIPED"
`

export async function wipeServerMain(
  ip: string,
  login: string,
  password: string,
  timeoutMs = 90_000,
): Promise<{ output: string }> {
  return new Promise((resolve, reject) => {
    const ssh = new Client()
    let output = ''
    const timer = setTimeout(() => {
      ssh.end()
      reject(new Error(`wipe timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    ssh.on('ready', () => {
      ssh.exec(WIPE_SCRIPT_MAIN, (err, stream) => {
        if (err) { clearTimeout(timer); ssh.end(); reject(err); return }
        stream.on('close', (code: number) => {
          clearTimeout(timer)
          ssh.end()
          if (code === 0 && output.includes('WIPED')) {
            resolve({ output })
          } else {
            reject(new Error(`wipe exited with code ${code} — output: ${output.slice(-300)}`))
          }
        })
        stream.on('data', (chunk: Buffer) => { output += chunk.toString() })
        stream.stderr.on('data', (chunk: Buffer) => { output += chunk.toString() })
      })
    })

    ssh.on('error', (err) => { clearTimeout(timer); reject(err) })
    ssh.connect({ host: ip, port: 22, username: login, password, readyTimeout: 20_000 })
  })
}
