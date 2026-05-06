#!/bin/bash
# Fractera Bootstrap Agent
# Reports progress + errors back to fractera-easy-starter.

SESSION_ID="$1"
PROGRESS_URL="https://fractera-easy-starter.vercel.app/api/progress"
REGISTER_URL="https://fractera-easy-starter.vercel.app/api/register"
REGISTER_SUBDOMAIN_URL="https://fractera-easy-starter.vercel.app/api/register-subdomain"
INSTALL_SECRET="$2"
PLATFORM="${3:-claude-code}"
LOG_FILE="/tmp/fractera-install-$SESSION_ID.log"

CURRENT_STEP=""
CURRENT_LABEL=""

# Send a step update (start or finish)
report() {
  local id="$1"
  local label="$2"
  local done="$3"
  curl -s -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"session_id\":\"$SESSION_ID\",\"step\":{\"id\":\"$id\",\"label\":\"$label\",\"done\":$done,\"ts\":$(date +%s000)}}" \
    > /dev/null 2>&1 || true
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

step "clone" "Downloading Fractera" \
  "rm -rf /opt/fractera && git clone https://github.com/Fractera/ai-workspace.git /opt/fractera"

cd /opt/fractera || fail "Cannot cd to /opt/fractera"


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
chmod 600 "$SECRETS_FILE"
source "$SECRETS_FILE"
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
ENVEOF

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=
COOKIE_SECURE=false
NEXTAUTH_URL=http://localhost:3001
DATABASE_URL=file:./data/auth.db
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
ENVEOF

cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=http://localhost:3300
ENVEOF

report "$CURRENT_STEP" "$CURRENT_LABEL" true

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

# === Register main domain ===
CURRENT_STEP="register"
CURRENT_LABEL="Registering your domain"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
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
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Register auth.*, admin.*, data.* subdomains ===
CURRENT_STEP="register_subdomains"
CURRENT_LABEL="Registering service subdomains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
# SUBDOMAIN = "happy-wolf-86.fractera.ai", BASE = "happy-wolf-86"
BASE=$(echo "$SUBDOMAIN" | sed 's/\.fractera\.ai//')
for PREFIX in auth admin data; do
  curl -s -X POST "$REGISTER_SUBDOMAIN_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"ip\":\"$SERVER_IP\",\"subdomain\":\"$PREFIX.$BASE\"}" \
    >> "$LOG_FILE" 2>&1 || fail "register $PREFIX subdomain failed"
done
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
ENVEOF

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=.$SUBDOMAIN
COOKIE_SECURE=true
NEXTAUTH_URL=https://auth.$SUBDOMAIN
DATABASE_URL=file:./data/auth.db
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
ENVEOF

cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=https://data.$SUBDOMAIN
ENVEOF

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
step "rebuild_app"         "Rebuilding shell with domain"   "npm run build --prefix app"
step "rebuild_auth"        "Rebuilding auth with domain"    "npm run build --prefix services/auth"
step "rebuild_bridges_app" "Rebuilding admin with domain"   "npm run build --prefix bridges/app"

CURRENT_STEP="pm2_restart"
CURRENT_LABEL="Restarting services with new config"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 restart fractera-app fractera-auth fractera-admin fractera-data >> "$LOG_FILE" 2>&1 || fail "pm2 restart failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Install certbot (done here — after builds, right before it's needed) ===
step "install_certbot" "Installing SSL tools" "apt-get install -y -qq certbot python3-certbot-nginx"

# === Wait for DNS propagation for all 4 domains ===
CURRENT_STEP="wait_dns"
CURRENT_LABEL="Waiting for DNS to propagate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
for DOMAIN in "$SUBDOMAIN" "auth.$SUBDOMAIN" "admin.$SUBDOMAIN" "data.$SUBDOMAIN"; do
  RESOLVED=""
  for i in $(seq 1 60); do
    RESOLVED=$(dig +short "$DOMAIN" @1.1.1.1 2>/dev/null | head -1)
    if [ "$RESOLVED" = "$SERVER_IP" ]; then
      break
    fi
    sleep 5
  done
  if [ "$RESOLVED" != "$SERVER_IP" ]; then
    fail "DNS did not propagate within 5 minutes: $DOMAIN resolves to '$RESOLVED', expected $SERVER_IP"
  fi
done
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Get SSL certificates for all 4 domains ===
CURRENT_STEP="ssl_cert"
CURRENT_LABEL="Getting SSL certificates"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
certbot --nginx -d "$SUBDOMAIN" --non-interactive --agree-tos --email noreply@fractera.ai --redirect --no-eff-email \
  >> "$LOG_FILE" 2>&1 || fail "certbot failed for $SUBDOMAIN"
certbot --nginx -d "auth.$SUBDOMAIN" --non-interactive --agree-tos --email noreply@fractera.ai --redirect --no-eff-email \
  >> "$LOG_FILE" 2>&1 || fail "certbot failed for auth.$SUBDOMAIN"
certbot --nginx -d "admin.$SUBDOMAIN" --non-interactive --agree-tos --email noreply@fractera.ai --redirect --no-eff-email \
  >> "$LOG_FILE" 2>&1 || fail "certbot failed for admin.$SUBDOMAIN"
certbot --nginx -d "data.$SUBDOMAIN" --non-interactive --agree-tos --email noreply@fractera.ai --redirect --no-eff-email \
  >> "$LOG_FILE" 2>&1 || fail "certbot failed for data.$SUBDOMAIN"

systemctl enable certbot.timer >> "$LOG_FILE" 2>&1 || true
systemctl start certbot.timer >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Final HTTPS health check ===
CURRENT_STEP="https_check"
CURRENT_LABEL="Verifying HTTPS is working"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
for i in $(seq 1 15); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$SUBDOMAIN" 2>/dev/null || echo "0")
  if [ "$CODE" = "200" ] || [ "$CODE" = "302" ] || [ "$CODE" = "307" ]; then
    break
  fi
  sleep 2
done
if [ "$CODE" != "200" ] && [ "$CODE" != "302" ] && [ "$CODE" != "307" ]; then
  fail "HTTPS not responding on $SUBDOMAIN (got $CODE)"
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# Signal completion with subdomain
curl -s -X POST "$PROGRESS_URL" \
  -H "Content-Type: application/json" \
  -H "x-install-secret: $INSTALL_SECRET" \
  -d "{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":$RESPONSE}" \
  > /dev/null 2>&1 || true

echo "=== Fractera bootstrap finished: $(date) ===" >> "$LOG_FILE"
echo "FRACTERA_READY: https://$SUBDOMAIN"
