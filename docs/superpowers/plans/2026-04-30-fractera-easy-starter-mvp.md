# Fractera Easy Starter MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app on Vercel that lets a non-technical user install Fractera on their own VPS through a dialogue in claude.ai, and receive a working subdomain `uuid.fractera.ai` at the end.

**Architecture:** Thin MCP server on top of standard Next.js API routes. User talks to Claude in claude.ai → Claude calls MCP tools → tools call our API routes → API registers DNS via Cloudflare. Install script runs on user's VPS and POSTs back when done.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, Vercel, Cloudflare DNS API, MCP HTTP/SSE protocol.

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/page.tsx` | Landing page — explains product, shows MCP install URL |
| `app/api/register/route.ts` | POST: receives IP + session_id from VPS, creates Cloudflare DNS record, returns subdomain |
| `app/api/script/route.ts` | GET: generates install.sh bash script for given provider + session_id |
| `app/api/mcp/route.ts` | MCP server endpoint — handles tool calls from claude.ai |
| `lib/cloudflare.ts` | Cloudflare API client: create A record, generate subdomain name |
| `lib/script-generator.ts` | Generates provider-specific bash install scripts |
| `lib/mcp-tools.ts` | MCP tool definitions and handlers |
| `lib/mcp-prompt.ts` | System prompt for Claude — full dialogue script |
| `lib/subdomain.ts` | Generates readable subdomain names: adjective-noun-number |

---

## Task 1: Cloudflare DNS client

**Files:**
- Create: `lib/cloudflare.ts`
- Create: `lib/subdomain.ts`

- [ ] **Step 1: Create subdomain generator**

Create `lib/subdomain.ts`:

```typescript
const ADJECTIVES = ['happy', 'swift', 'bright', 'calm', 'bold', 'cool', 'free', 'keen', 'neat', 'pure']
const NOUNS = ['fox', 'owl', 'elk', 'wolf', 'bear', 'hawk', 'lion', 'deer', 'lynx', 'crow']

export function generateSubdomain(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}-${noun}-${num}`
}
```

- [ ] **Step 2: Create Cloudflare client**

Create `lib/cloudflare.ts`:

```typescript
const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

export async function createDnsRecord(ip: string, subdomain: string): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!
  const token = process.env.CLOUDFLARE_API_TOKEN!

  const res = await fetch(`${CLOUDFLARE_API}/zones/${zoneId}/dns_records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'A',
      name: subdomain,
      content: ip,
      ttl: 60,
      proxied: false,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Cloudflare API error: ${JSON.stringify(err.errors)}`)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/cloudflare.ts lib/subdomain.ts
git commit -m "feat: Cloudflare DNS client + subdomain generator"
```

---

## Task 2: /api/register endpoint

**Files:**
- Create: `app/api/register/route.ts`

- [ ] **Step 1: Create the route**

Create `app/api/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createDnsRecord } from '@/lib/cloudflare'
import { generateSubdomain } from '@/lib/subdomain'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { ip, session_id } = body

  if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return NextResponse.json({ error: 'Invalid IP address' }, { status: 400 })
  }

  const subdomain = generateSubdomain()
  const fullDomain = `${subdomain}.fractera.ai`

  await createDnsRecord(ip, subdomain)

  return NextResponse.json({
    subdomain: fullDomain,
    session_id,
  })
}
```

- [ ] **Step 2: Test manually with curl**

Start dev server (`pnpm dev`) and in another terminal run:

```bash
curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -H "x-install-secret: fractera-secret-2024-xk9m" \
  -d '{"ip":"1.2.3.4","session_id":"test-123"}' | jq .
```

Expected response:
```json
{
  "subdomain": "happy-fox-42.fractera.ai",
  "session_id": "test-123"
}
```

Check Cloudflare dashboard → DNS → record `happy-fox-42` should appear.

- [ ] **Step 3: Commit**

```bash
git add app/api/register/route.ts
git commit -m "feat: /api/register — creates Cloudflare DNS record, returns subdomain"
```

---

## Task 3: Install script generator

**Files:**
- Create: `lib/script-generator.ts`
- Create: `app/api/script/route.ts`

- [ ] **Step 1: Create script generator**

Create `lib/script-generator.ts`:

```typescript
export type Provider = 'hetzner' | 'digitalocean' | 'oracle'

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

SUBDOMAIN=$(echo $RESPONSE | grep -o '"subdomain":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "✓ Fractera installed successfully!"
echo "✓ Your domain: https://$SUBDOMAIN"
echo "✓ It will be ready in ~60 seconds."
echo ""
echo "FRACTERA_READY: $SUBDOMAIN"
`
}
```

- [ ] **Step 2: Create the route**

Create `app/api/script/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateInstallScript, Provider } from '@/lib/script-generator'

