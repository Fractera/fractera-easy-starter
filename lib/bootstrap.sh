#!/bin/bash
# Fractera Bootstrap Agent
# Reports progress + errors back to fractera-easy-starter.

SESSION_ID="$1"
PROGRESS_URL="https://fractera-easy-starter.vercel.app/api/progress"
PING_URL="https://fractera-easy-starter.vercel.app/api/server/ping"
INSTALL_SECRET="$2"
PLATFORM="${3:-claude-code}"
SERVER_TOKEN="${4:-}"
SUBDOMAIN_OVERRIDE="${5:-}"  # accepted for back-compat with old deploy.ts callers; ignored
GITHUB_TOKEN="${6:-}"
LOG_FILE="/tmp/fractera-install-$SESSION_ID.log"

CURRENT_STEP=""
CURRENT_LABEL=""
INSTALL_START=$(date +%s)
# DEBUG — remove before launch
LOG_URL="https://fractera-easy-starter.vercel.app/api/server/install-log"

log_email() {
  [ -z "$SERVER_TOKEN" ] && return
  local step="$1" label="$2" percent="$3"
  local elapsed=$(( $(date +%s) - INSTALL_START ))
  local elapsed_str="${elapsed}s"
  curl -s -X POST "$LOG_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SERVER_TOKEN" \
    -d "{\"step\":\"$step\",\"label\":\"$label\",\"percent\":$percent,\"elapsed\":\"$elapsed_str\"}" \
    > /dev/null 2>&1 &
}

# Send a step update (start or finish) — retries 3x so a transient Vercel hiccup doesn't lose progress
report() {
  local id="$1"
  local label="$2"
  local done="$3"
  local _payload="{\"session_id\":\"$SESSION_ID\",\"step\":{\"id\":\"$id\",\"label\":\"$label\",\"done\":$done,\"ts\":$(date +%s000)}}"
  local _attempt _code
  for _attempt in 1 2 3; do
    _code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "$PROGRESS_URL" \
      -H "Content-Type: application/json" \
      -H "x-install-secret: $INSTALL_SECRET" \
      -d "$_payload" 2>/dev/null)
    [ "$_code" = "200" ] && return 0
    [ "$_attempt" -lt 3 ] && sleep 5
  done
  return 0
}

# Send error and exit. --max-time is critical here: without it, a slow or
# unreachable Vercel function leaves bash blocked inside curl for the
# default ~75s connect timeout, and during that block the UI just keeps
# showing the last-known % with no error overlay. With --max-time the
# error post is bounded — if Vercel doesn't respond, we still exit
# promptly and the UI's poller eventually times out the session.
fail() {
  local message="$1"
  local last_log=$(tail -c 800 "$LOG_FILE" 2>/dev/null | tr '"' "'" | tr '\n' ' ' | head -c 700)
  curl -s --max-time 30 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"session_id\":\"$SESSION_ID\",\"error\":\"Step '$CURRENT_LABEL' failed: $message. Last log: $last_log\"}" \
    > /dev/null 2>&1 || true
  exit 1
}

# Run a step. Args: id, label, command. Body runs in a subshell —
# see the comment on soft_step() below for the full reasoning.
step() {
  CURRENT_STEP="$1"
  CURRENT_LABEL="$2"
  local cmd="$3"
  report "$CURRENT_STEP" "$CURRENT_LABEL" false
  ( eval "$cmd" ) >> "$LOG_FILE" 2>&1
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    fail "command failed (exit $rc)"
  fi
  report "$CURRENT_STEP" "$CURRENT_LABEL" true
}

