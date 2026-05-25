#!/bin/bash
# Fractera Light Bootstrap
# Stripped install-pipeline: app + auth + data only.
# NO AI platforms, NO bridges, NO LightRAG, NO Hermes.
# Reports progress back to fractera-easy-starter.

SESSION_ID="$1"
PROGRESS_URL="https://fractera-easy-starter.vercel.app/api/progress"
REGISTER_URL="https://fractera-easy-starter.vercel.app/api/register/light"
REGISTER_SUBDOMAIN_URL="https://fractera-easy-starter.vercel.app/api/register-subdomain"
PING_URL="https://fractera-easy-starter.vercel.app/api/server/ping"
LOG_URL="https://fractera-easy-starter.vercel.app/api/server/install-log"
QUOTA_URL="https://fractera-easy-starter.vercel.app/api/quota/check"
INSTALL_SECRET="$2"
GITHUB_TOKEN="${3:-}"
SERVER_TOKEN="${4:-}"
SUBDOMAIN_OVERRIDE="${5:-}"
LOG_FILE="/tmp/fractera-light-install-$SESSION_ID.log"
INSTALL_DIR="/opt/fractera-light"
SECRETS_FILE="/etc/fractera-light/secrets.env"

CURRENT_STEP=""
CURRENT_LABEL=""
INSTALL_START=$(date +%s)

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

fail() {
  local message="$1"
  echo "" >> "$LOG_FILE"
  echo "=== FAIL [$CURRENT_STEP] $CURRENT_LABEL: $message ===" >> "$LOG_FILE"
  echo "=== Timestamp: $(date) ===" >> "$LOG_FILE"
  local last_log=$(tail -c 800 "$LOG_FILE" 2>/dev/null | tr '"' "'" | tr '\n' ' ' | head -c 700)
  curl -s --max-time 30 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"session_id\":\"$SESSION_ID\",\"error\":\"Step '$CURRENT_LABEL' failed: $message. Last log: $last_log\"}" \
    > /dev/null 2>&1 || true
  exit 1
}

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