const VALID_PROVIDERS: Provider[] = ['hetzner', 'digitalocean', 'oracle']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider') as Provider
  const sessionId = searchParams.get('session_id')

  if (!provider || !VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const secret = process.env.INSTALL_SCRIPT_SECRET!
  const script = generateInstallScript(provider, sessionId, secret)

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="install.sh"',
    },
  })
}
```

- [ ] **Step 3: Test manually**

```bash
curl "http://localhost:3000/api/script?provider=hetzner&session_id=test-123"
```

Expected: full bash script printed to terminal starting with `#!/bin/bash`.

- [ ] **Step 4: Commit**

```bash
git add lib/script-generator.ts app/api/script/route.ts
git commit -m "feat: install script generator for Hetzner/DO/Oracle"
```

---

## Task 4: MCP server

**Files:**
- Create: `lib/mcp-tools.ts`
- Create: `lib/mcp-prompt.ts`
- Create: `app/api/mcp/route.ts`

- [ ] **Step 1: Create MCP tool definitions**

Create `lib/mcp-tools.ts`:

```typescript
export const MCP_TOOLS = [
  {
    name: 'get_hosting_options',
    description: 'Returns list of VPS hosting providers with prices and recommendations',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'generate_install_command',
    description: 'Generates a one-line curl command for the user to run on their server',
    inputSchema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['hetzner', 'digitalocean', 'oracle'],
          description: 'The VPS provider the user chose',
        },
        session_id: {
          type: 'string',
          description: 'Unique session identifier for this installation',
        },
      },
      required: ['provider', 'session_id'],
    },
  },
  {
    name: 'get_subdomain',
    description: 'Returns the assigned subdomain once installation is complete. Poll this after user confirms the install command has finished running.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session_id used during installation',
        },
      },
      required: ['session_id'],
    },
  },
]

export function handleToolCall(name: string, args: Record<string, string>, baseUrl: string): unknown {
  if (name === 'get_hosting_options') {
    return {
      options: [
        {
          provider: 'hetzner',
          name: 'Hetzner CX11',
          price: '€3.29/month',
          recommended: true,
          specs: '1 vCPU, 2GB RAM, 20GB SSD',
          note: 'Best price/performance. Takes ~5 minutes to create.',
        },
        {
          provider: 'digitalocean',
          name: 'DigitalOcean Droplet',
          price: '$6/month',
          recommended: false,
          specs: '1 vCPU, 1GB RAM, 25GB SSD',
          note: 'Familiar interface, slightly more expensive.',
        },
        {
          provider: 'oracle',
          name: 'Oracle Cloud Always Free',
          price: 'Free',
          recommended: false,
          specs: '1 vCPU, 1GB RAM',
          note: 'Free but requires credit card verification and setup is more complex.',
        },
      ],
    }
  }

  if (name === 'generate_install_command') {
    const { provider, session_id } = args
    const scriptUrl = `${baseUrl}/api/script?provider=${provider}&session_id=${session_id}`
    return {
      command: `curl -fsSL "${scriptUrl}" | sudo bash`,
      session_id,
      note: 'Tell the user to copy this command, paste it into their server terminal, and press Enter. The installation takes about 5 minutes.',
    }
  }

  if (name === 'get_subdomain') {
    return {
      status: 'pending',
      message: 'The subdomain will be assigned automatically when the install script finishes. Ask the user if they see "FRACTERA_READY:" at the end of the terminal output.',
    }
  }

  return { error: `Unknown tool: ${name}` }
}
```

- [ ] **Step 2: Create MCP system prompt**

Create `lib/mcp-prompt.ts`:

```typescript
export const MCP_SYSTEM_PROMPT = `You are a Fractera installation assistant. Your job is to help the user install Fractera AI Workspace on their own VPS server through a friendly conversation.

## Your personality
- Warm, patient, and encouraging
- Never use technical jargon without explaining it
- Always confirm what you're doing before doing it

## The conversation flow

### Step 1: Language
First message: Ask the user what language they prefer. All further messages must be in that language.

### Step 2: Explain what's happening
Tell the user:
- They are going to get their own Fractera AI Workspace running on their own server
- It will have its own web address (like happy-fox-42.fractera.ai)
- The whole process takes about 15-20 minutes
- They will need to pay for a server (~€3/month) but Fractera itself is free

### Step 3: Choose hosting
Call get_hosting_options() and present the results to the user.
Recommend Hetzner as the best option for most people.
Ask the user to pick one or say they already have a server.