# npm-aware step: retries once on transient races (ENOTEMPTY, EACCES,
# EBUSY) that occasionally happen when npm rmdir's a directory while
# another worker still holds files inside. On retry we nuke node_modules
# and start fresh so half-extracted packages don't confuse npm.
step_npm() {
  CURRENT_STEP="$1"
  CURRENT_LABEL="$2"
  local cmd="$3"
  local prefix="$4"  # path passed to npm --prefix, or empty for root
  report "$CURRENT_STEP" "$CURRENT_LABEL" false
  for attempt in 1 2; do
    # Subshell — see comment on soft_step() below.
    ( eval "$cmd" ) >> "$LOG_FILE" 2>&1
    local rc=$?
    if [ "$rc" -eq 0 ]; then
      report "$CURRENT_STEP" "$CURRENT_LABEL" true
      return 0
    fi
    if [ "$attempt" -lt 2 ] && grep -qE 'ENOTEMPTY|EACCES|EBUSY' "$LOG_FILE"; then
      echo "  ⚠ npm transient race detected — wiping node_modules and retrying" >> "$LOG_FILE"
      if [ -n "$prefix" ]; then
        rm -rf "$prefix/node_modules" "$prefix/package-lock.json" 2>/dev/null || true
      else
        rm -rf node_modules package-lock.json 2>/dev/null || true
      fi
      continue
    fi
    fail "command failed (exit $rc)"
  done
}

echo "=== Fractera bootstrap started: $(date) ===" > "$LOG_FILE"

step "apt_update"   "Updating system"         "rm -f /etc/apt/sources.list.d/nodesource.list /usr/share/keyrings/nodesource.gpg /etc/apt/keyrings/nodesource.gpg 2>/dev/null; apt-get update -qq"
step "apt_install"  "Installing base tools"   "apt-get install -y -qq git curl nginx build-essential dnsutils zsh"
step "node_repo"    "Adding Node.js repository" "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
step "node_install" "Installing Node.js 20"   "apt-get install -y nodejs"
step "pm2"             "Installing PM2 process manager" "npm install -g pm2"
log_email "pm2" "Node.js + PM2 installed" 10

# === Reliable DNS resolver ===
# Some VPS providers (e.g. Contabo) ship a default resolver that intermittently
# returns NXDOMAIN for freshly-created customer A-records (a customer adds the
# domain's records, the provider resolver still fails to resolve e.g. the www
# host). That breaks certbot during the Personal Domain wizard Step 2, which
# validates all 7 hostnames. Pin systemd-resolved to public resolvers so DNS is
# dependable. Best-effort: never fail the deploy over this.
soft_step "dns_resolver" "Configuring DNS resolver" "mkdir -p /etc/systemd/resolved.conf.d && printf '[Resolve]\nDNS=1.1.1.1 8.8.8.8\nFallbackDNS=9.9.9.9 1.0.0.1\n' > /etc/systemd/resolved.conf.d/fractera-dns.conf && systemctl restart systemd-resolved && sleep 1 && resolvectl flush-caches"

# === Clear previous platform credentials (safe on fresh servers — rm -f never fails) ===
CURRENT_STEP="clear_creds"
CURRENT_LABEL="Clearing platform credentials"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
rm -rf \
  ~/.gemini \
  ~/.claude \
  ~/.config/openai ~/.openai \
  ~/.config/qwen-code ~/.qwen \
  ~/.config/kimi-cli ~/.kimi ~/.local/share/kimi-cli ~/.local/share/kimi \
  2>/dev/null || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === SERVER IP detection ===
SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
  fail "could not detect server IP"
fi

# IP-only deploy: no fractera.ai DNS registration. Customer attaches their
# own domain later via the admin panel. SUBDOMAIN is the IP itself (used
# as a synthetic identifier in logs and pings).
SUBDOMAIN="$SERVER_IP"
BASE="ip-$SERVER_IP"
CURRENT_STEP="register"
CURRENT_LABEL="Detecting server IP"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

if [ -n "$GITHUB_TOKEN" ]; then
  CLONE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/Fractera/ai-workspace.git"
else
  CLONE_URL="https://github.com/Fractera/ai-workspace.git"
fi
step "clone" "Downloading Fractera" \
  "rm -rf /opt/fractera && git clone $CLONE_URL /opt/fractera"

cd /opt/fractera || fail "Cannot cd to /opt/fractera"

# SECURITY: clean remote URL — do NOT store the GitHub token in .git/config
# (any user with SSH access could read it and push to our repo).
# Auto-updates that need to pull must provide credentials at command time.
git remote set-url origin "https://github.com/Fractera/ai-workspace.git"

