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
step "apt_install"     "Installing base tools"          "apt-get install -y -qq git curl nginx build-essential"
step "node_setup"      "Preparing Node.js installer"    "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
step "node_install"    "Installing Node.js 20"          "apt-get install -y nodejs"
step "pm2"             "Installing PM2 process manager" "npm install -g pm2"
step "clone"           "Downloading Fractera"           "git clone https://github.com/Fractera/ai-workspace.git /opt/fractera && cd /opt/fractera"

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
step "build_app"   "Building application"          "npm run build --prefix app"
step "start_app"   "Starting application"          "pm2 start npm --name fractera-app -- run start --prefix app"
step "start_bridge" "Starting Bridge"              "pm2 start npm --name fractera-bridge -- run start --prefix bridges/platforms"
step "start_media" "Starting media service"        "pm2 start npm --name fractera-media -- run start --prefix services/media"

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

CURRENT_STEP="configure_nginx"
CURRENT_LABEL="Configuring web server"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
cat > /etc/nginx/sites-available/fractera <<'EOF'
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
EOF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/fractera /etc/nginx/sites-enabled/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

CURRENT_STEP="health_check"
CURRENT_LABEL="Verifying server is responding"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
# Wait up to 60s for app to actually serve traffic
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
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# Signal completion with subdomain
curl -s -X POST "$PROGRESS_URL" \
  -H "Content-Type: application/json" \
  -H "x-install-secret: $INSTALL_SECRET" \
  -d "{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":$RESPONSE}" \
  > /dev/null 2>&1 || true

echo "=== Fractera bootstrap finished: $(date) ===" >> "$LOG_FILE"
echo "FRACTERA_READY"
