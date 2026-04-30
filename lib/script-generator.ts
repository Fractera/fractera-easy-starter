export type Provider = 'hetzner' | 'digitalocean' | 'oracle' | 'existing'

export function generateInstallScript(provider: Provider, sessionId: string, secret: string): string {
  const registerUrl = 'https://fractera.ai/api/register'

  return `#!/bin/bash
# Fractera Easy Starter — install script
# Provider: ${provider} | Session: ${sessionId}
set -e

echo "==> Updating system..."
apt-get update -qq
apt-get install -y -qq git curl nginx certbot python3-certbot-nginx

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Cloning Fractera..."
git clone https://github.com/Fractera/ai-workspace.git /opt/fractera
cd /opt/fractera

echo "==> Installing dependencies (this takes ~3 min)..."
npm install
npm install --prefix app
npm install --prefix bridges/platforms
npm install --prefix services/media

echo "==> Starting services..."
pm2 start npm --name "fractera-app"    -- run dev --prefix app
pm2 start npm --name "fractera-bridge" -- run dev --prefix bridges/platforms
pm2 start npm --name "fractera-media"  -- run dev --prefix services/media
pm2 save
pm2 startup | tail -1 | bash

echo "==> Registering your domain..."
SERVER_IP=$(curl -s ifconfig.me)
RESPONSE=$(curl -s -X POST ${registerUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-install-secret: ${secret}" \\
  -d "{\\"ip\\": \\"$SERVER_IP\\", \\"session_id\\": \\"${sessionId}\\"}")

SUBDOMAIN=$(echo "$RESPONSE" | grep -o '"subdomain":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "✓ Fractera installed successfully!"
echo "✓ Your domain: https://$SUBDOMAIN"
echo "✓ It will be ready in ~60 seconds."
echo ""
echo "FRACTERA_READY: $SUBDOMAIN"
`
}