# Record deployed commit and branch for verification
DEPLOYED_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
DEPLOYED_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "$DEPLOYED_COMMIT" > /opt/fractera/DEPLOYED_COMMIT
echo "$DEPLOYED_BRANCH" > /opt/fractera/DEPLOYED_BRANCH
echo "=== DEPLOYED: branch=$DEPLOYED_BRANCH commit=$DEPLOYED_COMMIT ===" >> "$LOG_FILE"


step_npm "deps_root"   "Installing dependencies (1/6)" "npm install" ""
step_npm "deps_app"    "Installing dependencies (2/6)" "npm install --prefix app" "app"

# Install native binaries for Tailwind v4
ARCH=$(uname -m)
CURRENT_STEP="deps_app_native"
CURRENT_LABEL="Installing native modules for $ARCH"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
if [ "$ARCH" = "x86_64" ]; then
  npm install --prefix app lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu --save-optional >> "$LOG_FILE" 2>&1 || fail "native modules install failed"
elif [ "$ARCH" = "aarch64" ]; then
  npm install --prefix app lightningcss-linux-arm64-gnu @tailwindcss/oxide-linux-arm64-gnu --save-optional >> "$LOG_FILE" 2>&1 || fail "native modules install failed"
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

step_npm "deps_bridge"      "Installing dependencies (3/6)" "npm install --prefix bridges/platforms" "bridges/platforms"
step_npm "deps_auth"        "Installing dependencies (4/6)" \
  "npm install --prefix services/auth && npm rebuild better-sqlite3 --prefix services/auth" "services/auth"
step_npm "deps_bridges_app" "Installing dependencies (5/6)" \
  "npm install --prefix bridges/app && npm rebuild better-sqlite3 --prefix bridges/app" "bridges/app"
step_npm "deps_data"        "Installing dependencies (6/6)" \
  "npm install --prefix services/data && npm rebuild better-sqlite3 --prefix services/data && npm rebuild sharp --prefix services/data" "services/data"
log_email "deps_data" "All dependencies installed" 30

# === Install AI platform binaries (soft — each failure is skipped, not fatal) ===
# IMPORTANT: the body runs in a SUBSHELL via `( eval ... )`. This isolates
# parent shell state from anything `cmd` might do. Bash's plain `eval`
# executes the string in the current shell, which means `cd`, `exit`,
# `set -e`, `umask`, `trap`, `IFS=…` etc. all leak out and silently break
# later steps. Two real incidents we hit before adding the subshell:
#   1. `exit 0` early-skip inside build_lightrag_webui terminated the
#      whole bootstrap.sh — script froze at 57%.
#   2. `cd "$SRC"` inside the same step left CWD pointing at the LightRAG
#      uv cache; the next `npm run build --prefix app` looked for
#      lightrag_webui/app/package.json — froze at 77%.
# The subshell makes these classes of bugs impossible to recur regardless
# of what future soft_step authors write in their bodies.
soft_step() {
  local id="$1"
  local label="$2"
  local cmd="$3"
  report "$id" "Installing $label" false
  if ( eval "$cmd" ) >> "$LOG_FILE" 2>&1; then
    report "$id" "$label" true
  else
    echo "[skip] $label installation failed, continuing" >> "$LOG_FILE"
    report "$id" "$label (skipped)" true
  fi
}

