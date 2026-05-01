# Bootstrap Agent Installation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken SSH-install approach with a bootstrap agent pattern: our server uploads a tiny bash script to the user's VPS via SSH (2-3 seconds), that script runs natively on Linux and installs Fractera itself, reporting progress back to Vercel KV; the browser polls Vercel for progress updates every 3 seconds.

**Architecture:** Three parts: (1) `/api/install` uploads `bootstrap.sh` via SSH and starts it with PM2 — this is fast (<5s) and avoids native module issues; (2) `bootstrap.sh` runs on the user's Linux VPS, does all npm installs natively, and POSTs progress events to `/api/progress`; (3) the browser polls `/api/progress` every 3 seconds and shows real-time steps. Vercel KV stores progress state keyed by `session_id`.

**Tech Stack:** Next.js 16 App Router, TypeScript, ssh2 (upload only), Vercel KV (@vercel/kv), bash.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/api/install/route.ts` | Modify | Upload bootstrap.sh via SSH, start it with PM2, return session_id |
| `app/api/progress/route.ts` | Create | GET: return progress from KV; POST: receive progress from bootstrap script |
| `lib/bootstrap.sh` | Create | Bash script that runs on user's VPS, installs Fractera, POSTs progress |
| `lib/kv.ts` | Create | Vercel KV helpers: save/get/append progress |
| `components/install-form.tsx` | Modify | Replace SSE with polling GET /api/progress every 3 seconds |

---

## Task 1: Vercel KV setup and helpers

**Files:**
- Create: `lib/kv.ts`

- [ ] **Step 1: Add Vercel KV package**

```bash
cd /Users/romanbolshiyanov/Documents/Code/Fractera/fractera-easy-starter
pnpm add @vercel/kv
```

Expected: `@vercel/kv` added to dependencies.

- [ ] **Step 2: Create KV helpers**

Create `lib/kv.ts`:

```typescript
import { kv } from '@vercel/kv'

export type ProgressStep = {
  id: string
  label: string
  done: boolean
  ts: number
}

export type InstallProgress = {
  session_id: string
  status: 'installing' | 'done' | 'error'
  steps: ProgressStep[]
  subdomain?: string
  error?: string
}

export async function initProgress(session_id: string): Promise<void> {
  const initial: InstallProgress = {
    session_id,
    status: 'installing',
    steps: [],
  }
  await kv.set(`progress:${session_id}`, JSON.stringify(initial), { ex: 3600 })
}

export async function appendStep(session_id: string, step: ProgressStep): Promise<void> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return
  const progress: InstallProgress = JSON.parse(raw)
  const existing = progress.steps.findIndex(s => s.id === step.id)
  if (existing >= 0) {
    progress.steps[existing] = step
  } else {
    progress.steps.push(step)
  }
  await kv.set(`progress:${session_id}`, JSON.stringify(progress), { ex: 3600 })
}

export async function completeProgress(session_id: string, subdomain: string): Promise<void> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return
  const progress: InstallProgress = JSON.parse(raw)
  progress.status = 'done'
  progress.subdomain = subdomain
  await kv.set(`progress:${session_id}`, JSON.stringify(progress), { ex: 86400 })
}

export async function failProgress(session_id: string, error: string): Promise<void> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return
  const progress: InstallProgress = JSON.parse(raw)
  progress.status = 'error'
  progress.error = error
  await kv.set(`progress:${session_id}`, JSON.stringify(progress), { ex: 3600 })
}

export async function getProgress(session_id: string): Promise<InstallProgress | null> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return null
  return JSON.parse(raw)
}
```

- [ ] **Step 3: Add KV env vars to .env.local**

Add to `/Users/romanbolshiyanov/Documents/Code/Fractera/fractera-easy-starter/.env.local`:

```
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

Note: actual values come from Vercel dashboard → Storage → KV → Connect to project → `.env.local` tab. User needs to create a KV store on vercel.com first.

- [ ] **Step 4: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/kv.ts package.json pnpm-lock.yaml
git commit -m "feat: Vercel KV helpers for install progress tracking"
```

---

## Task 2: Bootstrap bash script

**Files:**
- Create: `lib/bootstrap.sh`

- [ ] **Step 1: Create bootstrap.sh**

Create `lib/bootstrap.sh`:

```bash
#!/bin/bash
# Fractera Bootstrap Agent
# Runs on the user's VPS. Reports progress to fractera.ai/api/progress.
set -e