### Step 4: Guide VPS creation
Based on their choice, give them step-by-step instructions to create a VPS:

For Hetzner:
1. Go to hetzner.com → Sign up or log in
2. Click "New Server"
3. Location: pick the closest to them
4. Image: Ubuntu 22.04
5. Type: CX11 (the cheapest)
6. No SSH key needed (they'll use root password)
7. Click "Create & Buy Now"
8. Hetzner will show the root password — tell them to copy it!
9. The server IP will appear in the dashboard

For DigitalOcean:
1. Go to digitalocean.com → Sign up or log in
2. Click "Create" → "Droplets"
3. Region: closest to them
4. Image: Ubuntu 22.04 LTS
5. Size: Basic → Regular → $6/mo
6. Authentication: Password (set a root password)
7. Click "Create Droplet"
8. IP appears in dashboard after ~1 minute

For Oracle:
1. Go to oracle.com/cloud/free → Sign up
2. Go to Compute → Instances → Create Instance
3. Image: Ubuntu 22.04
4. Shape: VM.Standard.E2.1.Micro (Always Free)
5. Add SSH key or set password
6. Create instance, wait for IP

### Step 5: Onboarding dialogue (while they wait ~5 min for server)
While the user is setting up their server, have a friendly conversation:
- "While your server is starting up, let me learn a bit about you!"
- Ask ONE question at a time, wait for the answer:
  1. "What do you plan to build or create with your AI workspace?"
  2. "Which AI assistants do you currently use? (Claude, ChatGPT, Gemini, other?)"
  3. "What's your main language for work — or do you mix several?"
- Remember their answers — you'll use them when their workspace is ready.

### Step 6: Get the server IP
Ask the user to share their server's IP address.
It should look like: 1.2.3.4
Generate a session_id by combining a timestamp and random string, e.g. "sess-1234567890-abc"

### Step 7: Generate install command
Call generate_install_command(provider, session_id) and show the user the curl command.
Tell them:
- "Copy this command"
- "Open your server terminal (if you don't know how, I'll help)"
- "Paste it and press Enter"
- "You'll see text scrolling — this is normal. It takes about 5 minutes."
- "When you see 'FRACTERA_READY:' at the end — come back and tell me!"

### Step 8: Help with terminal access (if needed)
If they don't know how to access their server terminal:

For Hetzner: 
- Go to your server in Hetzner Cloud console
- Click "Console" button at the top
- Log in as: root
- Password: the one shown when you created the server

For DigitalOcean:
- Go to your Droplet in the dashboard
- Click "Console" button
- Or use any SSH client: ssh root@YOUR_IP

### Step 9: Confirm completion
When user says the install is done or they saw "FRACTERA_READY:", ask them to share the domain shown (it will be something like happy-fox-42.fractera.ai).

Tell them:
- "Congratulations! Your Fractera workspace is ready!"
- "Open this address in your browser: https://[their-subdomain]"
- "The first account you create will be the Administrator"
- "Register now to secure your workspace"

### Step 10: Personal welcome
Based on their onboarding answers, give them 2-3 personalized next steps:
- Which AI platform to activate first
- What kind of project to start with
- Any relevant tips based on what they said they want to build

## Important rules
- Never ask for passwords or SSH keys
- Never try to connect to their server yourself
- If something goes wrong, be patient and help debug step by step
- If you don't know something, say so honestly
`
```

- [ ] **Step 3: Create MCP route**

Create `app/api/mcp/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { MCP_TOOLS, handleToolCall } from '@/lib/mcp-tools'
import { MCP_SYSTEM_PROMPT } from '@/lib/mcp-prompt'

export async function GET(req: NextRequest) {
  const baseUrl = `https://${req.headers.get('host')}`

  const manifest = {
    schema_version: 'v1',
    name_for_human: 'Fractera Installer',
    name_for_model: 'fractera_installer',
    description_for_human: 'Install Fractera AI Workspace on your own server',
    description_for_model: MCP_SYSTEM_PROMPT,
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${baseUrl}/api/mcp/openapi.json`,
    },
    tools: MCP_TOOLS,
  }

  return NextResponse.json(manifest)
}

export async function POST(req: NextRequest) {
  const baseUrl = `https://${req.headers.get('host')}`
  const body = await req.json()

  const { method, params } = body

  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      result: { tools: MCP_TOOLS },
    })
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params
    const result = handleToolCall(name, args || {}, baseUrl)
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      result: {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      },
    })
  }

  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'fractera-installer', version: '1.0.0' },
      },
    })
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id: body.id,
    error: { code: -32601, message: 'Method not found' },
  })
}
```

- [ ] **Step 4: Test MCP tools/list**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | jq .result.tools[].name
```