soft_step "install_claude"   "Claude Code" "curl -fsSL https://claude.ai/install.sh | bash && ln -sf /root/.local/bin/claude /usr/local/bin/claude || true"
soft_step "install_codex"    "Codex"       "npm install -g @openai/codex"
soft_step "install_gemini"   "Gemini CLI"  "npm install -g @google/gemini-cli"
soft_step "install_qwen"     "Qwen Code"   "npm install -g @qwen-code/qwen-code@latest"
soft_step "install_kimi"     "Kimi Code"   "curl -LsSf https://astral.sh/uv/install.sh | sh && export PATH=\"\$HOME/.local/bin:\$PATH\" && \$HOME/.local/bin/uv tool install --force --python 3.13 kimi-cli && ln -sf \$HOME/.local/bin/kimi /usr/local/bin/kimi || true"
soft_step "install_lightrag" "LightRAG"    "export PATH=\"\$HOME/.local/bin:\$PATH\" && \$HOME/.local/bin/uv tool install 'lightrag-hku[api] @ git+https://github.com/HKUDS/LightRAG.git@v1.4.16' || true"
# v1.4.9.3+ ships sources without a pre-built WebUI (frontend artifacts removed
# from the repo). Without this step lightrag-server falls back to a 307 to /docs
# (Swagger) and Company Brain in admin shows 404/Swagger instead of the React UI.
# Build the webui from the uv checkout and copy dist/ into api/webui/ where
# lightrag_server.py looks for it (Path(__file__).parent / 'webui' — line ~164).
# NOTE on shell discipline below: this body is run by `eval "$cmd"` inside
# soft_step(), which executes in the CURRENT shell (not a subshell). That
# means an `exit 0` here would terminate the entire bootstrap.sh, not just
# this step (precisely the bug that froze deploys at 57% in v5847cbe).
# Same hazard for `set -e` — it would leak into the parent shell. Use only
# if/elif/else control flow; let soft_step's `|| true` handle errors.
soft_step "build_lightrag_webui" "Company Brain UI build" '
SITE=$(ls -d /root/.local/share/uv/tools/lightrag-hku/lib/python*/site-packages/lightrag/api 2>/dev/null | head -1)
SRC=$(ls -d /root/.cache/uv/git-v0/checkouts/*/*/lightrag_webui 2>/dev/null | head -1)
if [ -z "$SITE" ] || [ -z "$SRC" ]; then
  echo "  ! lightrag api dir or webui sources not found — skipping"
elif [ -d "$SITE/webui" ] && [ -f "$SITE/webui/index.html" ]; then
  echo "  webui already built — skipping"
else
  # bun installer needs unzip; not in the minimal Ubuntu image.
  apt-get install -y -qq unzip >/dev/null 2>&1 || true
  command -v bun >/dev/null 2>&1 || { curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1 ; }
  export PATH="$HOME/.bun/bin:$PATH"
  cd "$SRC"
  bun install --frozen-lockfile >/dev/null 2>&1 || bun install >/dev/null 2>&1
  bun run build >/dev/null 2>&1 || true
  # vite is configured to emit to ../lightrag/api/webui/ relative to
  # lightrag_webui/. There are TWO places we may find a usable dist:
  #   1) uv-archive snapshot — vite-emitted target (best case)
  #   2) the git-checkout itself ships a pre-built webui under
  #      lightrag/api/webui/ — present when bun build silently fails
  #      (exit 0 but no output, observed in production on 2026-05-23).
  # Try the archive first, fall back to the checkout, and finally fall back
  # to the source tree next to the checkout (some snapshots have it).
  CHECKOUT_WEBUI=$(ls -d /root/.cache/uv/git-v0/checkouts/*/*/lightrag/api/webui 2>/dev/null | head -1)
  ARCHIVE_WEBUI=$(find /root/.cache/uv/archive-v0 -path "*/lightrag/api/webui" -type d 2>/dev/null | head -1)
  for CANDIDATE in "$ARCHIVE_WEBUI" "$CHECKOUT_WEBUI"; do
    if [ -n "$CANDIDATE" ] && [ -f "$CANDIDATE/index.html" ]; then
      mkdir -p "$SITE/webui"
      cp -r "$CANDIDATE"/. "$SITE/webui/"
      echo "  webui copied to $SITE/webui from $CANDIDATE"
      break
    fi
  done
  if [ ! -f "$SITE/webui/index.html" ]; then
    echo "  ! no webui dist found in archive or checkout — Company Brain will 307 to Swagger (blocked by nginx)"
  fi
