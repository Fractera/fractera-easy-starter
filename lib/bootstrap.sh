#!/bin/bash
# Fractera Bootstrap Agent
# Runs on the user's VPS. Reports progress to fractera.ai/api/progress.
set -e

SESSION_ID="$1"
PROGRESS_URL="https://fractera-easy-starter.vercel.app/api/progress"
REGISTER_URL="https://fractera-easy-starter.vercel.app/api/register"
INSTALL_SECRET="$2"

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

report "apt_update" "Updating system" false
apt-get update -qq
report "apt_update" "Updating system" true

report "apt_install" "Installing base tools" false
apt-get install -y -qq git curl nginx build-essential
report "apt_install" "Installing base tools" true

report "node_setup" "Preparing Node.js installer" false
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
report "node_setup" "Preparing Node.js installer" true

report "node_install" "Installing Node.js 20" false
apt-get install -y nodejs > /dev/null 2>&1
report "node_install" "Installing Node.js 20" true

report "pm2" "Installing PM2" false
npm install -g pm2 > /dev/null 2>&1
report "pm2" "Installing PM2" true

report "clone" "Downloading Fractera" false
git clone https://github.com/Fractera/ai-workspace.git /opt/fractera > /dev/null 2>&1
cd /opt/fractera
report "clone" "Downloading Fractera" true

report "deps_root" "Installing dependencies (1/4)" false
npm install > /dev/null 2>&1
report "deps_root" "Installing dependencies (1/4)" true

report "deps_app" "Installing dependencies (2/4)" false
npm install --prefix app > /dev/null 2>&1
report "deps_app" "Installing dependencies (2/4)" true

report "deps_bridge" "Installing dependencies (3/4)" false
npm install --prefix bridges/platforms > /dev/null 2>&1
report "deps_bridge" "Installing dependencies (3/4)" true

report "deps_media" "Installing dependencies (4/4)" false
npm install --prefix services/media > /dev/null 2>&1
report "deps_media" "Installing dependencies (4/4)" true

report "build_app" "Building application (production)" false
npm run build --prefix app > /tmp/fractera-build.log 2>&1
report "build_app" "Building application (production)" true

report "start_app" "Starting application" false
pm2 start npm --name "fractera-app" -- run start --prefix app
report "start_app" "Starting application" true

report "start_bridge" "Starting Bridge" false
pm2 start npm --name "fractera-bridge" -- run start --prefix bridges/platforms
report "start_bridge" "Starting Bridge" true

report "start_media" "Starting media service" false
pm2 start npm --name "fractera-media" -- run start --prefix services/media
report "start_media" "Starting media service" true

report "pm2_save" "Saving configuration" false
pm2 save
pm2 startup | tail -1 | bash > /dev/null 2>&1 || true
report "pm2_save" "Saving configuration" true

report "configure_nginx" "Configuring web server" false
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
nginx -t > /dev/null 2>&1
systemctl reload nginx
report "configure_nginx" "Configuring web server" true

report "register" "Registering your domain" false
SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
RESPONSE=$(curl -s -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -H "x-install-secret: $INSTALL_SECRET" \
  -d "{\"ip\":\"$SERVER_IP\",\"session_id\":\"$SESSION_ID\"}")
report "register" "Registering your domain" true

# Signal completion with subdomain
curl -s -X POST "$PROGRESS_URL" \
  -H "Content-Type: application/json" \
  -H "x-install-secret: $INSTALL_SECRET" \
  -d "{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":$RESPONSE}" \
  > /dev/null 2>&1 || true

echo "FRACTERA_READY"
