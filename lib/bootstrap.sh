#!/bin/bash
# Fractera Bootstrap Agent
# Reports progress + errors back to fractera-easy-starter.

SESSION_ID="$1"
PROGRESS_URL="https://fractera-easy-starter.vercel.app/api/progress"
REGISTER_URL="https://fractera-easy-starter.vercel.app/api/register"
REGISTER_SUBDOMAIN_URL="https://fractera-easy-starter.vercel.app/api/register-subdomain"
PING_URL="https://fractera-easy-starter.vercel.app/api/server/ping"
INSTALL_SECRET="$2"
PLATFORM="${3:-claude-code}"
SERVER_TOKEN="${4:-}"
SUBDOMAIN_OVERRIDE="${5:-}"
GITHUB_TOKEN="${6:-}"
LOG_FILE="/tmp/fractera-install-$SESSION_ID.log"

CURRENT_STEP=""
CURRENT_LABEL=""
INSTALL_START=$(date +%s)
# DEBUG — remove before launch
LOG_URL="https://fractera-easy-starter.vercel.app/api/server/install-log"
QUOTA_URL="https://fractera-easy-starter.vercel.app/api/quota/check"

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

# === Pre-flight: DNS quota check ===
# Additive safety net (CLAUDE.md rule 15). If Cloudflare DNS quota is
# exhausted, abort here rather than failing at register step with the
# opaque `code:81045 Record quota exceeded`. Best-effort — if /api/quota/check
# returns degraded mode (CF API unreachable), we proceed and let register
# fail downstream as before.
CURRENT_STEP="quota_check"
CURRENT_LABEL="Checking Cloudflare DNS quota"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
QUOTA_RESP=$(curl -s --max-time 15 -X GET "$QUOTA_URL" -H "x-install-secret: $INSTALL_SECRET")
QUOTA_STATUS=$(echo "$QUOTA_RESP" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
QUOTA_COUNT=$(echo "$QUOTA_RESP" | grep -o '"count":-\?[0-9]*' | head -1 | cut -d':' -f2)
QUOTA_LIMIT=$(echo "$QUOTA_RESP" | grep -o '"limit":-\?[0-9]*' | head -1 | cut -d':' -f2)
echo "[quota] status=$QUOTA_STATUS count=$QUOTA_COUNT limit=$QUOTA_LIMIT" >> "$LOG_FILE"
if [ "$QUOTA_STATUS" = "critical" ]; then
  fail "Cloudflare DNS quota exhausted ($QUOTA_COUNT/$QUOTA_LIMIT). Deploy aborted before touching the server. Admin has been notified."
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

step "apt_update"   "Updating system"         "rm -f /etc/apt/sources.list.d/nodesource.list /usr/share/keyrings/nodesource.gpg /etc/apt/keyrings/nodesource.gpg 2>/dev/null; apt-get update -qq"
step "apt_install"  "Installing base tools"   "apt-get install -y -qq git curl nginx build-essential dnsutils zsh"
step "node_repo"    "Adding Node.js repository" "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
step "node_install" "Installing Node.js 20"   "apt-get install -y nodejs"
step "pm2"             "Installing PM2 process manager" "npm install -g pm2"
log_email "pm2" "Node.js + PM2 installed" 10

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

# === EARLY DOMAIN REGISTRATION ===
# Register the main subdomain and all 5 service subdomains BEFORE the heavy
# install steps. This way Cloudflare Total TLS starts provisioning edge
# certificates in parallel with the bootstrap — by the time we finish
# install (~15-20 min later), certs are ready. No SSL waiting at the end.
CURRENT_STEP="register"
CURRENT_LABEL="Registering your domain"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
if [ -n "$SUBDOMAIN_OVERRIDE" ]; then
  SUBDOMAIN="$SUBDOMAIN_OVERRIDE"
  echo "Using existing subdomain: $SUBDOMAIN" >> "$LOG_FILE"
  # Still need SERVER_IP for register-subdomain
  SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
else
  SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
  if [ -z "$SERVER_IP" ]; then
    fail "could not detect server IP"
  fi
  RESPONSE=$(curl -s -X POST "$REGISTER_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"ip\":\"$SERVER_IP\",\"session_id\":\"$SESSION_ID\"}")
  if ! echo "$RESPONSE" | grep -q '"subdomain"'; then
    fail "domain registration failed: $RESPONSE"
  fi
  SUBDOMAIN=$(echo "$RESPONSE" | grep -o '"subdomain":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$SUBDOMAIN" ]; then
    fail "could not parse subdomain from response: $RESPONSE"
  fi
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# Path-based architecture (step 75+): 3 DNS records per customer (was 6).
# Core services (auth, admin, data) via path-routing on <slug>.fractera.ai.
# Hermes and LightRAG get dedicated 3rd-level subdomains because their SPA
# dashboards hardcode root-relative API calls (/api/status, /api/sessions)
# that cannot be rewritten via nginx sub_filter (they're in compiled JS).
# Universal SSL *.fractera.ai (Free) covers all three 3rd-level hosts.
CURRENT_STEP="register_subdomains"
CURRENT_LABEL="Registering Hermes and LightRAG subdomains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
BASE=$(echo "$SUBDOMAIN" | sed 's/\.fractera\.ai//')
for PREFIX in hermes lightrag; do
  curl -s -X POST "$REGISTER_SUBDOMAIN_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"ip\":\"$SERVER_IP\",\"subdomain\":\"$PREFIX-$BASE\"}" \
    >> "$LOG_FILE" 2>&1 || fail "register $PREFIX subdomain failed"
done
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
soft_step "install_kimi"     "Kimi Code"   "curl -LsSf https://astral.sh/uv/install.sh | sh && export PATH=\"\$HOME/.local/bin:\$PATH\" && \$HOME/.local/bin/uv tool install --python 3.13 kimi-cli && ln -sf \$HOME/.local/bin/kimi /usr/local/bin/kimi || true"
soft_step "install_lightrag" "LightRAG"    "export PATH=\"\$HOME/.local/bin:\$PATH\" && \$HOME/.local/bin/uv tool install 'lightrag-hku[api] @ git+https://github.com/Fractera/LightRAG.git@v1.4.16' || true"
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
soft_step "install_hermes"  "Hermes Agent" "curl -fsSL https://raw.githubusercontent.com/Fractera/hermes-agent/main/scripts/install.sh | bash -s -- --skip-setup --skip-browser --branch v2026.5.16 || true"
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

cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_MEDIA_URL=http://localhost:3300
APP_DB_PATH=/opt/fractera/app/data/app.db
ENVEOF

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=
COOKIE_SECURE=false
NEXTAUTH_URL=http://localhost:3001
BASE_PATH=enabled
DATABASE_URL=file:/opt/fractera/app/data/app.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
ENVEOF

cat > /opt/fractera/bridges/app/.env.local <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MEDIA_URL=http://localhost:3300
NEXT_PUBLIC_BRIDGE_URL=ws://localhost:3201/bridge/
NEXT_PUBLIC_PTY_URL=ws://localhost:3201/bridge/
NEXT_PUBLIC_CODEX_URL=ws://localhost:3202/
NEXT_PUBLIC_GEMINI_URL=ws://localhost:3203/
NEXT_PUBLIC_QWEN_URL=ws://localhost:3204/
NEXT_PUBLIC_KIMI_URL=ws://localhost:3205/
DEPLOY_SECRET=$DEPLOY_SECRET
BASE_PATH=enabled
APP_DB_PATH=/opt/fractera/app/data/app.db
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_LLM_OPENAI_MODEL=gpt-4o-mini
RAG_ENV_PATH=/opt/fractera/services/rag/.env
ENVEOF

cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=http://localhost:3300
APP_DB_PATH=/opt/fractera/app/data/app.db
DATA_SECRET=$DATA_SECRET
ENVEOF

cat > /opt/fractera/services/rag/.env <<ENVEOF
HOST=127.0.0.1
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
  model: gpt-5.3-codex
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
soft_step "start_rag" "LightRAG service" "RAG_PY=\$HOME/.local/share/uv/tools/lightrag-hku/bin/python && RAG_BIN=\$HOME/.local/share/uv/tools/lightrag-hku/bin/lightrag-server && cd /opt/fractera/services/rag && pm2 start \$RAG_BIN --name fractera-rag --interpreter \$RAG_PY --cwd /opt/fractera/services/rag -- --root-path /lightrag && cd /opt/fractera && for i in \$(seq 1 10); do curl -sf http://127.0.0.1:9621/health >> \"$LOG_FILE\" 2>&1 && break || sleep 3; done"
soft_step "start_hermes" "Hermes Agent service" "HERMES_PY=/usr/local/lib/hermes-agent/venv/bin/python && HERMES_BIN=/usr/local/lib/hermes-agent/venv/bin/hermes && [ -x \"\$HERMES_BIN\" ] && pm2 start \$HERMES_BIN --name fractera-hermes --interpreter \$HERMES_PY -- dashboard --host 127.0.0.1 --port 9119 --no-open --base-path /hermes && sleep 8 && curl -sf http://127.0.0.1:9119/ >> \"$LOG_FILE\" 2>&1 || true"
soft_step "install_hermes_webui" "Hermes Web UI (Fractera-branded)" "[ -f /opt/fractera/services/hermes-webui-installer/install.sh ] && bash /opt/fractera/services/hermes-webui-installer/install.sh >> \"$LOG_FILE\" 2>&1 && sleep 4 && curl -sf http://127.0.0.1:9120/health >> \"$LOG_FILE\" 2>&1 || true"
log_email "start_data" "All 7 services started" 65

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup systemd -u root --hp /root | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
systemctl enable pm2-root >> "$LOG_FILE" 2>&1 || true
loginctl enable-linger root >> "$LOG_FILE" 2>&1 || true
# pm2-root.service ships with Restart=on-failure — but the PM2 daemon sometimes
# exits 0 (OOM / systemd user-slice cleanup); on-failure then does NOT restart it
# and the server falls into 502. Override to Restart=always so the daemon always
# comes back. (proven in Light step 72/74)
sed -i 's/^Restart=on-failure$/Restart=always\nRestartSec=10/' /etc/systemd/system/pm2-root.service >> "$LOG_FILE" 2>&1 || true
systemctl daemon-reload >> "$LOG_FILE" 2>&1 || true
# CRITICAL: bootstrap runs under systemd-run --scope. When this script exits the
# scope unit closes and systemd kills every process in its cgroup — including the
# PM2 daemon. systemctl restart pm2-root moves the daemon out of the scope into
# the persistent service.
pm2 kill >> "$LOG_FILE" 2>&1 || true
systemctl restart pm2-root >> "$LOG_FILE" 2>&1 || true
sleep 3
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Initial Nginx config — 4 server blocks, SUBDOMAIN_PLACEHOLDER for certbot later ===
CURRENT_STEP="configure_nginx_http"
CURRENT_LABEL="Configuring web server (HTTP)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera <<'NGINXEOF'
# Single server block — path-based routing (step 75+ migration, full main).
# Ports: app 3000 | auth 3001 (assetPrefix=/_auth_next) | admin 3002 (basePath=/admin)
#        data 3300 (Express) | bridge WS 3200-3205 | hermes 9119 | hermes-webui 9120 | lightrag 9621
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Internal auth check — verifies Fractera session via services/auth (3001).
    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }
    location @login_redirect { return 302 /admin/; }

    # Auth assets (Next.js assetPrefix=/_auth_next)
    location /_auth_next/ {
        rewrite ^/_auth_next(/.*)?$ $1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # NextAuth endpoints — auth serves them at root (no basePath)
    location /api/auth/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin API — client calls /api/<ns>/, admin (basePath=/admin) serves /admin/api/<ns>/
    location ~ ^/api/(db|config|bridges|deploy|data|hermes|rag|admin)(/.*)?$ {
        rewrite ^/api/(.*)$ /admin/api/$1 break;
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        client_max_body_size 100m;
    }

    # Auth UI pages — strip /auth/ (auth has no basePath)
    location /auth/ {
        rewrite ^/auth/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket bridges (3200-3205) under /admin/ — proxy_pass URI strips the prefix
    location /admin/bridge/ {
        proxy_pass http://127.0.0.1:3201/bridge/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/claude-bridge/ {
        proxy_pass http://127.0.0.1:3200/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/codex-bridge/ {
        proxy_pass http://127.0.0.1:3202/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/gemini-bridge/ {
        proxy_pass http://127.0.0.1:3203/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/qwen-bridge/ {
        proxy_pass http://127.0.0.1:3204/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/kimi-bridge/ {
        proxy_pass http://127.0.0.1:3205/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Admin (Next.js basePath=/admin, no rewrite)
    location /admin/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Data (Express) — strip /data/
    location /data/media/ {
        rewrite ^/data/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 500m;
    }
    location /data/ {
        rewrite ^/data/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }




    # Shell / app (catch-all) + Powered by Fractera footer
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
        sub_filter '</body>' '<script>!function(){var _t=[80,111,119,101,114,101,100,32,98,121,32,70,114,97,99,116,101,114,97],_u=[104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,70,114,97,99,116,101,114,97,47,97,105,45,119,111,114,107,115,112,97,99,101],t=_t.map(function(c){return String.fromCharCode(c)}).join(""),u=_u.map(function(c){return String.fromCharCode(c)}).join(""),f=document.createElement("div");f.style.cssText="width:100%;padding:16px 0;display:flex;align-items:center;justify-content:center;";var a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t;a.style.cssText="font-size:10px;text-decoration:none;";f.appendChild(a);document.body.appendChild(f);function g(){var d=document.documentElement.classList.contains("dark");a.style.color=d?"rgba(255,255,255,0.75)":"rgba(0,0,0,0.75)";}g();new MutationObserver(g).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});}();</script></body>';
    }
}
# Hermes Agent dashboard + Web UI chat — dedicated 3rd-level subdomain.
# SPA with root-hardcoded /api/* calls — cannot work under path prefix.
server {
    listen 80;
    server_name hermes-SLUG_PLACEHOLDER.fractera.ai;

    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }
    location @login_redirect { return 302 https://SUBDOMAIN_PLACEHOLDER/admin/; }

    location /chat/ {
        auth_request /auth-verify;
        error_page 401 = @login_redirect;
        proxy_pass http://127.0.0.1:9120/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host 127.0.0.1:9120;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 86400;
        proxy_buffering off;
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }

    location / {
        auth_request /auth-verify;
        error_page 401 = @login_redirect;
        proxy_pass http://127.0.0.1:9119;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host 127.0.0.1:9119;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 86400;
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }
}

# LightRAG / Company Brain — dedicated 3rd-level subdomain.
# SPA with root-hardcoded /webui, /assets/*, /api/* — cannot work under path prefix.
server {
    listen 80;
    server_name lightrag-SLUG_PLACEHOLDER.fractera.ai;

    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }
    location @login_redirect { return 302 https://SUBDOMAIN_PLACEHOLDER/admin/; }

    location ~ ^/(docs|redoc|openapi\.json)$ { return 404; }
    location = /health {
        default_type application/json;
        return 200 '{"status":"healthy","auth_mode":"disabled"}';
    }
    location = /favicon.png { return 204; }

    location / {
        auth_request /auth-verify;
        error_page 401 = @login_redirect;
        proxy_pass http://127.0.0.1:9621;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Accept-Encoding "";
        sub_filter_once off;
        sub_filter 'LightRAG' 'Company Brain';
        sub_filter '</head>' '<style>[href*="github"],[class*="version"],.bg-amber-100{display:none!important}</style><script>(function(){function fix(){var t=document.querySelector("title");if(t&&t.textContent.indexOf("LightRAG")>=0)t.textContent=t.textContent.replace(/LightRAG/g,"Company Brain");}new MutationObserver(fix).observe(document,{subtree:true,characterData:true,childList:true});fix();})();</script></head>';
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

# === Update Nginx with real server_name ===
CURRENT_STEP="nginx_domains"
CURRENT_LABEL="Updating web server with real domains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
sed -i "s/SUBDOMAIN_PLACEHOLDER/$SUBDOMAIN/g" /etc/nginx/sites-available/fractera
sed -i "s/SLUG_PLACEHOLDER/$BASE/g" /etc/nginx/sites-available/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid after domain substitution"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Update .env.local with real HTTPS URLs ===
CURRENT_STEP="update_env"
CURRENT_LABEL="Updating environment with real domains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source /etc/fractera/secrets.env

# Path-based real URLs (step 75+): all services on the single <slug> host.
cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=https://$SUBDOMAIN/auth
NEXT_PUBLIC_ADMIN_URL=https://$SUBDOMAIN/admin
NEXT_PUBLIC_MEDIA_URL=https://$SUBDOMAIN/data
APP_DB_PATH=/opt/fractera/app/data/app.db
DEPLOY_SECRET=$DEPLOY_SECRET
ENVEOF

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=
COOKIE_SECURE=true
NEXTAUTH_URL=https://$SUBDOMAIN
BASE_PATH=enabled
DATABASE_URL=file:/opt/fractera/app/data/app.db
ALLOWED_ORIGINS=https://$SUBDOMAIN
ENVEOF

cat > /opt/fractera/bridges/app/.env.local <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=https://$SUBDOMAIN/auth
NEXT_PUBLIC_APP_URL=https://$SUBDOMAIN
NEXT_PUBLIC_MEDIA_URL=https://$SUBDOMAIN/data
NEXT_PUBLIC_BRIDGE_URL=wss://$SUBDOMAIN/admin/bridge/
NEXT_PUBLIC_PTY_URL=wss://$SUBDOMAIN/admin/bridge/
NEXT_PUBLIC_CODEX_URL=wss://$SUBDOMAIN/admin/codex-bridge/
NEXT_PUBLIC_GEMINI_URL=wss://$SUBDOMAIN/admin/gemini-bridge/
NEXT_PUBLIC_QWEN_URL=wss://$SUBDOMAIN/admin/qwen-bridge/
NEXT_PUBLIC_KIMI_URL=wss://$SUBDOMAIN/admin/kimi-bridge/
DEPLOY_SECRET=$DEPLOY_SECRET
BASE_PATH=enabled
APP_DB_PATH=/opt/fractera/app/data/app.db
FRACTERA_INSTALL_SECRET=$INSTALL_SECRET
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_LLM_OPENAI_MODEL=gpt-4o-mini
RAG_ENV_PATH=/opt/fractera/services/rag/.env
MCP_SECRET=$HERMES_MCP_SECRET
NEXT_PUBLIC_HERMES_URL=https://hermes-$BASE.fractera.ai
NEXT_PUBLIC_BRAIN_URL=https://lightrag-$BASE.fractera.ai
ENVEOF

cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=https://$SUBDOMAIN/data
APP_DB_PATH=/opt/fractera/app/data/app.db
DATA_SECRET=$DATA_SECRET
ENVEOF

sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:3002,https://$SUBDOMAIN|" /opt/fractera/services/rag/.env >> "$LOG_FILE" 2>&1 || true

# === Validate critical env vars are not empty or localhost ===
MEDIA_VAL=$(grep "^DATA_PUBLIC_URL=" /opt/fractera/services/data/.env | cut -d'=' -f2)
APP_VAL=$(grep "^NEXT_PUBLIC_APP_URL=" /opt/fractera/bridges/app/.env.local | cut -d'=' -f2)
MEDIA_ADMIN_VAL=$(grep "^NEXT_PUBLIC_MEDIA_URL=" /opt/fractera/bridges/app/.env.local | cut -d'=' -f2)

if [ -z "$MEDIA_VAL" ] || echo "$MEDIA_VAL" | grep -q "localhost"; then
  fail "DATA_PUBLIC_URL is empty or localhost in services/data/.env — Vercel deploy may not be ready"
fi
if [ -z "$APP_VAL" ] || echo "$APP_VAL" | grep -q "localhost"; then
  fail "NEXT_PUBLIC_APP_URL is empty or localhost in bridges/app/.env.local — Vercel deploy may not be ready"
fi
if [ -z "$MEDIA_ADMIN_VAL" ] || echo "$MEDIA_ADMIN_VAL" | grep -q "localhost"; then
  fail "NEXT_PUBLIC_MEDIA_URL is empty or localhost in bridges/app/.env.local — Vercel deploy may not be ready"
fi
echo "ENV VALIDATION PASSED: all critical vars have real domains" >> "$LOG_FILE"

report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Rebuild with real URLs (NEXT_PUBLIC_* are baked at build time) ===
log_email "rebuild_start" "Domain registered — rebuilding with real URLs" 75
# CRITICAL: stop the build-having processes BEFORE removing .next. Otherwise PM2's
# internal autorestart catches a running process with an empty .next (between rm and
# build completion) in a crash loop → ENOENT required-server-files.json → 502 after
# "done". data/bridge/rag/hermes have no .next. (proven in Light step 73)
pm2 stop fractera-app fractera-auth fractera-admin >> "$LOG_FILE" 2>&1 || true
rm -rf /opt/fractera/app/.next /opt/fractera/services/auth/.next /opt/fractera/bridges/app/.next
step "rebuild_app"         "Rebuilding shell with domain"   "npm run build --prefix app"
step "rebuild_auth"        "Rebuilding auth with domain"    "npm run build --prefix services/auth"
step "rebuild_bridges_app" "Rebuilding admin with domain"   "npm run build --prefix bridges/app"

CURRENT_STEP="pm2_restart"
CURRENT_LABEL="Restarting services with new config"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 restart fractera-app fractera-auth fractera-admin fractera-data >> "$LOG_FILE" 2>&1 || fail "pm2 restart failed"
pm2 restart fractera-rag >> "$LOG_FILE" 2>&1 || true
pm2 restart fractera-hermes >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Install certbot (done here — after builds, right before it's needed) ===
log_email "get_cf_cert" "Waiting for DNS + activating HTTPS" 85

# === Wait for DNS propagation (Cloudflare proxy — resolves to CF IPs, not server IP) ===
CURRENT_STEP="wait_dns"
CURRENT_LABEL="Waiting for DNS to propagate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
# 3 DNS records: main + hermes-SLUG + lightrag-SLUG.
for DOMAIN in "$SUBDOMAIN" "hermes-$BASE.fractera.ai" "lightrag-$BASE.fractera.ai"; do
  RESOLVED=""
  for i in $(seq 1 60); do
    RESOLVED=$(dig +short "$DOMAIN" @1.1.1.1 2>/dev/null | head -1)
    if [ -n "$RESOLVED" ]; then
      break
    fi
    sleep 5
  done
  if [ -z "$RESOLVED" ]; then
    fail "DNS did not propagate within 5 minutes: $DOMAIN (no answer)"
  fi
  echo "DNS OK: $DOMAIN → $RESOLVED" >> "$LOG_FILE"
done
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Download Cloudflare Origin Certificate from Easy Starter ===
CURRENT_STEP="get_cf_cert"
CURRENT_LABEL="Downloading Cloudflare SSL certificate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
mkdir -p /etc/ssl/cloudflare
CF_JSON_FILE=$(mktemp)
curl -sf -H "x-install-secret: $INSTALL_SECRET" \
  "https://fractera-easy-starter.vercel.app/api/ssl-cert" \
  -o "$CF_JSON_FILE" 2>>"$LOG_FILE" \
  || { rm -f "$CF_JSON_FILE"; fail "could not download Cloudflare Origin Certificate from Easy Starter"; }
CF_JSON_FILE="$CF_JSON_FILE" python3 - >> "$LOG_FILE" 2>&1 <<'PYEOF' || { rm -f "$CF_JSON_FILE"; fail "could not write Cloudflare Origin Certificate"; }
import json, os
with open(os.environ['CF_JSON_FILE']) as f:
    d = json.load(f)
open('/etc/ssl/cloudflare/origin.crt', 'w').write(d['cert'])
open('/etc/ssl/cloudflare/origin.key', 'w').write(d['key'])
os.chmod('/etc/ssl/cloudflare/origin.key', 0o600)
print('CF cert written')
PYEOF
rm -f "$CF_JSON_FILE"
# Shared SSL parameters include
cat > /etc/nginx/cf-ssl.conf << 'SSLEOF'
ssl_certificate /etc/ssl/cloudflare/origin.crt;
ssl_certificate_key /etc/ssl/cloudflare/origin.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
SSLEOF
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Configure HTTPS nginx (Cloudflare Origin cert — no Let's Encrypt needed) ===
CURRENT_STEP="ssl_cert"
CURRENT_LABEL="Configuring HTTPS with Cloudflare certificate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera <<'NGINXHTTPSEOF'
# HTTP -> HTTPS redirect (Cloudflare may send HTTP to origin in some modes)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS — single server block, path-based routing (step 75+ migration, full main).
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

    # Internal auth check — verifies Fractera session via services/auth (3001).
    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }
    location @login_redirect { return 302 /admin/; }

    # Auth assets (Next.js assetPrefix=/_auth_next)
    location /_auth_next/ {
        rewrite ^/_auth_next(/.*)?$ $1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # NextAuth endpoints — auth serves them at root (no basePath)
    location /api/auth/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin API — client calls /api/<ns>/, admin (basePath=/admin) serves /admin/api/<ns>/
    location ~ ^/api/(db|config|bridges|deploy|data|hermes|rag|admin)(/.*)?$ {
        rewrite ^/api/(.*)$ /admin/api/$1 break;
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        client_max_body_size 100m;
    }

    # Auth UI pages — strip /auth/ (auth has no basePath)
    location /auth/ {
        rewrite ^/auth/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket bridges (3200-3205) under /admin/ — proxy_pass URI strips the prefix
    location /admin/bridge/ {
        proxy_pass http://127.0.0.1:3201/bridge/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/claude-bridge/ {
        proxy_pass http://127.0.0.1:3200/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/codex-bridge/ {
        proxy_pass http://127.0.0.1:3202/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/gemini-bridge/ {
        proxy_pass http://127.0.0.1:3203/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/qwen-bridge/ {
        proxy_pass http://127.0.0.1:3204/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /admin/kimi-bridge/ {
        proxy_pass http://127.0.0.1:3205/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Admin (Next.js basePath=/admin, no rewrite)
    location /admin/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Data (Express) — strip /data/
    location /data/media/ {
        rewrite ^/data/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 500m;
    }
    location /data/ {
        rewrite ^/data/(.*) /$1 break;
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }




    # Shell / app (catch-all) + Powered by Fractera footer
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
        sub_filter '</body>' '<script>!function(){var _t=[80,111,119,101,114,101,100,32,98,121,32,70,114,97,99,116,101,114,97],_u=[104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,70,114,97,99,116,101,114,97,47,97,105,45,119,111,114,107,115,112,97,99,101],t=_t.map(function(c){return String.fromCharCode(c)}).join(""),u=_u.map(function(c){return String.fromCharCode(c)}).join(""),f=document.createElement("div");f.style.cssText="width:100%;padding:16px 0;display:flex;align-items:center;justify-content:center;";var a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t;a.style.cssText="font-size:10px;text-decoration:none;";f.appendChild(a);document.body.appendChild(f);function g(){var d=document.documentElement.classList.contains("dark");a.style.color=d?"rgba(255,255,255,0.75)":"rgba(0,0,0,0.75)";}g();new MutationObserver(g).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});}();</script></body>';
    }
}
# Hermes Agent dashboard + Web UI chat — dedicated 3rd-level subdomain.
# SPA with root-hardcoded /api/* calls — cannot work under path prefix.
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name hermes-SLUG_PLACEHOLDER.fractera.ai;
    include /etc/nginx/cf-ssl.conf;

    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }
    location @login_redirect { return 302 https://SUBDOMAIN_PLACEHOLDER/admin/; }

    location /chat/ {
        auth_request /auth-verify;
        error_page 401 = @login_redirect;
        proxy_pass http://127.0.0.1:9120/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host 127.0.0.1:9120;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 86400;
        proxy_buffering off;
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }

    location / {
        auth_request /auth-verify;
        error_page 401 = @login_redirect;
        proxy_pass http://127.0.0.1:9119;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host 127.0.0.1:9119;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 86400;
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }
}

# LightRAG / Company Brain — dedicated 3rd-level subdomain.
# SPA with root-hardcoded /webui, /assets/*, /api/* — cannot work under path prefix.
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name lightrag-SLUG_PLACEHOLDER.fractera.ai;
    include /etc/nginx/cf-ssl.conf;

    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }
    location @login_redirect { return 302 https://SUBDOMAIN_PLACEHOLDER/admin/; }

    location ~ ^/(docs|redoc|openapi\.json)$ { return 404; }
    location = /health {
        default_type application/json;
        return 200 '{"status":"healthy","auth_mode":"disabled"}';
    }
    location = /favicon.png { return 204; }

    location / {
        auth_request /auth-verify;
        error_page 401 = @login_redirect;
        proxy_pass http://127.0.0.1:9621;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Accept-Encoding "";
        sub_filter_once off;
        sub_filter 'LightRAG' 'Company Brain';
        sub_filter '</head>' '<style>[href*="github"],[class*="version"],.bg-amber-100{display:none!important}</style><script>(function(){function fix(){var t=document.querySelector("title");if(t&&t.textContent.indexOf("LightRAG")>=0)t.textContent=t.textContent.replace(/LightRAG/g,"Company Brain");}new MutationObserver(fix).observe(document,{subtree:true,characterData:true,childList:true});fix();})();</script></head>';
    }
}

NGINXHTTPSEOF

sed -i "s/SUBDOMAIN_PLACEHOLDER/$SUBDOMAIN/g" /etc/nginx/sites-available/fractera
sed -i "s/SLUG_PLACEHOLDER/$BASE/g" /etc/nginx/sites-available/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx HTTPS config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Final HTTPS health check — verify all 6 subdomains are reachable ===
# What's really going on: Cloudflare Total TLS provisions edge certs
# asynchronously after the DNS record exists. Usually within 2-5 min, but
# Cloudflare publicly documents that individual hostnames can take up to
# 30 min — provisioning is per-hostname, not bulk.
#
# Critical insight (learned the hard way after a misdiagnosis): if a
# hostname is mid-provisioning, you must NOT bump the DNS record. A
# DELETE+POST resets the provisioning queue for that hostname and erases
# whatever progress Cloudflare had made — making the wait LONGER, not
# shorter. The correct approach is simply: wait longer.
#
# Strategy:
#   1. Parallel probing of all 6 with a single 10-minute window (vs. the
#      old 18-min sequential worst case, and good case is much faster).
#   2. If apex + every required service-side hostname is up, accept the
#      result as a "partial success" and mark the deploy done. The slow
#      hostname's edge cert finishes provisioning on its own in the
#      background while the user already has a usable server.
#   3. Only if the apex itself is missing — that's a real failure.
CURRENT_STEP="https_check"
CURRENT_LABEL="Verifying HTTPS is working"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

probe_subdomain() {
  local domain="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "https://$domain" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|307|401|403|404)$ ]]; then
    echo "ok:$code"
  else
    echo "fail:$code"
  fi
}

# Poll the given subdomains in parallel until all are reachable or timeout.
# Echoes the still-failing list (empty on full success).
wait_for_subs() {
  local timeout_secs="$1"; shift
  local deadline=$(( $(date +%s) + timeout_secs ))
  local pending=("$@")
  while [ ${#pending[@]} -gt 0 ] && [ "$(date +%s)" -lt "$deadline" ]; do
    local still=()
    local tmpdir; tmpdir=$(mktemp -d)
    for sub in "${pending[@]}"; do
      ( probe_subdomain "$sub" > "$tmpdir/$sub" ) &
    done
    wait
    for sub in "${pending[@]}"; do
      local r; r=$(cat "$tmpdir/$sub" 2>/dev/null)
      if [[ "$r" == ok:* ]]; then
        echo "  ✓ $sub → ${r#ok:}" >> "$LOG_FILE"
      else
        still+=("$sub")
      fi
    done
    rm -rf "$tmpdir"
    pending=("${still[@]}")
    if [ ${#pending[@]} -gt 0 ] && [ "$(date +%s)" -lt "$deadline" ]; then
      sleep 4
    fi
  done
  for sub in "${pending[@]}"; do echo "$sub"; done
}

ALL_SUBS=("$SUBDOMAIN" "hermes-$BASE.fractera.ai" "lightrag-$BASE.fractera.ai")

echo "  HTTPS verification (parallel, up to 10 min)" >> "$LOG_FILE"
mapfile -t still_failing < <(wait_for_subs 600 "${ALL_SUBS[@]}")

# Partial-success rule: as long as the apex subdomain is reachable, the
# server is usable — auxiliary subdomains' edge certs finish provisioning
# in the background. The welcome email already advises "check spam if
# you do not see it"; we add a similar nudge in the log so a future
# debugger sees why a partial was accepted.
apex_failed=false
for sub in "${still_failing[@]}"; do
  if [ "$sub" = "$SUBDOMAIN" ]; then apex_failed=true; fi
done

if [ "$apex_failed" = "true" ]; then
  failed_msg=""
  for sub in "${still_failing[@]}"; do failed_msg="$failed_msg $sub"; done
  fail "HTTPS not responding on:$failed_msg"
fi

if [ ${#still_failing[@]} -gt 0 ]; then
  echo "  ⚠ Partial success — these subdomains still provisioning edge certs (will catch up in background):" >> "$LOG_FILE"
  for sub in "${still_failing[@]}"; do echo "    · $sub" >> "$LOG_FILE"; done
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
  log_email "complete" "Server is ready! SSL installed, all services running" 100
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
_done_payload="{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":$RESPONSE}"
for _attempt in 1 2 3 4 5; do
  _code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "$_done_payload" 2>/dev/null)
  [ "$_code" = "200" ] && break
  sleep 10
done

echo "=== Fractera bootstrap finished: $(date) ===" >> "$LOG_FILE"
echo "FRACTERA_READY: https://$SUBDOMAIN"