step_npm() {
  CURRENT_STEP="$1"
  CURRENT_LABEL="$2"
  local cmd="$3"
  local prefix="$4"
  report "$CURRENT_STEP" "$CURRENT_LABEL" false
  for attempt in 1 2; do
    ( eval "$cmd" ) >> "$LOG_FILE" 2>&1
    local rc=$?
    if [ "$rc" -eq 0 ]; then
      report "$CURRENT_STEP" "$CURRENT_LABEL" true
      return 0
    fi
    if [ "$attempt" -lt 2 ] && grep -qE 'ENOTEMPTY|EACCES|EBUSY' "$LOG_FILE"; then
      echo "  ⚠ npm transient race — wiping node_modules and retrying" >> "$LOG_FILE"
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

echo "=== Fractera Light bootstrap started: $(date) ===" > "$LOG_FILE"

# === Pre-flight: DNS quota check ===
# Before doing anything destructive (wipe, apt, deploy), confirm Cloudflare
# has room for the 4 DNS records this bootstrap will create. If quota is
# exhausted, abort immediately with a clear error rather than getting half-way
# through install and dying on Cloudflare's `code:81045 Record quota exceeded`.
# /api/quota/check is also the place where the warning/critical email is
# triggered (best-effort, idempotent on Vercel side).
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

# === System packages + Node.js 20 + PM2 ===
step "apt_update"   "Updating system"           "rm -f /etc/apt/sources.list.d/nodesource.list /usr/share/keyrings/nodesource.gpg /etc/apt/keyrings/nodesource.gpg 2>/dev/null; apt-get update -qq"
step "apt_install"  "Installing base tools"     "apt-get install -y -qq git curl nginx build-essential dnsutils zsh"
step "node_repo"    "Adding Node.js repository" "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
step "node_install" "Installing Node.js 20"     "apt-get install -y nodejs"
step "pm2"          "Installing PM2"            "npm install -g pm2"

# === Domain registration (3 subdomains: main + auth + data) ===
CURRENT_STEP="register"
CURRENT_LABEL="Registering your domain"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
if [ -n "$SUBDOMAIN_OVERRIDE" ]; then
  SUBDOMAIN="$SUBDOMAIN_OVERRIDE"
  echo "Using existing subdomain: $SUBDOMAIN" >> "$LOG_FILE"
  SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
else
  SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
  if [ -z "$SERVER_IP" ]; then
    fail "could not detect server IP"
  fi
  echo "[register] resolved SERVER_IP=$SERVER_IP" >> "$LOG_FILE"
  echo "[register] POST $REGISTER_URL" >> "$LOG_FILE"
  RESPONSE=$(curl -s --max-time 30 -w "\n__HTTP_CODE__:%{http_code}" -X POST "$REGISTER_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"ip\":\"$SERVER_IP\",\"session_id\":\"$SESSION_ID\"}")
  HTTP_CODE=$(echo "$RESPONSE" | grep -o '__HTTP_CODE__:[0-9]*' | cut -d: -f2)
  RESPONSE_BODY=$(echo "$RESPONSE" | sed 's/__HTTP_CODE__:[0-9]*$//')
  echo "[register] HTTP=$HTTP_CODE body=$RESPONSE_BODY" >> "$LOG_FILE"
  if ! echo "$RESPONSE_BODY" | grep -q '"subdomain"'; then
    fail "domain registration failed (HTTP $HTTP_CODE): $RESPONSE_BODY"
  fi
  RESPONSE="$RESPONSE_BODY"
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
for PREFIX in auth admin data; do
  curl -s -X POST "$REGISTER_SUBDOMAIN_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"ip\":\"$SERVER_IP\",\"subdomain\":\"$PREFIX.$BASE\"}" \
    >> "$LOG_FILE" 2>&1 || fail "register $PREFIX subdomain failed"
done
report "$CURRENT_STEP" "$CURRENT_LABEL" true
# Cloudflare Total TLS starts provisioning certs in the background.

# === Git clone ===
if [ -n "$GITHUB_TOKEN" ]; then
  CLONE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/Fractera/ai-workspace.git"
else
  CLONE_URL="https://github.com/Fractera/ai-workspace.git"
fi
step "clone" "Downloading Fractera Light" \
  "rm -rf $INSTALL_DIR && git clone $CLONE_URL $INSTALL_DIR"

cd "$INSTALL_DIR" || fail "Cannot cd to $INSTALL_DIR"

git remote set-url origin "https://github.com/Fractera/ai-workspace.git"

DEPLOYED_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
DEPLOYED_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "$DEPLOYED_COMMIT" > "$INSTALL_DIR/DEPLOYED_COMMIT"
echo "$DEPLOYED_BRANCH" > "$INSTALL_DIR/DEPLOYED_BRANCH"
echo "=== DEPLOYED: branch=$DEPLOYED_BRANCH commit=$DEPLOYED_COMMIT ===" >> "$LOG_FILE"

# === npm dependencies (4 installs: root, app, auth, data) ===
step_npm "deps_root" "Installing dependencies (1/4)" "npm install" ""
step_npm "deps_app"  "Installing dependencies (2/4)" "npm install --prefix $INSTALL_DIR/app" "$INSTALL_DIR/app"

ARCH=$(uname -m)
CURRENT_STEP="deps_app_native"
CURRENT_LABEL="Installing native modules for $ARCH"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
if [ "$ARCH" = "x86_64" ]; then
  npm install --prefix "$INSTALL_DIR/app" lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu --save-optional >> "$LOG_FILE" 2>&1 || fail "native modules install failed"
elif [ "$ARCH" = "aarch64" ]; then
  npm install --prefix "$INSTALL_DIR/app" lightningcss-linux-arm64-gnu @tailwindcss/oxide-linux-arm64-gnu --save-optional >> "$LOG_FILE" 2>&1 || fail "native modules install failed"
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

step_npm "deps_auth" "Installing dependencies (3/5)" \
  "npm install --prefix $INSTALL_DIR/services/auth && npm rebuild better-sqlite3 --prefix $INSTALL_DIR/services/auth" "$INSTALL_DIR/services/auth"
step_npm "deps_data" "Installing dependencies (4/5)" \
  "npm install --prefix $INSTALL_DIR/services/data && npm rebuild better-sqlite3 --prefix $INSTALL_DIR/services/data && npm rebuild sharp --prefix $INSTALL_DIR/services/data" "$INSTALL_DIR/services/data"
step_npm "deps_bridges_app" "Installing dependencies (5/5)" \
  "npm install --prefix $INSTALL_DIR/bridges/app && npm rebuild better-sqlite3 --prefix $INSTALL_DIR/bridges/app" "$INSTALL_DIR/bridges/app"

log_email "deps_data" "All dependencies installed" 30

# === Secrets (3: AUTH_SECRET, DEPLOY_SECRET, DATA_SECRET) ===
CURRENT_STEP="prepare_secrets"
CURRENT_LABEL="Generating security keys"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
mkdir -p /etc/fractera-light
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
chmod 600 "$SECRETS_FILE"
source "$SECRETS_FILE"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Initial .env files (localhost URLs — before real subdomain is known in build) ===
CURRENT_STEP="prepare_env"
CURRENT_LABEL="Writing environment configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source "$SECRETS_FILE"

cat > "$INSTALL_DIR/app/.env.local" <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_MEDIA_URL=http://localhost:3300
APP_DB_PATH=$INSTALL_DIR/app/data/app.db
ENVEOF

cat > "$INSTALL_DIR/services/auth/.env.local" <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=
COOKIE_SECURE=false
NEXTAUTH_URL=http://localhost:3001
DATABASE_URL=file:$INSTALL_DIR/app/data/app.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
ENVEOF

cat > "$INSTALL_DIR/bridges/app/.env.local" <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MEDIA_URL=http://localhost:3300
NEXT_PUBLIC_PRODUCT=light
DEPLOY_SECRET=$DEPLOY_SECRET
APP_DB_PATH=$INSTALL_DIR/app/data/app.db
ENVEOF

cat > "$INSTALL_DIR/services/data/.env" <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=http://localhost:3300
APP_DB_PATH=$INSTALL_DIR/app/data/app.db
DATA_SECRET=$DATA_SECRET
ENVEOF

report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Build (2: app + auth) ===
step "build_app"         "Building app (production)"   "npm run build --prefix $INSTALL_DIR/app"
step "build_auth"        "Building auth (production)"  "npm run build --prefix $INSTALL_DIR/services/auth"
step "build_bridges_app" "Building admin (production)" "npm run build --prefix $INSTALL_DIR/bridges/app"

# === PM2: 3 processes ===
pm2 delete fractera-light-app fractera-light-auth fractera-light-data fractera-light-admin >> "$LOG_FILE" 2>&1 || true

step "start_app"   "Starting app service"   "cd $INSTALL_DIR/app && pm2 start npm --name fractera-light-app -- run start && cd $INSTALL_DIR"
step "start_auth"  "Starting auth service"  "cd $INSTALL_DIR/services/auth && pm2 start npm --name fractera-light-auth -- run start && cd $INSTALL_DIR"
step "start_data"  "Starting data service"  "cd $INSTALL_DIR/services/data && pm2 start node --name fractera-light-data -- server.js && cd $INSTALL_DIR"
step "start_admin" "Starting admin service" "cd $INSTALL_DIR/bridges/app && pm2 start npm --name fractera-light-admin -- run start && cd $INSTALL_DIR"

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving process configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup systemd -u root --hp /root | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
systemctl enable pm2-root >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Nginx HTTP config — 3 server blocks ===
CURRENT_STEP="configure_nginx_http"
CURRENT_LABEL="Configuring web server (HTTP)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera-light <<'NGINXEOF'
# app — default server
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

# admin
server {
    listen 80;
    server_name admin.SUBDOMAIN_PLACEHOLDER;

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
ln -sf /etc/nginx/sites-available/fractera-light /etc/nginx/sites-enabled/fractera-light
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Health check (localhost:80) ===
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

# === Nginx domain substitution ===
CURRENT_STEP="nginx_domains"
CURRENT_LABEL="Updating web server with real domains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
sed -i "s/SUBDOMAIN_PLACEHOLDER/$SUBDOMAIN/g" /etc/nginx/sites-available/fractera-light
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid after domain substitution"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Update .env with real HTTPS URLs ===
CURRENT_STEP="update_env"
CURRENT_LABEL="Updating environment with real domains"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source "$SECRETS_FILE"

cat > "$INSTALL_DIR/app/.env.local" <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=https://auth.$SUBDOMAIN
NEXT_PUBLIC_ADMIN_URL=https://admin.$SUBDOMAIN
NEXT_PUBLIC_MEDIA_URL=https://data.$SUBDOMAIN
APP_DB_PATH=$INSTALL_DIR/app/data/app.db
DEPLOY_SECRET=$DEPLOY_SECRET
ENVEOF

cat > "$INSTALL_DIR/services/auth/.env.local" <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=.$SUBDOMAIN
COOKIE_SECURE=true
NEXTAUTH_URL=https://auth.$SUBDOMAIN
DATABASE_URL=file:$INSTALL_DIR/app/data/app.db
ALLOWED_ORIGINS=https://$SUBDOMAIN,https://admin.$SUBDOMAIN
ENVEOF

cat > "$INSTALL_DIR/bridges/app/.env.local" <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=https://auth.$SUBDOMAIN
NEXT_PUBLIC_APP_URL=https://$SUBDOMAIN
NEXT_PUBLIC_MEDIA_URL=https://data.$SUBDOMAIN
NEXT_PUBLIC_PRODUCT=light
DEPLOY_SECRET=$DEPLOY_SECRET
APP_DB_PATH=$INSTALL_DIR/app/data/app.db
ENVEOF

cat > "$INSTALL_DIR/services/data/.env" <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=https://data.$SUBDOMAIN
APP_DB_PATH=$INSTALL_DIR/app/data/app.db
DATA_SECRET=$DATA_SECRET
ENVEOF

# Validate critical env vars
DATA_VAL=$(grep "^DATA_PUBLIC_URL=" "$INSTALL_DIR/services/data/.env" | cut -d'=' -f2)
AUTH_VAL=$(grep "^NEXT_PUBLIC_AUTH_URL=" "$INSTALL_DIR/app/.env.local" | cut -d'=' -f2)
if [ -z "$DATA_VAL" ] || echo "$DATA_VAL" | grep -q "localhost"; then
  fail "DATA_PUBLIC_URL is empty or localhost — Vercel deploy may not be ready"
fi
if [ -z "$AUTH_VAL" ] || echo "$AUTH_VAL" | grep -q "localhost"; then
  fail "NEXT_PUBLIC_AUTH_URL is empty or localhost — Vercel deploy may not be ready"
fi
echo "ENV VALIDATION PASSED" >> "$LOG_FILE"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Rebuild with real URLs ===
step "rebuild_app"         "Rebuilding app with domain"   "npm run build --prefix $INSTALL_DIR/app"
step "rebuild_auth"        "Rebuilding auth with domain"  "npm run build --prefix $INSTALL_DIR/services/auth"
step "rebuild_bridges_app" "Rebuilding admin with domain" "npm run build --prefix $INSTALL_DIR/bridges/app"

CURRENT_STEP="pm2_restart"
CURRENT_LABEL="Restarting services with new config"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 restart fractera-light-app fractera-light-auth fractera-light-data fractera-light-admin >> "$LOG_FILE" 2>&1 || fail "pm2 restart failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Wait for DNS propagation ===
CURRENT_STEP="wait_dns"
CURRENT_LABEL="Waiting for DNS to propagate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
for DOMAIN in "$SUBDOMAIN" "auth.$SUBDOMAIN" "admin.$SUBDOMAIN" "data.$SUBDOMAIN"; do
  RESOLVED=""
  for i in $(seq 1 60); do
    RESOLVED=$(dig +short "$DOMAIN" @1.1.1.1 2>/dev/null | head -1)
    if [ -n "$RESOLVED" ]; then
      break
    fi
    sleep 5
  done
  if [ -z "$RESOLVED" ]; then
    fail "DNS did not propagate within 5 minutes: $DOMAIN"
  fi
  echo "DNS OK: $DOMAIN → $RESOLVED" >> "$LOG_FILE"
done
report "$CURRENT_STEP" "$CURRENT_LABEL" true

log_email "get_cf_cert" "Waiting for DNS + activating HTTPS" 85

# === Download Cloudflare Origin Certificate ===
CURRENT_STEP="get_cf_cert"
CURRENT_LABEL="Downloading Cloudflare SSL certificate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
mkdir -p /etc/ssl/cloudflare
CF_JSON_FILE=$(mktemp)
curl -sf -H "x-install-secret: $INSTALL_SECRET" \
  "https://fractera-easy-starter.vercel.app/api/ssl-cert" \
  -o "$CF_JSON_FILE" 2>>"$LOG_FILE" \
  || { rm -f "$CF_JSON_FILE"; fail "could not download Cloudflare Origin Certificate"; }
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
cat > /etc/nginx/cf-ssl.conf << 'SSLEOF'
ssl_certificate /etc/ssl/cloudflare/origin.crt;
ssl_certificate_key /etc/ssl/cloudflare/origin.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
SSLEOF
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Nginx HTTPS config — 4 blocks (redirect + app + auth + data) ===
CURRENT_STEP="ssl_cert"
CURRENT_LABEL="Configuring HTTPS with Cloudflare certificate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera-light <<'NGINXHTTPSEOF'
# HTTP → HTTPS redirect
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

# app — HTTPS
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

# admin — HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name admin.SUBDOMAIN_PLACEHOLDER;
    include /etc/nginx/cf-ssl.conf;

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
NGINXHTTPSEOF

sed -i "s/SUBDOMAIN_PLACEHOLDER/$SUBDOMAIN/g" /etc/nginx/sites-available/fractera-light
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx HTTPS config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === HTTPS health check — 3 subdomains in parallel ===
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

ALL_SUBS=("$SUBDOMAIN" "auth.$SUBDOMAIN" "admin.$SUBDOMAIN" "data.$SUBDOMAIN")

echo "  HTTPS verification (parallel, up to 10 min)" >> "$LOG_FILE"
mapfile -t still_failing < <(wait_for_subs 600 "${ALL_SUBS[@]}")

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
  echo "  ⚠ Partial success — subdomains still provisioning edge certs:" >> "$LOG_FILE"
  for sub in "${still_failing[@]}"; do echo "    · $sub" >> "$LOG_FILE"; done
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === White label check ===
if [ -n "$SERVER_TOKEN" ]; then
  WL=$(curl -s --max-time 5 \
    -H "Authorization: Bearer $SERVER_TOKEN" \
    "https://fractera-easy-starter.vercel.app/api/server/white-label" 2>/dev/null || echo "")
  if echo "$WL" | grep -q '"white_label":true'; then
    echo "White label active — removing footer from nginx" >> "$LOG_FILE"
    python3 - << 'WLEOF' >> "$LOG_FILE" 2>&1
import os
MARKERS = ['proxy_set_header Accept-Encoding ""', 'sub_filter_once on', "sub_filter '</body>'"]
for path in ['/etc/nginx/sites-available/fractera-light']:
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

# === Ping cron + completion ===
if [ -n "$SERVER_TOKEN" ]; then
  sed -i "/^SERVER_TOKEN=/d" "$SECRETS_FILE" 2>/dev/null; echo "SERVER_TOKEN=$SERVER_TOKEN" >> "$SECRETS_FILE"
  CRON_CMD="*/15 * * * * curl -s -X POST $PING_URL -H 'Content-Type: application/json' -H 'Authorization: Bearer $SERVER_TOKEN' -d '{\"subdomain\":\"$SUBDOMAIN\"}' >> /var/log/fractera-light-ping.log 2>&1"
  (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
  echo "Ping agent installed (token: ${SERVER_TOKEN:0:8}...)" >> "$LOG_FILE"
  for i in 1 2 3 4 5; do
    PING_RESP=$(curl -s -X POST "$PING_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SERVER_TOKEN" \
      -d "{\"subdomain\":\"$SUBDOMAIN\"}")
    echo "[ping] attempt $i: $PING_RESP" >> /var/log/fractera-light-ping.log
    if echo "$PING_RESP" | grep -q '"ok":true'; then break; fi
    [ $i -lt 5 ] && sleep 30
  done
fi

_done_payload="{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":{\"subdomain\":\"$SUBDOMAIN\"}}"
for _attempt in 1 2 3 4 5; do
  _code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "$_done_payload" 2>/dev/null)
  [ "$_code" = "200" ] && break
  sleep 10
done

log_email "complete" "Server is ready! SSL installed, all services running" 100

echo "=== Fractera Light bootstrap finished: $(date) ===" >> "$LOG_FILE"
echo "FRACTERA_LIGHT_READY: https://$SUBDOMAIN"
