import { Client } from 'ssh2'

// Comprehensive cleanup of a previous Fractera installation. Removes
// EVERYTHING bootstrap.sh + bootstrap-triggered installers might have
// created. Idempotent — safe to run on a never-deployed server.
//
// Why this exists: bootstrap.sh's soft_step bodies skip work when their
// artifacts already exist (e.g. `[ -d "$SITE/webui" ] && exit 0`). When
// a partial / leftover install survives delete, those skip-branches fire
// on the next deploy and cause silent failures. Cleaner approach is to
// guarantee the target is empty before bootstrap runs.
//
// Categories cleaned:
//   - Fractera app trees (/opt/fractera, /opt/hermes-webui, /etc/fractera)
//   - Hermes Agent (uv-installed binary + state at /root/.hermes)
//   - uv tools + cache (lightrag-hku, kimi-cli, lightrag webui cache —
//     this last item is what triggered the `exit 0` bug in v5847cbe)
//   - bun (installed by build_lightrag_webui step)
//   - AI CLI configs (Claude, Codex, Gemini, Qwen, Kimi)
//   - PM2 daemon (full kill — not just `pm2 delete all`)
//   - nginx site configs for all 5 subdomains
//   - /tmp install logs + bootstrap script
//
// Categories intentionally NOT cleaned:
//   - apt-installed packages (nodejs, nginx, git) — re-installed by
//     bootstrap if missing, no harm leaving them
//   - /root/.ssh, /root/.bashrc — user's general server state
//   - /var/log — keep audit trail
export const WIPE_SCRIPT = `
pm2 kill 2>/dev/null || true
rm -rf /opt/fractera /opt/hermes-webui
rm -rf /etc/fractera
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
# fractera* (not just fractera) so the secure-mode site fractera-custom is also
# removed — otherwise the secure HTTPS/auth_request config survives wipe and
# leaks into the next IP-mode redeploy (same class of bug as the ufw lockdown).
# Does NOT touch /etc/letsencrypt — certs should survive wipe (LE rate limits).
rm -rf /etc/nginx/sites-enabled/fractera* /etc/nginx/sites-available/fractera*
for prefix in auth admin data hermes lightrag; do
  rm -f /etc/nginx/sites-enabled/\${prefix}.* /etc/nginx/sites-available/\${prefix}.* 2>/dev/null || true
done
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
rm -f /tmp/fractera-install-*.log /tmp/fractera-install.log /tmp/fractera-bootstrap.sh
echo "WIPED"
`

export interface WipeResult {
  output: string
}

// Wipes the target server. Throws on connection or exec failure — do NOT
// silently swallow; the caller must decide whether to abort the deploy
// or fall back to a manual recovery path (e.g. MCP retry).
//
// Timeout is intentionally generous (90s): rm -rf of a fully-installed
// Fractera tree (~3GB) on a slow VPS can take 30-60s. SSH connect adds
// up to 20s. Total <= 90s keeps comfortably inside Vercel's maxDuration=300.
export async function wipeServer(
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
      ssh.exec(WIPE_SCRIPT, (err, stream) => {
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