fi' || true
soft_step "install_hermes"  "Hermes Agent" "curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash -s -- --skip-setup --skip-browser || true"
soft_step "install_hermes_plugins" "Hermes memory plugins" "[ -d /root/.hermes ] && mkdir -p /root/.hermes/plugins && cp -r /opt/fractera/services/hermes-plugins/* /root/.hermes/plugins/ || true"
soft_step "install_hermes_skills" "Hermes delegation skills" "[ -d /root/.hermes ] && [ -d /opt/fractera/services/hermes-skills ] && mkdir -p /root/.hermes/skills && cp /opt/fractera/services/hermes-skills/* /root/.hermes/skills/ || true"
soft_step "install_hermes_theme" "Hermes dashboard theme" "[ -d /root/.hermes ] && [ -d /opt/fractera/services/hermes-dashboard-themes ] && mkdir -p /root/.hermes/dashboard-themes && cp /opt/fractera/services/hermes-dashboard-themes/* /root/.hermes/dashboard-themes/ || true"
soft_step "hermes_docs_dir" "Hermes protected docs dir" "mkdir -p /opt/fractera/app/docs/hermes/{decisions,project-model,feedback-history} && chown -R root:root /opt/fractera/app/docs/hermes && chmod -R 750 /opt/fractera/app/docs/hermes || true"

# === Prepare secrets (idempotent — never overwrite existing AUTH_SECRET) ===
CURRENT_STEP="prepare_secrets"
CURRENT_LABEL="Generating security keys"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
mkdir -p /etc/fractera
SECRETS_FILE="/etc/fractera/secrets.env"
if [ ! -f "$SECRETS_FILE" ] || ! grep -q "AUTH_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  NEW_SECRET=$(openssl rand -base64 32)
  echo "AUTH_SECRET=$NEW_SECRET" > "$SECRETS_FILE"
fi
if ! grep -q "DEPLOY_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  echo "DEPLOY_SECRET=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
if ! grep -q "DATA_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  echo "DATA_SECRET=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
if ! grep -q "LIGHTRAG_API_KEY=" "$SECRETS_FILE" 2>/dev/null; then
  echo "LIGHTRAG_API_KEY=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
if ! grep -q "HERMES_MCP_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  echo "HERMES_MCP_SECRET=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
chmod 600 "$SECRETS_FILE"
source "$SECRETS_FILE"
mkdir -p /opt/fractera/services/rag/storage
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Initial .env.local files (before build, without real subdomain) ===
CURRENT_STEP="prepare_env"
CURRENT_LABEL="Writing environment configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source /etc/fractera/secrets.env

# IP-mode CORS: include cross-port origins so http://IP:3000 can call auth on :3001.
IP_ORIGINS=",http://$SERVER_IP:3000,http://$SERVER_IP:3001,http://$SERVER_IP:3002,http://$SERVER_IP:3300"

cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_MEDIA_URL=http://localhost:3300
APP_DB_PATH=/opt/fractera/app/data/app.db
# IP-only deploy → open demo mode by default. Toggle via Admin → Security panel
# or recovery sed command in /opt/fractera/services/auth/.env.local.
FRACTERA_IP_NODOMAIN_MODE=true
ENVEOF

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=
COOKIE_SECURE=false
# IP-mode: NEXTAUTH_URL must point at the public host the browser uses,
# otherwise NextAuth sets callback URLs and CSRF origin to localhost and the
# browser refuses the redirect / drops the cookie. AUTH_TRUST_HOST=true makes
# NextAuth honour the X-Forwarded-Host/Host header on each request, so this
# value mainly seeds the default callbackUrl cookie.
NEXTAUTH_URL=http://$SERVER_IP:3001
DATABASE_URL=file:/opt/fractera/app/data/app.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002$IP_ORIGINS
FRACTERA_IP_NODOMAIN_MODE=true
ENVEOF

cat > /opt/fractera/bridges/app/.env.local <<ENVEOF
# Server-side only — admin proxy.ts calls auth on localhost.
AUTH_SERVICE_URL=http://localhost:3001
# NEXT_PUBLIC_* not needed: bridges/app reads URLs at runtime via
# lib/runtime-urls.ts → window.location.hostname + service ports.
DEPLOY_SECRET=$DEPLOY_SECRET
APP_DB_PATH=/opt/fractera/app/data/app.db
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_LLM_OPENAI_MODEL=gpt-4o-mini
RAG_ENV_PATH=/opt/fractera/services/rag/.env
FRACTERA_IP_NODOMAIN_MODE=true
ENVEOF

cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=http://localhost:3300
APP_DB_PATH=/opt/fractera/app/data/app.db
DATA_SECRET=$DATA_SECRET
FRACTERA_IP_NODOMAIN_MODE=true
ENVEOF

