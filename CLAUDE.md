# Fractera Easy Starter — Project Spec & CLAUDE.md

## What this is

A Next.js application deployed on Vercel that does one thing:
allows a non-technical user to install Fractera AI Workspace on their own VPS
through a dialogue in claude.ai — and receive a working subdomain `uuid.fractera.ai` at the end.

No coding required from the user. No SSH knowledge. No terminal.
The user talks to Claude, pastes one command on their server, and gets a live URL.

---

## Problem it solves

`fractera-light` is open-source and works perfectly for developers.
Non-developers cannot use it — they have no terminal, no Git, no deployment experience.

Easy Starter is the entry point for non-developers:
- Guides them through choosing and setting up a VPS
- Generates a ready-to-run install script for their specific provider
- Registers a subdomain automatically when install completes
- Personalises the first Fractera experience based on the onboarding dialogue

---

## User journey (complete)

```
1. User lands on fractera.ai
   → sees "Launch your own AI workspace" button
   → clicks → sees MCP installation instructions

2. User installs MCP in claude.ai settings
   → one URL to add, no configuration needed

3. User opens claude.ai, types: "install fractera"
   → Claude reads MCP system prompt, begins guided dialogue

4. Claude asks: language preference
   → all further messages in chosen language

5. Claude presents hosting options with prices:
   → Hetzner CX11 €3.29/mo (recommended)
   → Oracle Cloud Always Free (free, more complex)
   → DigitalOcean $6/mo
   → "I already have a server"

6. User picks a provider
   → Claude gives exact steps to create a VPS on that provider
   → Claude asks user to come back with the server IP

7. While user sets up server (~5 min wait):
   → Claude runs onboarding dialogue:
      - "What do you plan to build?"
      - "Which AI platforms interest you? (Claude, Codex, Gemini...)"
      - "What language will your project be in?"
   → Answers are saved to session, used later for personalisation

8. User returns with IP address
   → Claude calls MCP tool: generate_install_script(provider, ip)
   → MCP returns a one-line curl command

9. User pastes command into their server terminal
   → Script runs (~5 min): installs Node, clones fractera-light,
     installs deps, configures PM2 + Nginx + SSL
   → Script sends POST to fractera.ai/api/register when complete

10. fractera.ai/api/register:
    → validates the request
    → calls Cloudflare API: creates A record uuid.fractera.ai → user's IP
    → returns { subdomain: "abc123.fractera.ai" }

11. Claude receives the subdomain
    → tells user: "Your workspace is ready: https://abc123.fractera.ai"
    → gives next steps: register account, activate platforms

12. User opens abc123.fractera.ai
    → sees Fractera — their own instance, on their own server
```

---

## Architecture

```
fractera-easy-starter/ (this repo — deployed on Vercel)
  app/
    page.tsx                   ← landing page with "Launch" button + MCP install instructions
    api/
      register/route.ts        ← POST: receives install complete signal, calls Cloudflare, returns subdomain
      script/route.ts          ← GET: generates install.sh for given provider + ip
      mcp/route.ts             ← MCP server endpoint (HTTP/SSE)
  lib/
    cloudflare.ts              ← Cloudflare API client: create/delete DNS records
    script-generator.ts        ← generates provider-specific bash install scripts
    session.ts                 ← stores onboarding answers (KV or DB)
  mcp/
    tools.ts                   ← MCP tool definitions
    prompts.ts                 ← system prompt for Claude (dialogue script)
```

### MCP tools (what Claude can call)

| Tool | What it does |
|---|---|
| `get_hosting_options()` | Returns list of providers with prices and recommendations |
| `get_provider_setup_guide(provider)` | Returns step-by-step instructions for creating VPS on that provider |
| `generate_install_command(provider, ip)` | Returns one-line curl command for user to run on their server |
| `check_registration_status(session_id)` | Checks if install complete signal has arrived yet |
| `get_subdomain(session_id)` | Returns assigned subdomain once registration is done |

### MCP system prompt (what Claude is told)

The system prompt instructs Claude to:
1. Greet and ask language preference
2. Present hosting options using `get_hosting_options()`
3. Guide through VPS creation using `get_provider_setup_guide()`
4. While waiting — run onboarding questions (save answers)
5. When IP is given — call `generate_install_command()` and show result
6. Poll `check_registration_status()` after user says "done"
7. Call `get_subdomain()` and present the final URL

