#!/bin/bash
# Fractera Bootstrap Agent
# Reports progress + errors back to fractera-easy-starter.

SESSION_ID="$1"
PROGRESS_URL="https://fractera-easy-starter.vercel.app/api/progress"
REGISTER_URL="https://fractera-easy-starter.vercel.app/api/register"
INSTALL_SECRET="$2"
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

step "apt_update"      "Updating system"                "apt-get update -qq"
step "apt_install"     "Installing base tools"          "apt-get install -y -qq git curl nginx build-essential certbot python3-certbot-nginx dnsutils"
step "node_setup"      "Preparing Node.js installer"    "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
step "node_install"    "Installing Node.js 20"          "apt-get install -y nodejs"
step "pm2"             "Installing PM2 process manager" "npm install -g pm2"
step "clone"           "Downloading Fractera"           "rm -rf /opt/fractera && git clone https://github.com/Fractera/ai-workspace.git /opt/fractera && cd /opt/fractera"

cd /opt/fractera || fail "Cannot cd to /opt/fractera"

step "deps_root"   "Installing dependencies (1/4)" "npm install"
step "deps_app"    "Installing dependencies (2/4)" "npm install --prefix app"

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

step "deps_bridge" "Installing dependencies (3/4)" "npm install --prefix bridges/platforms"
step "deps_media"  "Installing dependencies (4/4)" "npm install --prefix services/media"

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

# === Write .env.local before build (NEXT_PUBLIC_* must be present at build time) ===
CURRENT_STEP="prepare_env"
CURRENT_LABEL="Writing environment configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source /etc/fractera/secrets.env
cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
NEXT_PUBLIC_MEDIA_URL=
ENVEOF
report "$CURRENT_STEP" "$CURRENT_LABEL" true

step "build_app"   "Building application (production)"  "npm run build --prefix app"

# Remove any previous services before starting fresh
pm2 delete all >> "$LOG_FILE" 2>&1 || true

step "start_app"    "Starting application"     "pm2 start npm --name fractera-app -- run start --prefix app"
step "start_bridge" "Starting Bridge"          "pm2 start npm --name fractera-bridge -- run start --prefix bridges/platforms"
step "start_media"  "Starting media service"   "pm2 start npm --name fractera-media -- run start --prefix services/media"

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup systemd -u root --hp /root | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
systemctl enable pm2-root >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Initial Nginx config — HTTP only, default server. Needed for certbot challenge. ===
CURRENT_STEP="configure_nginx_http"
CURRENT_LABEL="Configuring web server (HTTP)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
cat > /etc/nginx/sites-available/fractera <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location /media/ {
        proxy_pass http://127.0.0.1:3300/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 500m;
    }

    location /bridge/ {
        proxy_pass http://127.0.0.1:3201/;
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
EOF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/fractera /etc/nginx/sites-enabled/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Health check before SSL ===
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

# === Register domain ===
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

# Update .env.local with final subdomain-based URLs, then restart app
source /etc/fractera/secrets.env
cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
NEXT_PUBLIC_MEDIA_URL=https://$SUBDOMAIN/media
ENVEOF
pm2 restart fractera-app >> "$LOG_FILE" 2>&1 || true

# === Wait for DNS propagation ===
CURRENT_STEP="wait_dns"
CURRENT_LABEL="Waiting for DNS to propagate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
for i in $(seq 1 60); do
  RESOLVED=$(dig +short "$SUBDOMAIN" @1.1.1.1 2>/dev/null | head -1)
  if [ "$RESOLVED" = "$SERVER_IP" ]; then
    break
  fi
  sleep 5
done
if [ "$RESOLVED" != "$SERVER_IP" ]; then
  fail "DNS did not propagate within 5 minutes: $SUBDOMAIN resolves to '$RESOLVED', expected $SERVER_IP"
fi
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Get SSL certificate ===
CURRENT_STEP="ssl_cert"
CURRENT_LABEL="Getting SSL certificate"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
certbot --nginx \
  -d "$SUBDOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "noreply@fractera.ai" \
  --redirect \
  --no-eff-email \
  >> "$LOG_FILE" 2>&1 || fail "certbot failed to get certificate for $SUBDOMAIN"

# Verify certbot timer is enabled (auto-renewal)
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