Expected output:
```
"get_hosting_options"
"generate_install_command"
"get_subdomain"
```

- [ ] **Step 5: Test get_hosting_options tool**

```bash
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_hosting_options","arguments":{}}}' | jq .
```

Expected: JSON with 3 hosting options (hetzner, digitalocean, oracle).

- [ ] **Step 6: Commit**

```bash
git add lib/mcp-tools.ts lib/mcp-prompt.ts app/api/mcp/route.ts
git commit -m "feat: MCP server with 3 tools and onboarding system prompt"
```

---

## Task 5: Landing page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace landing page**

Replace `app/page.tsx` with:

```tsx
export default function Home() {
  const mcpUrl = 'https://fractera.ai/api/mcp'

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-12">

        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Fractera
          </h1>
          <p className="text-xl text-gray-400">
            Your own AI workspace. On your own server. No coding required.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">
            Launch your workspace in 15 minutes
          </h2>
          <p className="text-gray-400">
            Install this MCP in claude.ai, then type <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">"install fractera"</span> to start.
          </p>

          {/* Install steps */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <div>
                <p className="font-medium">Open claude.ai Settings</p>
                <p className="text-sm text-gray-400">Go to Settings → Integrations → Add MCP</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <div>
                <p className="font-medium">Paste this URL</p>
                <div className="mt-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <code className="text-sm text-green-400 flex-1 break-all">{mcpUrl}</code>
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <div>
                <p className="font-medium">Start a new chat</p>
                <p className="text-sm text-gray-400">Type <span className="text-white font-mono">"install fractera"</span> and Claude will guide you</p>
              </div>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">What you get</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex gap-2"><span className="text-green-400">✓</span> Your own subdomain: <span className="text-white">name.fractera.ai</span></li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Claude Code, Gemini, Codex — all in one place</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Your data stays on your server</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Server costs ~€3/month (you pay your host directly)</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Fractera is open source. fractera.ai handles subdomain registration only.
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Check in browser**

Open http://localhost:3000 — should show the landing page with dark background, the MCP URL, and 3-step instructions.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing page with MCP install instructions"
```

---

## Task 6: Deploy and connect domain

**Files:** None — Vercel + Cloudflare configuration.

- [ ] **Step 1: Push all changes to GitHub**

```bash
git push origin main
```

Vercel will auto-deploy within ~1 minute.

- [ ] **Step 2: Add fractera.ai domain to Vercel**

1. Go to vercel.com → project `fractera-easy-starter`
2. Settings → Domains
3. Add `fractera.ai` and `www.fractera.ai`
4. Vercel will show DNS records to add

- [ ] **Step 3: Add Vercel DNS records in Cloudflare**

Vercel will give you records like:
- `fractera.ai` → A record → `76.76.21.21`
- `www` → CNAME → `cname.vercel-dns.com`

In Cloudflare dashboard → fractera.ai → DNS:
- Delete old A records for `fractera.ai` (the ones pointing to 64.29.17.65 and 216.198.79.x)
- Add the new A record from Vercel for `fractera.ai`
- Add CNAME for `www`
- Set both to **DNS only** (grey cloud, NOT proxied) — Vercel handles SSL

- [ ] **Step 4: Verify deployment**

```bash
curl -s https://fractera.ai | head -5
```

Expected: HTML starting with `<!DOCTYPE html>` from the Next.js landing page.

```bash
curl -s -X POST https://fractera.ai/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | jq .result.tools[].name
```

Expected: 3 tool names printed.

- [ ] **Step 5: Test /api/register against Cloudflare**

```bash
curl -s -X POST https://fractera.ai/api/register \
  -H "Content-Type: application/json" \
  -H "x-install-secret: fractera-secret-2024-xk9m" \
  -d '{"ip":"1.2.3.4","session_id":"test-deploy-1"}' | jq .
```

Expected: `{ "subdomain": "some-name.fractera.ai", "session_id": "test-deploy-1" }`

Check Cloudflare dashboard → DNS → new record should appear.

- [ ] **Step 6: Commit final state**

```bash
git add .
git commit -m "chore: MVP complete — register, script, MCP, landing page"
```

---

## Done — MVP Checklist

- [ ] `fractera.ai` loads the landing page
- [ ] `fractera.ai/api/mcp` responds to MCP tool calls
- [ ] `fractera.ai/api/register` creates real DNS records in Cloudflare
- [ ] `fractera.ai/api/script?provider=hetzner&session_id=x` returns a valid bash script
- [ ] Claude in claude.ai can call the MCP tools