cat > /opt/fractera/services/rag/.env <<ENVEOF
# IP-mode: bind to 0.0.0.0 so the Admin iframe (browser → http://IP:9621)
# can reach LightRAG. Healthchecks below still hit 127.0.0.1 (loopback works
# either way). When switching to Secure mode, gate this port via UFW or
# nginx auth_request.
HOST=0.0.0.0
PORT=9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_KV_STORAGE=JsonKVStorage
LIGHTRAG_DOC_STATUS_STORAGE=JsonDocStatusStorage
LIGHTRAG_GRAPH_STORAGE=NetworkXStorage
LIGHTRAG_VECTOR_STORAGE=NanoVectorDBStorage
WORKING_DIR=/opt/fractera/services/rag/storage
LLM_BINDING=openai
LLM_BINDING_HOST=https://api.openai.com/v1
LLM_BINDING_API_KEY=
LLM_MODEL=gpt-4o-mini
EMBEDDING_BINDING=openai
EMBEDDING_BINDING_HOST=https://api.openai.com/v1
EMBEDDING_BINDING_API_KEY=
# 3-small chosen over 3-large: embeddings dominate Company Brain cost
# (every chunk gets embedded vs. one LLM call per chunk), and -small
# is ~7x cheaper with quality difference imperceptible for the typical
# partner workload. Dim must match the model: 1536 for -small, 3072
# for -large. Mismatched dim crashes LightRAG indexing.
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIM=1536
CORS_ORIGINS=http://localhost:3002
ENVEOF

# === Hermes config (if installed) ===
if [ -d "/root/.hermes" ]; then
  cat > /root/.hermes/config.yaml <<HERMESEOF
model:
  # Subscription-first: default to OpenAI Codex (ChatGPT subscription).
  # The user signs in via OAuth at hermes.<sub>.fractera.ai/env on first
  # admin-panel visit; until then this provider has no credentials and
  # the agent will refuse to run — which is the intended UX (sign in,
  # don't fall back to a paid API key the user didn't agree to).
  provider: openai-codex
  model: gpt-5.5
  # Anthropic Claude Code is an equally valid subscription; the user can
  # sign in there too and switch the active provider in the Hermes /env
  # panel. We don't set it as fallback because both providers go through
  # the same credential_pool — first match wins.
  fallback_provider: anthropic
  fallback_model: claude-opus-4.7

memory:
  provider: lightrag-memory

plugins:
  enabled:
    - fractera-platforms

mcp_servers:
  claude-bridge:
    url: http://localhost:3210
    headers:
      Authorization: "Bearer $HERMES_MCP_SECRET"
  codex-bridge:
    url: http://localhost:3211
    headers:
      Authorization: "Bearer $HERMES_MCP_SECRET"
  gemini-bridge:
    url: http://localhost:3212
    headers:
      Authorization: "Bearer $HERMES_MCP_SECRET"
  qwen-bridge:
    url: http://localhost:3213
    headers:
      Authorization: "Bearer $HERMES_MCP_SECRET"
  kimi-bridge:
    url: http://localhost:3214
    headers:
      Authorization: "Bearer $HERMES_MCP_SECRET"

terminal:
  cwd: /opt/fractera/app

dashboard:
  theme: fractera-black

logging:
  level: INFO
HERMESEOF
  if ! grep -q "OPENAI_API_KEY=" /root/.hermes/.env 2>/dev/null; then
    printf "\n# Fractera — set your API keys here\nOPENAI_API_KEY=\nOPENROUTER_API_KEY=\n" >> /root/.hermes/.env
  fi
  if ! grep -q "LIGHTRAG_URL=" /root/.hermes/.env 2>/dev/null; then
    printf "LIGHTRAG_URL=http://localhost:9621\nLIGHTRAG_API_KEY=$LIGHTRAG_API_KEY\n" >> /root/.hermes/.env
  fi
  if ! grep -q "MCP_SECRET=" /root/.hermes/.env 2>/dev/null; then
    printf "MCP_SECRET=$HERMES_MCP_SECRET\n" >> /root/.hermes/.env
  fi
fi

