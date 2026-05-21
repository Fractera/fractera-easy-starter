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

# Send error and exit
fail() {
  local message="$1"
  local last_log=$(tail -c 800 "$LOG_FILE" 2>/dev/null | tr '"' "'" | tr '\n' ' ' | head -c 700)
  curl -s -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"session_id\":\"$SESSION_ID\",\"error\":\"Step '$CURRENT_LABEL' failed: $message. Last log: $last_log\"}" \
    > /dev/null 2>&1 || true
  exit 1
}

# Run a step. Args: id, label, command
step() {
  CURRENT_STEP="$1"
  CURRENT_LABEL="$2"
  local cmd="$3"
  report "$CURRENT_STEP" "$CURRENT_LABEL" false
  if ! eval "$cmd" >> "$LOG_FILE" 2>&1; then
    fail "command failed (exit $?)"
  fi
  report "$CURRENT_STEP" "$CURRENT_LABEL" true
}

echo "=== Fractera bootstrap started: $(date) ===" > "$LOG_FILE"

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

CURRENT_STEP="register_subdomains"
CURRENT_LABEL="Registering service subdomains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
BASE=$(echo "$SUBDOMAIN" | sed 's/\.fractera\.ai//')
for PREFIX in auth admin data lightrag hermes; do
  curl -s -X POST "$REGISTER_SUBDOMAIN_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"ip\":\"$SERVER_IP\",\"subdomain\":\"$PREFIX.$BASE\"}" \
    >> "$LOG_FILE" 2>&1 || fail "register $PREFIX subdomain failed"
done
report "$CURRENT_STEP" "$CURRENT_LABEL" true
# Cloudflare Total TLS now starts provisioning certs in the background.

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


step "deps_root"   "Installing dependencies (1/6)" "npm install"
step "deps_app"    "Installing dependencies (2/6)" "npm install --prefix app"

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

step "deps_bridge"      "Installing dependencies (3/6)" "npm install --prefix bridges/platforms"
step "deps_auth"        "Installing dependencies (4/6)" \
  "npm install --prefix services/auth && npm rebuild better-sqlite3 --prefix services/auth"
step "deps_bridges_app" "Installing dependencies (5/6)" \
  "npm install --prefix bridges/app && npm rebuild better-sqlite3 --prefix bridges/app"
step "deps_data"        "Installing dependencies (6/6)" \
  "npm install --prefix services/data && npm rebuild better-sqlite3 --prefix services/data && npm rebuild sharp --prefix services/data"
log_email "deps_data" "All dependencies installed" 30

