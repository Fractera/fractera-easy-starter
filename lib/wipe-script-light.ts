import { Client } from 'ssh2'

// Light-variant of the server wipe. CLAUDE.md rule 13 forbids sharing
// helpers between bootstrap-light.sh and lib/bootstrap.sh — so this
// file is a self-contained sibling of lib/wipe-script.ts.
//
// Cleans BOTH main Fractera AND Fractera Light artifacts. A server may
// previously have hosted main (Hermes/LightRAG present) OR a partial
// Light install (fractera-light nginx config left over). Light deploys
// must guarantee a blank slate regardless of which the previous tenant
// was, so we wipe the union.
//
// Extra targets vs main wipe-script.ts:
//   - /opt/fractera-light  (Light install tree)
//   - /etc/fractera-light  (Light secrets)
//   - nginx fractera-light site config (the duplicate default_server
//     bug on 109.199.105.213 was caused by this file surviving wipe)
//   - /tmp/fractera-light-* logs and bootstrap copy
export const WIPE_SCRIPT_LIGHT = `
pm2 kill 2>/dev/null || true
systemctl stop pm2-root 2>/dev/null || true
systemctl disable pm2-root 2>/dev/null || true
rm -rf /root/.pm2
rm -f /etc/systemd/system/pm2-root.service
systemctl daemon-reload 2>/dev/null || true
rm -rf /opt/fractera /opt/fractera-light /opt/hermes-webui
rm -rf /etc/fractera /etc/fractera-light
rm -rf /usr/local/lib/hermes-agent
rm -rf /root/.hermes
rm -rf /root/.local/share/uv /root/.cache/uv
rm -rf /root/.bun
rm -rf /root/.gemini /root/.claude /root/.config/openai /root/.openai \\
       /root/.config/qwen-code /root/.qwen \\
       /root/.config/kimi-cli /root/.kimi /root/.local/share/kimi-cli /root/.local/share/kimi 2>/dev/null || true
rm -f /root/.local/bin/hermes /root/.local/bin/claude /root/.local/bin/kimi \\
      /root/.local/bin/uv /root/.local/bin/uvx \\
      /root/.local/bin/lightrag-clean-llmqc /root/.local/bin/lightrag-download-cache \\
      /root/.local/bin/lightrag-gunicorn /root/.local/bin/lightrag-hash-password \\
      /root/.local/bin/lightrag-server 2>/dev/null || true
rm -f /usr/local/bin/claude /usr/local/bin/kimi 2>/dev/null || true
rm -rf /etc/nginx/sites-enabled/fractera /etc/nginx/sites-available/fractera
rm -rf /etc/nginx/sites-enabled/fractera-light /etc/nginx/sites-available/fractera-light
for prefix in auth admin data hermes lightrag; do
  rm -f /etc/nginx/sites-enabled/\${prefix}.* /etc/nginx/sites-available/\${prefix}.* 2>/dev/null || true
done
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
rm -f /tmp/fractera-install-*.log /tmp/fractera-install.log /tmp/fractera-bootstrap.sh
rm -f /tmp/fractera-light-install-*.log /tmp/fractera-light-install.log /tmp/fractera-light-bootstrap.sh
echo "WIPED"
`

export interface WipeResult {
  output: string
}

export async function wipeServerLight(
  ip: string,
  login: string,
  password: string,
  timeoutMs = 90_000,
): Promise<WipeResult> {
  return new Promise<WipeResult>((resolve, reject) => {
    const ssh = new Client()
    let output = ''
    const timer = setTimeout(() => {
      ssh.end()
      reject(new Error(`wipe timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    ssh.on('ready', () => {
      ssh.exec(WIPE_SCRIPT_LIGHT, (err, stream) => {
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

    ssh.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })

    ssh.connect({
      host: ip,
      port: 22,
      username: login,
      password,
      readyTimeout: 20_000,
    })
  })
}