---

## DNS system

**Stack:** Porkbun (registrar) → Cloudflare (DNS, free plan)

**Required setup (one-time, manual):**
1. In Porkbun: change nameservers to Cloudflare's NS
2. In Cloudflare: add wildcard record `*.fractera.ai → A → 1.2.3.4` (placeholder)
3. Store `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` in Vercel env vars

**Per-install flow:**
```
POST /api/register { ip: "1.2.3.4", session_id: "xyz" }
  → generate uuid (e.g. "happy-fox-42")
  → Cloudflare API: create A record happy-fox-42.fractera.ai → 1.2.3.4
  → return { subdomain: "happy-fox-42.fractera.ai" }
```

**Subdomain format:** `adjective-noun-number.fractera.ai`
(readable, memorable, no user data exposed)

---

## Install script (what runs on user's VPS)

Generated per-provider, but core sequence is the same for all Ubuntu 22.04 targets:

```bash
#!/bin/bash
# Fractera Easy Starter — auto-generated install script
# Provider: Hetzner | Session: xyz123

set -e

# 1. System deps
apt-get update -qq
apt-get install -y -qq git curl nginx certbot python3-certbot-nginx

# 2. Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. PM2
npm install -g pm2

# 4. Clone Fractera
git clone https://github.com/Fractera/ai-workspace.git /opt/fractera
cd /opt/fractera

# 5. Install deps (correct order)
npm install
npm install --prefix app
npm install --prefix bridges/platforms
npm install --prefix services/media

# 6. PM2 config
pm2 start npm --name "fractera-app"    -- run dev --prefix app
pm2 start npm --name "fractera-bridge" -- run dev --prefix bridges/platforms
pm2 start npm --name "fractera-media"  -- run dev --prefix services/media
pm2 save
pm2 startup

# 7. Nginx config
# ... (reverse proxy 80/443 → 3000/3300)

# 8. Signal completion
curl -s -X POST https://fractera.ai/api/register \
  -H "Content-Type: application/json" \
  -d "{\"ip\": \"$(curl -s ifconfig.me)\", \"session_id\": \"xyz123\"}"

echo "✓ Fractera installed. Your domain will be ready in ~60 seconds."
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Hosting | Vercel (free tier sufficient for MVP) |
| DNS | Cloudflare API (free plan) |
| MCP protocol | HTTP + SSE (Vercel compatible) |
| Session state | Vercel KV (Redis) or simple DB |
| Target server OS | Ubuntu 22.04 LTS |
| Process manager | PM2 |
| Reverse proxy | Nginx |
| SSL | Let's Encrypt / Certbot |

---

## Environment variables (Vercel)

```
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
INSTALL_SCRIPT_SECRET=    ← validates that /api/register calls are genuine
KV_URL=                   ← Vercel KV connection string
```

---

## MVP scope (what to build first)

1. `/api/register` — receives IP, creates Cloudflare DNS record, returns subdomain
2. `/api/script` — generates install.sh for Hetzner (one provider first)
3. MCP server with 3 tools: `get_hosting_options`, `generate_install_command`, `get_subdomain`
4. MCP system prompt — full dialogue script
5. Landing page — minimal, explains the product, shows MCP install URL
6. Test end-to-end on a real Hetzner VPS

**Not in MVP:**
- Multiple provider scripts (add after Hetzner works)
- Onboarding answers personalisation
- Subdomain management UI (delete, transfer)
- Billing / limits

---

## One-time setup checklist (before first deploy)

- [ ] Transfer fractera.ai DNS from Vercel NS to Cloudflare NS (in Porkbun)
- [ ] Add wildcard A record `*.fractera.ai` in Cloudflare (proxy OFF for VPS IPs)
- [ ] Create Cloudflare API token with Zone:DNS:Edit permission
- [ ] Add env vars to Vercel project
- [ ] Create Vercel KV store and connect to project
- [ ] Test: POST /api/register → subdomain appears in Cloudflare dashboard

---

## Working directory rule

Work from the repo root — this is a single Next.js app, not a monorepo.
`app/` here refers to Next.js App Router directory, not a sub-project.