# === Install AI platform binaries (soft — each failure is skipped, not fatal) ===
soft_step() {
  local id="$1"
  local label="$2"
  local cmd="$3"
  report "$id" "Installing $label" false
  if eval "$cmd" >> "$LOG_FILE" 2>&1; then
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
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIM=3072
CORS_ORIGINS=http://localhost:3002
ENVEOF

# === Hermes config (if installed) ===
if [ -d "/root/.hermes" ]; then
  cat > /root/.hermes/config.yaml <<HERMESEOF
model:
  provider: openrouter
  model: deepseek/deepseek-r1:free
  fallback_provider: openai
  fallback_model: gpt-4o-mini

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
soft_step "start_hermes" "Hermes Agent service" "HERMES_PY=/usr/local/lib/hermes-agent/venv/bin/python && HERMES_BIN=/usr/local/lib/hermes-agent/venv/bin/hermes && [ -x \"\$HERMES_BIN\" ] && pm2 start \$HERMES_BIN --name fractera-hermes --interpreter \$HERMES_PY -- dashboard --host 127.0.0.1 --port 9119 --no-open && sleep 8 && curl -sf http://127.0.0.1:9119/ >> \"$LOG_FILE\" 2>&1 || true"
soft_step "install_hermes_webui" "Hermes Web UI (Fractera-branded)" "[ -f /opt/fractera/services/hermes-webui-installer/install.sh ] && bash /opt/fractera/services/hermes-webui-installer/install.sh >> \"$LOG_FILE\" 2>&1 && sleep 4 && curl -sf http://127.0.0.1:9120/health >> \"$LOG_FILE\" 2>&1 || true"
log_email "start_data" "All 7 services started" 65

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup systemd -u root --hp /root | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
systemctl enable pm2-root >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Initial Nginx config — 4 server blocks, SUBDOMAIN_PLACEHOLDER for certbot later ===
CURRENT_STEP="configure_nginx_http"
CURRENT_LABEL="Configuring web server (HTTP)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera <<'NGINXEOF'
# shell — default server for certbot challenge
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
        sub_filter '</body>' '<script>!function(){var _t=[80,111,119,101,114,101,100,32,98,121,32,70,114,97,99,116,101,114,97],_u=[104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,70,114,97,99,116,101,114,97,47,97,105,45,119,111,114,107,115,112,97,99,101],t=_t.map(function(c){return String.fromCharCode(c)}).join(""),u=_u.map(function(c){return String.fromCharCode(c)}).join(""),s=document.createElement("style");s.textContent="body{padding-bottom:16px!important}";document.head.appendChild(s);var f=document.createElement("div");f.style.cssText="position:fixed;bottom:0;left:0;right:0;height:16px;z-index:2147483647;display:flex;align-items:center;justify-content:center;";var a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t;a.style.cssText="font-size:10px;text-decoration:none;";f.appendChild(a);document.body.appendChild(f);function g(){var d=document.documentElement.classList.contains("dark");a.style.color=d?"rgba(255,255,255,0.75)":"rgba(0,0,0,0.75)";}g();new MutationObserver(g).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});}();</script></body>';
    }
}