SESSION_ID="$1"
PROGRESS_URL="https://fractera.ai/api/progress"
REGISTER_URL="https://fractera.ai/api/register"
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
apt-get install -y -qq git curl nginx certbot python3-certbot-nginx build-essential
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

report "start_app" "Starting application" false
pm2 start npm --name "fractera-app" -- run dev --prefix app
report "start_app" "Starting application" true

report "start_bridge" "Starting Bridge" false
pm2 start npm --name "fractera-bridge" -- run dev --prefix bridges/platforms
report "start_bridge" "Starting Bridge" true

report "start_media" "Starting media service" false
pm2 start npm --name "fractera-media" -- run dev --prefix services/media
report "start_media" "Starting media service" true

report "pm2_save" "Saving configuration" false
pm2 save
pm2 startup | tail -1 | bash > /dev/null 2>&1 || true
report "pm2_save" "Saving configuration" true

report "register" "Registering your domain" false
SERVER_IP=$(curl -s ifconfig.me)
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/bootstrap.sh
git commit -m "feat: bootstrap.sh — self-installing agent for user's VPS"
```

---

## Task 3: /api/progress endpoint

**Files:**
- Create: `app/api/progress/route.ts`

- [ ] **Step 1: Create progress route**

Create `app/api/progress/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProgress, appendStep, completeProgress, failProgress } from '@/lib/kv'

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const progress = await getProgress(session_id)
  if (!progress) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { session_id, step, done, response } = body

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  if (done && response) {
    const subdomain = response?.subdomain ?? null
    if (subdomain) {
      await completeProgress(session_id, subdomain)
    } else {
      await failProgress(session_id, 'Domain registration failed')
    }
    return NextResponse.json({ ok: true })
  }

  if (step) {
    await appendStep(session_id, { ...step, ts: step.ts ?? Date.now() })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/progress/route.ts
git commit -m "feat: /api/progress — GET poll progress, POST receive from bootstrap"
```

---

## Task 4: Rewrite /api/install to upload bootstrap.sh

**Files:**
- Modify: `app/api/install/route.ts`

- [ ] **Step 1: Rewrite the route**

Replace entire `app/api/install/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import { join } from 'path'
import { initProgress } from '@/lib/kv'

export const maxDuration = 30

function generateSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function POST(req: NextRequest) {
  const { ip, login, password } = await req.json()

  if (!ip || !login || !password) {
    return NextResponse.json({ error: 'Missing ip, login or password' }, { status: 400 })
  }

  const secret = process.env.INSTALL_SCRIPT_SECRET!
  const session_id = generateSessionId()

  // Read bootstrap script
  const bootstrapPath = join(process.cwd(), 'lib', 'bootstrap.sh')
  const bootstrapContent = readFileSync(bootstrapPath, 'utf-8')

  await initProgress(session_id)

  // Upload bootstrap.sh and start it — fast operation (<10s)
  await new Promise<void>((resolve, reject) => {
    const ssh = new Client()

    ssh.on('ready', () => {
      // Upload via SFTP then exec
      ssh.sftp((err, sftp) => {
        if (err) { reject(err); ssh.end(); return }

        const writeStream = sftp.createWriteStream('/tmp/fractera-bootstrap.sh')
        writeStream.write(bootstrapContent)
        writeStream.end()

        writeStream.on('close', () => {
          const cmd = `chmod +x /tmp/fractera-bootstrap.sh && nohup bash /tmp/fractera-bootstrap.sh "${session_id}" "${secret}" > /tmp/fractera-install.log 2>&1 &`
          ssh.exec(cmd, (err, stream) => {
            if (err) { reject(err); ssh.end(); return }
            stream.on('close', () => { ssh.end(); resolve() })
            stream.on('data', () => {})
            stream.stderr.on('data', () => {})
          })
        })

        writeStream.on('error', (err: Error) => { reject(err); ssh.end() })
      })
    })

    ssh.on('error', reject)

    ssh.connect({
      host: ip,
      port: 22,
      username: login,
      password,
      readyTimeout: 20000,
    })
  })

  return NextResponse.json({ session_id, status: 'installing' })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/install/route.ts
git commit -m "feat: /api/install uploads bootstrap.sh via SFTP and starts it in background"
```

---

## Task 5: Rewrite install-form to use polling

**Files:**
- Modify: `components/install-form.tsx`

- [ ] **Step 1: Replace SSE logic with polling**

In `components/install-form.tsx`, replace the `handleInstall` function and related state:

```typescript
async function handleInstall() {
  if (!ip || !password) return
  setInstalling(true)
  setSteps(ALL_STEPS.map(s => ({ ...s, done: false })))
  setSubdomain('')
  setActiveStep(null)

  // Start installation — returns session_id immediately
  const res = await fetch('/api/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, login, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    toast.error(err.error ?? 'Could not connect to server')
    setInstalling(false)
    return
  }

  const { session_id } = await res.json()

  // Poll /api/progress every 3 seconds
  const pollInterval = setInterval(async () => {
    try {
      const pollRes = await fetch(`/api/progress?session_id=${session_id}`)
      if (!pollRes.ok) return

      const progress = await pollRes.json()

      // Update steps from progress
      for (const step of progress.steps) {
        setSteps(prev => prev.map(s => s.id === step.id ? { ...s, done: step.done } : s))
        if (!step.done) setActiveStep(step.id)
        if (step.done) setActiveStep(null)
      }

      if (progress.status === 'done' && progress.subdomain) {
        clearInterval(pollInterval)
        setSubdomain(progress.subdomain)
        localStorage.setItem('fractera_domain', JSON.stringify({
          domain: progress.subdomain,
          status: 'ready',
        }))
        setInstalling(false)
      }

      if (progress.status === 'error') {
        clearInterval(pollInterval)
        toast.error(progress.error ?? 'Installation failed')
        setInstalling(false)
      }
    } catch {
      // Network error during poll — ignore, retry next cycle
    }
  }, 3000)

  // Store interval ref for cleanup
  eventSourceRef.current = () => clearInterval(pollInterval)
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Test locally**

```bash
pnpm dev
```

Open http://localhost:3000 — verify install form renders, button is active when IP and password filled.

- [ ] **Step 4: Commit**

```bash
git add components/install-form.tsx
git commit -m "feat: install-form uses polling instead of SSE"
```

---

## Task 6: Setup Vercel KV and deploy

**Files:** None — Vercel dashboard configuration.

- [ ] **Step 1: Create Vercel KV store**

1. Go to vercel.com → project `fractera-easy-starter`
2. Tab **Storage** → **Create Database** → **KV**
3. Name: `fractera-kv` → **Create**
4. Click **Connect to Project** → select `fractera-easy-starter`
5. Go to **.env.local** tab → copy all 4 env vars

- [ ] **Step 2: Add KV vars to .env.local**

Add the 4 KV vars from Vercel to `.env.local`:
```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

- [ ] **Step 3: Add KV vars to Vercel project env**

In Vercel → project → Settings → Environment Variables — Vercel auto-adds them when you connect KV. Verify they appear.

- [ ] **Step 4: Push to deploy**

```bash
git push origin main
```

Wait ~1 minute for Vercel to deploy.

- [ ] **Step 5: Verify /api/progress works**

```bash
curl -s "https://fractera.ai/api/progress?session_id=test-123"
```

Expected: `{"error":"Session not found"}` — KV is connected and responding.

- [ ] **Step 6: Commit final state**

```bash
git add .env.local
git commit -m "chore: add Vercel KV env vars"
```

---

## Done checklist

- [ ] `lib/kv.ts` — KV helpers for progress tracking
- [ ] `lib/bootstrap.sh` — self-installing bash agent
- [ ] `app/api/progress/route.ts` — GET poll + POST receive from bootstrap
- [ ] `app/api/install/route.ts` — uploads bootstrap.sh via SFTP in <10s, returns session_id
- [ ] `components/install-form.tsx` — polls /api/progress every 3s
- [ ] Vercel KV store connected to project
- [ ] End-to-end test: fill form → bootstrap uploads → progress appears in browser