report "$CURRENT_STEP" "$CURRENT_LABEL" true

log_email "build_start" "Building services (this takes 5-10 min)" 40
step "build_app"         "Building shell (production)"   "npm run build --prefix app"
step "build_auth"        "Building auth (production)"    "npm run build --prefix services/auth"
step "build_bridges_app" "Building admin (production)"   "npm run build --prefix bridges/app"

# Remove any previous services before starting fresh
pm2 delete all >> "$LOG_FILE" 2>&1 || true

step "start_app"    "Starting shell service"   "cd /opt/fractera/app && pm2 start npm --name fractera-app -- run start && cd /opt/fractera"
step "start_bridge" "Starting bridge service"  "cd /opt/fractera/bridges/platforms && pm2 start npm --name fractera-bridge -- run start && cd /opt/fractera"
step "start_auth"   "Starting auth service"    "cd /opt/fractera/services/auth && pm2 start npm --name fractera-auth -- run start && cd /opt/fractera"
step "start_admin"  "Starting admin service"   "cd /opt/fractera/bridges/app && pm2 start npm --name fractera-admin -- run start && cd /opt/fractera"
step "start_data"   "Starting data service"    "cd /opt/fractera/services/data && pm2 start node --name fractera-data -- server.js && cd /opt/fractera"
soft_step "start_rag" "LightRAG service" "RAG_PY=\$HOME/.local/share/uv/tools/lightrag-hku/bin/python && RAG_BIN=\$HOME/.local/share/uv/tools/lightrag-hku/bin/lightrag-server && cd /opt/fractera/services/rag && pm2 start \$RAG_BIN --name fractera-rag --interpreter \$RAG_PY --cwd /opt/fractera/services/rag && cd /opt/fractera && for i in \$(seq 1 10); do curl -sf http://127.0.0.1:9621/health >> \"$LOG_FILE\" 2>&1 && break || sleep 3; done"
soft_step "start_hermes" "Hermes Agent service" "HERMES_PY=/usr/local/lib/hermes-agent/venv/bin/python && HERMES_BIN=/usr/local/lib/hermes-agent/venv/bin/hermes && [ -x \"\$HERMES_BIN\" ] && pm2 start \$HERMES_BIN --name fractera-hermes --interpreter \$HERMES_PY -- dashboard --host 0.0.0.0 --port 9119 --no-open --insecure && sleep 8 && curl -sf http://127.0.0.1:9119/ >> \"$LOG_FILE\" 2>&1 || true"
log_email "start_data" "All 7 services started" 65

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup systemd -u root --hp /root | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
systemctl enable pm2-root >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# Daily TLS cert-expiry relay → Easy Starter. The script self-guards (no-op
# until Secure mode with a cert on disk), so scheduling it now in IP mode is
# harmless. Keeps L1's certExpiresAt fresh after certbot auto-renewal and lets
# L1 send a single expiry-warning email at <=14 days. → reports/patterns.
soft_step "cert_relay_cron" "Cert-expiry relay (daily)" "chmod +x /opt/fractera/scripts/cert-relay.sh; echo '17 4 * * * root /opt/fractera/scripts/cert-relay.sh >> /var/log/fractera-cert-relay.log 2>&1' > /etc/cron.d/fractera-cert-relay; chmod 644 /etc/cron.d/fractera-cert-relay"

# === Initial Nginx config — IP-only, single default_server on :80 ===
# Customer attaches their own domain later through Admin → Personal Domain
# (admin app runs certbot directly). No Fractera-owned subdomains.
CURRENT_STEP="configure_nginx_http"
CURRENT_LABEL="Configuring web server (HTTP)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera <<'NGINXEOF'
# Default HTTP server — catches all requests to the bare IP and proxies to
# the shell on :3000. Other services (auth :3001, admin :3002, data :3300,
# hermes :9119, lightrag :9621) are reached directly on their ports until
# the user attaches a domain.
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_set_header Accept-Encoding "";
        sub_filter_once on;
        sub_filter '</body>' '<div style="width:100%;background:#fff;text-align:center;padding:3px 0;line-height:1.4"><a href="https://github.com/Fractera/ai-workspace" style="font-size:10px;color:#000;text-decoration:none">Powered by Fractera</a></div></body>';
    }
}