# auth
server {
    listen 80;
    server_name auth.SUBDOMAIN_PLACEHOLDER;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# admin + WebSocket bridges
server {
    listen 80;
    server_name admin.SUBDOMAIN_PLACEHOLDER;

    location /bridge/ {
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

    location /claude-bridge/ {
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

    location /codex-bridge/ {
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

    location /gemini-bridge/ {
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

    location /qwen-bridge/ {
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

    location /kimi-bridge/ {
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

    location / {
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
}

# data
server {
    listen 80;
    server_name data.SUBDOMAIN_PLACEHOLDER;

    location /media/ {
        proxy_pass http://127.0.0.1:3300/media/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 500m;
    }

    location / {
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# hermes — orchestration agent dashboard + Hermes Web UI chat (iframe-accessible from admin panel)
server {
    listen 80;
    server_name hermes.SUBDOMAIN_PLACEHOLDER;

    # Internal auth check — verifies Fractera session cookie via services/auth (port 3001).
    # Returns 204 if logged in, 401 otherwise. Cookie is shared across .SUB.fractera.ai
    # (COOKIE_DOMAIN=.$SUBDOMAIN in services/auth/.env).
    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }

    # Fractera-branded chat UI (nesquena/hermes-webui on port 9120) — auth-gated
    location /chat/ {
        auth_request /auth-verify;
        error_page 401 = @chat_login_redirect;

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
        proxy_buffering off;  # SSE streaming
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }
    location @chat_login_redirect {
        return 302 https://admin.SUBDOMAIN_PLACEHOLDER/;
    }

    # Hermes dashboard (admin/config UI)
    location / {
        proxy_pass http://127.0.0.1:9119;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        # Allow iframe embedding from admin subdomain
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }
}

# lightrag — Company Brain WebUI
server {
    listen 80;
    server_name lightrag.SUBDOMAIN_PLACEHOLDER;

    location ~ ^/(docs|redoc|openapi\.json)$ {
        return 404;
    }

    location = /health {
        default_type application/json;
        return 200 '{"status":"healthy","auth_mode":"disabled"}';
    }

    location = /favicon.png {
        return 204;
    }

    location / {
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

rm -f /etc/nginx/sites-enabled/default
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
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid after domain substitution"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Update .env.local with real HTTPS URLs ===
CURRENT_STEP="update_env"
CURRENT_LABEL="Updating environment with real domains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source /etc/fractera/secrets.env

cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=https://auth.$SUBDOMAIN
NEXT_PUBLIC_ADMIN_URL=https://admin.$SUBDOMAIN
NEXT_PUBLIC_MEDIA_URL=https://data.$SUBDOMAIN
APP_DB_PATH=/opt/fractera/app/data/app.db
ENVEOF

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=.$SUBDOMAIN
COOKIE_SECURE=true
NEXTAUTH_URL=https://auth.$SUBDOMAIN
DATABASE_URL=file:/opt/fractera/app/data/app.db
ALLOWED_ORIGINS=https://$SUBDOMAIN,https://admin.$SUBDOMAIN
ENVEOF

cat > /opt/fractera/bridges/app/.env.local <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=https://auth.$SUBDOMAIN
NEXT_PUBLIC_APP_URL=https://$SUBDOMAIN
NEXT_PUBLIC_MEDIA_URL=https://data.$SUBDOMAIN
NEXT_PUBLIC_BRIDGE_URL=wss://admin.$SUBDOMAIN/bridge/
NEXT_PUBLIC_PTY_URL=wss://admin.$SUBDOMAIN/bridge/
NEXT_PUBLIC_CODEX_URL=wss://admin.$SUBDOMAIN/codex-bridge/
NEXT_PUBLIC_GEMINI_URL=wss://admin.$SUBDOMAIN/gemini-bridge/
NEXT_PUBLIC_QWEN_URL=wss://admin.$SUBDOMAIN/qwen-bridge/
NEXT_PUBLIC_KIMI_URL=wss://admin.$SUBDOMAIN/kimi-bridge/
DEPLOY_SECRET=$DEPLOY_SECRET
APP_DB_PATH=/opt/fractera/app/data/app.db
FRACTERA_INSTALL_SECRET=$INSTALL_SECRET
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_LLM_OPENAI_MODEL=gpt-4o-mini
RAG_ENV_PATH=/opt/fractera/services/rag/.env
MCP_SECRET=$HERMES_MCP_SECRET
NEXT_PUBLIC_HERMES_URL=https://hermes.$SUBDOMAIN
ENVEOF

cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=https://data.$SUBDOMAIN
APP_DB_PATH=/opt/fractera/app/data/app.db
DATA_SECRET=$DATA_SECRET
ENVEOF

sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:3002,https://admin.$SUBDOMAIN|" /opt/fractera/services/rag/.env >> "$LOG_FILE" 2>&1 || true

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
for DOMAIN in "$SUBDOMAIN" "auth.$SUBDOMAIN" "admin.$SUBDOMAIN" "data.$SUBDOMAIN" "lightrag.$SUBDOMAIN" "hermes.$SUBDOMAIN"; do
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
# HTTP → HTTPS redirect (Cloudflare may send HTTP to origin in some modes)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

# shell — HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

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
        sub_filter '</body>' '<script>!function(){var _t=[80,111,119,101,114,101,100,32,98,121,32,70,114,97,99,116,101,114,97],_u=[104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,70,114,97,99,116,101,114,97,47,97,105,45,119,111,114,107,115,112,97,99,101],t=_t.map(function(c){return String.fromCharCode(c)}).join(""),u=_u.map(function(c){return String.fromCharCode(c)}).join(""),s=document.createElement("style");s.textContent="body{padding-bottom:16px!important}";document.head.appendChild(s);var f=document.createElement("div");f.style.cssText="position:fixed;bottom:0;left:0;right:0;height:16px;z-index:2147483647;display:flex;align-items:center;justify-content:center;";var a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t;a.style.cssText="font-size:10px;text-decoration:none;";f.appendChild(a);document.body.appendChild(f);function g(){var d=document.documentElement.classList.contains("dark");a.style.color=d?"rgba(255,255,255,0.75)":"rgba(0,0,0,0.75)";}g();new MutationObserver(g).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});}();</script></body>';
    }
}

# auth — HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name auth.SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# admin + WebSocket bridges — HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name admin.SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

    location /bridge/ {
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
    location /claude-bridge/ {
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
    location /codex-bridge/ {
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
    location /gemini-bridge/ {
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
    location /qwen-bridge/ {
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
    location /kimi-bridge/ {
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
    location / {
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
}

# data — HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name data.SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

    location /media/ {
        proxy_pass http://127.0.0.1:3300/media/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 500m;
    }
    location / {
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# lightrag — Company Brain WebUI — HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name lightrag.SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

    location ~ ^/(docs|redoc|openapi\.json)$ { return 404; }
    location = /health {
        default_type application/json;
        return 200 '{"status":"healthy","auth_mode":"disabled"}';
    }
    location = /favicon.png { return 204; }
    location / {
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

# hermes — orchestration agent dashboard + Hermes Web UI chat — HTTPS
# Note: Hermes has DNS rebinding protection — only accepts Host header
# matching what it was bound to (127.0.0.1). nginx rewrites Host so
# Hermes accepts external requests without --insecure flag.
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name hermes.SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

    # Internal auth check — verifies Fractera session cookie via services/auth (port 3001).
    # Returns 204 if logged in, 401 otherwise. Cookie is shared across .SUB.fractera.ai
    # (COOKIE_DOMAIN=.$SUBDOMAIN in services/auth/.env).
    location = /auth-verify {
        internal;
        proxy_pass http://127.0.0.1:3001/api/session/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Host $host;
    }

    # Fractera-branded chat UI (nesquena/hermes-webui on port 9120) — auth-gated
    location /chat/ {
        auth_request /auth-verify;
        error_page 401 = @chat_login_redirect;

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
        proxy_buffering off;  # SSE streaming
        proxy_hide_header X-Frame-Options;
        proxy_hide_header Content-Security-Policy;
        add_header X-Frame-Options "ALLOWALL";
    }
    location @chat_login_redirect {
        return 302 https://admin.SUBDOMAIN_PLACEHOLDER/;
    }

    # Hermes dashboard (admin/config UI)
    location / {
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
NGINXHTTPSEOF

sed -i "s/SUBDOMAIN_PLACEHOLDER/$SUBDOMAIN/g" /etc/nginx/sites-available/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx HTTPS config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Final HTTPS health check — verify all 6 subdomains are reachable ===
# Cloudflare Total TLS provisioning happens async after DNS registration;
# certs are usually ready by now but we wait up to 3 min per subdomain.
CURRENT_STEP="https_check"
CURRENT_LABEL="Verifying HTTPS is working (6 subdomains)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

check_subdomain() {
  local domain="$1"
  for i in $(seq 1 30); do
    local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "https://$domain" 2>/dev/null || echo "0")
    # Accept any non-5xx response — service is reachable
    if [[ "$code" =~ ^(200|301|302|307|401|403|404)$ ]]; then
      echo "  ✓ $domain → $code" >> "$LOG_FILE"
      return 0
    fi
    sleep 6
  done
  echo "  ✗ $domain → last code: $code" >> "$LOG_FILE"
  return 1
}

failed=""
for sub in "$SUBDOMAIN" "auth.$SUBDOMAIN" "admin.$SUBDOMAIN" "data.$SUBDOMAIN" "lightrag.$SUBDOMAIN" "hermes.$SUBDOMAIN"; do
  check_subdomain "$sub" || failed="$failed $sub"
done

if [ -n "$failed" ]; then
  fail "HTTPS not responding on:$failed"
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