NGINXEOF

rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/fractera /etc/nginx/sites-enabled/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Health check before registration ===
CURRENT_STEP="health_check"
CURRENT_LABEL="Verifying server is responding"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "0")
  if [ "$CODE" = "200" ] || [ "$CODE" = "302" ] || [ "$CODE" = "307" ]; then
    break
  fi
  sleep 2
done
if [ "$CODE" != "200" ] && [ "$CODE" != "302" ] && [ "$CODE" != "307" ]; then
  fail "server not responding on port 80 (got $CODE)"
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true


# === White label check — remove footer if user has paid for it ===
if [ -n "$SERVER_TOKEN" ]; then
  WL=$(curl -s --max-time 5 \
    -H "Authorization: Bearer $SERVER_TOKEN" \
    "https://fractera-easy-starter.vercel.app/api/server/white-label" 2>/dev/null || echo "")
  if echo "$WL" | grep -q '"white_label":true'; then
    echo "White label active — removing footer from nginx" >> "$LOG_FILE"
    python3 - << 'WLEOF' >> "$LOG_FILE" 2>&1
import os
MARKERS = ['proxy_set_header Accept-Encoding ""', 'sub_filter_once on', "sub_filter '</body>'"]
for path in ['/etc/nginx/sites-available/fractera', '/etc/nginx/sites-enabled/fractera-custom']:
    try:
        lines = open(path).readlines()
        filtered = [l for l in lines if all(m not in l for m in MARKERS)]
        open(path, 'w').writelines(filtered)
        print(f'white label: cleaned {path}')
    except: pass
WLEOF
    nginx -t >> "$LOG_FILE" 2>&1 && systemctl reload nginx >> "$LOG_FILE" 2>&1
  fi
fi

# === Install ping agent cron (if SERVER_TOKEN provided) ===
if [ -n "$SERVER_TOKEN" ]; then
  sed -i "/^SERVER_TOKEN=/d" /etc/fractera/secrets.env 2>/dev/null; echo "SERVER_TOKEN=$SERVER_TOKEN" >> /etc/fractera/secrets.env
  # Cron: ping platform every 15 min, send subdomain on first ping
  CRON_CMD="*/15 * * * * curl -s -X POST $PING_URL -H 'Content-Type: application/json' -H 'Authorization: Bearer $SERVER_TOKEN' -d '{\"subdomain\":\"$SUBDOMAIN\"}' >> /var/log/fractera-ping.log 2>&1"
  (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
  echo "Ping agent installed (token: ${SERVER_TOKEN:0:8}...)" >> "$LOG_FILE"
  log_email "complete" "Server is ready — all services running on plain HTTP. Attach your own domain through Admin → Personal Domain to enable HTTPS." 100
  # Ping immediately (retry up to 5 times in case Vercel is redeploying)
  for i in 1 2 3 4 5; do
    PING_RESP=$(curl -s -X POST "$PING_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SERVER_TOKEN" \
      -d "{\"subdomain\":\"$SUBDOMAIN\"}")
    echo "[ping] attempt $i: $PING_RESP" >> /var/log/fractera-ping.log
    if echo "$PING_RESP" | grep -q '"ok":true'; then break; fi
    [ $i -lt 5 ] && sleep 30
  done
fi

# Signal completion with subdomain — retry up to 5x to survive Vercel cold starts
# In IP-mode RESPONSE is empty (no register call) — use a synthetic JSON.
_response_json="${RESPONSE:-{\"subdomain\":\"$SUBDOMAIN\",\"ip\":\"$SERVER_IP\",\"mode\":\"ip\"}}"
_done_payload="{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":$_response_json}"
for _attempt in 1 2 3 4 5; do
  _code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "$_done_payload" 2>/dev/null)
  [ "$_code" = "200" ] && break
  sleep 10
done

echo "=== Fractera bootstrap finished: $(date) ===" >> "$LOG_FILE"
echo "FRACTERA_READY: http://$SERVER_IP:3000 (app) | http://$SERVER_IP:3002 (admin) | http://$SERVER_IP:3001 (auth)"
