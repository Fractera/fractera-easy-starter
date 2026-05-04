# Fractera Architecture Migration

## Monolith → Four Independent Services

**Document version:** 1.0  
**Status:** Technical Specification — Ready for Implementation  
**Applies to repository:** `Fractera/ai-workspace`  
**Related repository:** `Fractera/fractera-easy-starter` (installer, read-only context)

-----

## Context: How the Fractera Ecosystem Works

Before reading this migration plan, understand the two-repository system:

**`fractera-easy-starter`** is a public Next.js application deployed on Vercel at `fractera-easy-starter.vercel.app`. It serves as an MCP server and onboarding wizard. A user connects it to Claude.ai as an MCP connector. Claude Code then uses three MCP tools (`get_hosting_options`, `generate_install_command`, `check_status`, `get_subdomain`) to provision a VPS, connect via SSH, and install the `ai-workspace` repository automatically. The easy-starter also registers a subdomain at `fractera.ai`. This repository is **not touched** by this migration.

**`ai-workspace`** is the actual product that gets installed on the user’s VPS. This is the repository being migrated. Currently it runs three services from a single root via `concurrently`:

- `app/` — Next.js 16.2, port 3000 (contains auth, UI, bridges client UI, settings)
- `bridges/platforms/` — Node.js WebSocket server, ports 3200–3206 (AI terminal sessions)
- `services/media/` — Express HTTP server, port 3300 (file upload, crop, S3-compatible storage)

-----

## Problem Statement: Why Migration is Necessary

### Single Point of Failure

Currently, **NextAuth v5 lives inside `app/`**. The Bridges WebSocket server (`bridges/platforms/`) is a separate process, but its **client-side UI** (the terminal interface, slot components) lives inside `app/` as Next.js parallel routes (`@slot`). This means:

- If `app/` crashes or restarts during a build → Bridges UI is inaccessible
- If `app/` is under active AI-assisted development (Claude Code modifying files, hot reload running) → Bridges becomes unstable
- Bridges cannot be moved to its own subdomain (`admin.partner.fractera.ai`) without its own auth, because the only auth system lives inside `app/`
- `services/media/` (port 3300) has no independent auth — it relies on session validation proxied through `app/`

### AI Agent Safety Problem

When Claude Code, Gemini CLI, Codex, or any other AI agent works on the project, it runs from inside `app/` as instructed by `CLAUDE.md`. However, because auth, bridges client, and media service are all entangled in the same process tree and share the same filesystem context, a destructive AI operation (wrong file deletion, broken middleware, failed build) can cascade and take down auth, bridges, or media simultaneously.

### Target Security Model

After migration, AI agents work **exclusively inside `app/`**. Auth, bridges, and data services are on separate subdomains with separate codebases. An AI agent cannot physically reach those services — not through file edits, not through build errors, not through middleware mistakes. This is architectural isolation, not a policy.

-----

## Target Architecture: Four Independent Applications

```
partner.fractera.ai          → app/          (Next.js shell, port 3000)
auth.partner.fractera.ai     → services/auth/ (NextAuth service, port 3001)
admin.partner.fractera.ai    → bridges/       (Bridges + terminal UI, port 3002)
data.partner.fractera.ai     → services/data/ (Media + SQLite API, port 3300)
```

### Dependency Graph

```
auth.partner.fractera.ai
    ↑           ↑           ↑
    |           |           |
admin       partner        data
(reads      (reads         (reads
 cookie)     cookie)        cookie)
```

**Rule:** `auth` depends on nothing. `admin`, `partner`, and `data` each depend only on `auth`. `admin`, `partner`, and `data` are independent of each other.

### Service Descriptions

#### `auth.partner.fractera.ai` — Authentication Service

- Extracted from `app/` — NextAuth v5 config, database adapter, session logic
- Issues a JWT session cookie scoped to `.partner.fractera.ai` (shared across all subdomains)
- Exposes a single internal endpoint: `GET /api/auth/session` — returns session payload for token validation
- Has no UI of its own — UI is rendered as an iframe inside `partner.fractera.ai`
- Rendered in `partner.fractera.ai` as a modal iframe when no session is detected
- Must remain running at all times — it is the only service all others depend on

#### `admin.partner.fractera.ai` — Bridges (AI Terminal Workspace)

- The current `bridges/platforms/` WebSocket server + its client UI, extracted into a standalone Next.js application
- Validates session by calling `auth.partner.fractera.ai/api/auth/session` directly — no dependency on `app/`
- Accessible directly via browser at its own subdomain — works even if `partner.fractera.ai` is down
- Also rendered as an iframe inside `partner.fractera.ai` for integrated experience
- The iframe can optionally be detached into a floating draggable window (mobile-friendly modal)
- AI agents (Claude Code, Gemini, Codex, Qwen, Kimi) running inside this workspace never have filesystem access to `auth`, `data`, or `partner` services

#### `data.partner.fractera.ai` — Data Service

- The current `services/media/` Express server, expanded to be the single data access layer
- Handles: file upload, image crop, favicon/PWA icon generation, S3-compatible object storage, SQLite browser API
- Validates session by calling `auth.partner.fractera.ai/api/auth/session` directly
- All data operations (media library, database browser) are routed through this service
- `partner.fractera.ai` and `admin.partner.fractera.ai` call this service’s HTTP API — neither holds its own database connection

#### `partner.fractera.ai` — Shell Application

- Becomes a lightweight host — no auth logic, no database connection, no terminal UI
- Responsibilities: render the three iframes, route between them, handle theme/locale preferences
- On load: checks for session cookie → if absent, shows auth iframe as modal → on success, shows admin iframe
- Media library, database browser, settings panel call `data` service API directly
- If `partner.fractera.ai` is unavailable, users open `admin.partner.fractera.ai` directly and continue working

-----

## Current File Structure (Before Migration)

```
ai-workspace/
├── app/                          ← Next.js application (port 3000)
│   ├── app/                      ← Next.js App Router
│   │   ├── (auth)/               ← Login/register pages
│   │   ├── (dashboard)/          ← Main workspace
│   │   ├── @bridges/             ← PARALLEL SLOT: Bridges terminal UI
│   │   ├── api/
│   │   │   ├── auth/             ← NextAuth v5 routes
│   │   │   ├── db/               ← SQLite browser API
│   │   │   ├── media/            ← Media proxy routes
│   │   │   ├── settings/         ← Env var editor
│   │   │   └── update/           ← Auto-update from GitHub
│   │   ├── auth.ts               ← NextAuth configuration
│   │   └── middleware.ts         ← Route protection (proxy-based)
│   ├── lib/
│   │   └── db.ts                 ← better-sqlite3 connection
│   └── package.json
│
├── bridges/platforms/            ← WebSocket bridge server (ports 3200–3206)
│   ├── server.js                 ← Main WebSocket server
│   ├── platforms/                ← Per-platform handlers (claude, gemini, codex...)
│   └── package.json
│
├── services/media/               ← Media HTTP service (port 3300)
│   ├── index.js                  ← Express server
│   ├── routes/                   ← Upload, crop, favicon, list, delete
│   ├── data/media.db             ← Separate SQLite for media metadata
│   └── package.json
│
├── storage/                      ← Local S3-compatible file storage
├── CLAUDE.md                     ← AI agent working directory instructions
├── AGENTS.md                     ← Setup agent instructions
└── package.json                  ← Root: concurrently starts all three
```

-----

## Target File Structure (After Migration)

```
ai-workspace/
├── app/                          ← Shell app → partner.fractera.ai (port 3000)
│   ├── app/
│   │   ├── page.tsx              ← iframe orchestrator
│   │   ├── layout.tsx            ← theme, locale, global providers
│   │   └── api/
│   │       └── update/           ← Auto-update (safe, no auth dependency)
│   └── package.json
│
├── services/
│   ├── auth/                     ← NEW → auth.partner.fractera.ai (port 3001)
│   │   ├── app/
│   │   │   ├── (auth)/           ← Login/register UI (rendered as iframe)
│   │   │   └── api/
│   │   │       ├── auth/         ← NextAuth v5 routes
│   │   │       └── session/      ← GET /api/auth/session (internal validator)
│   │   ├── lib/
│   │   │   └── db.ts             ← SQLite: users, sessions, accounts
│   │   └── package.json
│   │
│   └── data/                     ← RENAMED from media/ → data.partner.fractera.ai (port 3300)
│       ├── index.js              ← Express server (extended)
│       ├── routes/
│       │   ├── media/            ← Upload, crop, list, delete, favicon
│       │   └── db/               ← SQLite browser API (moved from app/)
│       ├── middleware/
│       │   └── auth.js           ← Validates cookie via auth service
│       ├── data/
│       │   ├── media.db          ← Media metadata
│       │   └── app.db            ← Application database (moved from app/)
│       └── package.json
│
├── bridges/                      ← Standalone app → admin.partner.fractera.ai (port 3002)
│   ├── app/                      ← Next.js App Router (terminal UI)
│   │   ├── page.tsx              ← Terminal workspace UI
│   │   ├── middleware.ts         ← Validates session via auth service
│   │   └── api/
│   │       └── ws/               ← WebSocket upgrade endpoint
│   ├── platforms/                ← Per-platform WebSocket handlers (unchanged)
│   ├── server.js                 ← WebSocket server (ports 3200–3206, unchanged)
│   └── package.json
│
├── storage/                      ← Shared file storage (mounted path, unchanged)
├── CLAUDE.md                     ← UPDATED: AI agents work only in app/
├── AGENTS.md                     ← UPDATED: setup instructions for new structure
└── package.json                  ← Root: starts all four services via concurrently
```

-----

## Shared Cookie Strategy

All four services share a single session cookie. This is the technical foundation of the entire architecture.

**Cookie name:** `fractera-session`  
**Cookie domain:** `.partner.fractera.ai` (note the leading dot — this makes it available to all subdomains)  
**Cookie attributes:** `HttpOnly`, `Secure`, `SameSite=Lax`  
**Set by:** `auth.partner.fractera.ai` only — no other service writes this cookie  
**Read by:** `admin`, `data`, `partner` — all read the same cookie, validate via auth service

### Session Validation Flow (for `admin` and `data`)

```
1. Request arrives at admin.partner.fractera.ai
2. middleware.ts reads cookie `fractera-session` from request headers
3. Makes internal HTTP call: GET auth.partner.fractera.ai/api/auth/session
   with cookie forwarded in Authorization header or as Cookie header
4. auth service validates JWT, returns { userId, role, email } or 401
5. If 401 → redirect to auth.partner.fractera.ai (or postMessage to parent if in iframe)
6. If valid → request proceeds
```

**Important for iframe context:** When `auth` is rendered as an iframe inside `partner`, after successful login it must communicate back to the parent window via `window.parent.postMessage({ type: 'AUTH_SUCCESS', session: {...} })`. The parent shell listens for this event and replaces the auth iframe with the admin iframe.

-----

## Migration Stages

### Stage 1 — Extract Auth Service

**Goal:** Move NextAuth out of `app/` into `services/auth/` as a standalone Next.js app.

**What to do:**

1. Create `services/auth/` as a new Next.js project (`next 16.2.4`, same stack as `app/`)
1. Move the following from `app/` to `services/auth/`:
- `app/auth.ts` → `services/auth/app/auth.ts`
- `app/app/(auth)/` (login, register pages) → `services/auth/app/(auth)/`
- `app/app/api/auth/` (NextAuth route handler) → `services/auth/app/api/auth/`
- `app/lib/db.ts` (users table only) → `services/auth/lib/db.ts`
1. Add new route: `services/auth/app/api/session/route.ts`
- `GET /api/session` — reads NextAuth session, returns `{ userId, role, email }` or 401
- This is the internal validation endpoint all other services will call
1. Update NextAuth config:
- Set `cookie.sessionToken.options.domain = '.partner.fractera.ai'`
- Set `cookie.sessionToken.options.sameSite = 'lax'`
- Set `cookie.sessionToken.options.secure = true`
1. Update `app/` to remove all auth code — middleware now validates by calling `auth` service instead of reading NextAuth session locally
1. Add `services/auth/` to root `package.json` concurrently script
1. Configure Nginx: `auth.partner.fractera.ai` → `localhost:3001`

**Verification:**

- Register a user at `auth.partner.fractera.ai/register`
- Confirm cookie `fractera-session` is set with domain `.partner.fractera.ai`
- Open `partner.fractera.ai` — cookie is present, no re-login required
- Call `auth.partner.fractera.ai/api/session` with the cookie — returns user data

**Do not proceed to Stage 2 until this is verified.**

-----

### Stage 2 — Extract Data Service

**Goal:** Move database browser API and unify it with media service under `services/data/`.

**What to do:**

1. Rename `services/media/` to `services/data/`
1. Move the following from `app/app/api/db/` → `services/data/routes/db/`
- All SQLite browser routes (list tables, get rows, edit cell, delete row)
1. Move `app/` SQLite database file to `services/data/data/app.db`
- Update `services/data/` to manage both `media.db` and `app.db`
1. Add auth middleware to `services/data/`:
   
   ```js
   // services/data/middleware/auth.js
   async function requireAuth(req, res, next) {
     const cookie = req.headers.cookie
     const response = await fetch('http://localhost:3001/api/session', {
       headers: { cookie }
     })
     if (!response.ok) return res.status(401).json({ error: 'Unauthorized' })
     req.session = await response.json()
     next()
   }
   ```
1. Apply `requireAuth` middleware to all routes except health check
1. Update `app/` — all DB and media API calls now proxy to `data.partner.fractera.ai`
1. Configure Nginx: `data.partner.fractera.ai` → `localhost:3300`

**Verification:**

- Open database browser — data loads from `data` service
- Upload an image — stored via `data` service
- Try accessing `data.partner.fractera.ai/api/media` without cookie — returns 401

**Do not proceed to Stage 3 until this is verified.**

-----

### Stage 3 — Extract Bridges as Standalone App

**Goal:** Give Bridges its own Next.js frontend, independent auth, own subdomain.

**What to do:**

1. Create `bridges/app/` as a new Next.js project inside the existing `bridges/` folder
1. Move Bridges terminal UI from `app/app/@bridges/` → `bridges/app/app/`
- All terminal components, slot layout, WebSocket client hooks
1. Add `bridges/app/middleware.ts`:
   
   ```ts
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function middleware(req: NextRequest) {
     const cookie = req.headers.get('cookie') ?? ''
     const res = await fetch('http://localhost:3001/api/session', {
       headers: { cookie }
     })
     if (!res.ok) {
       return NextResponse.redirect(new URL('http://auth.partner.fractera.ai/login'))
     }
     return NextResponse.next()
   }
   
   export const config = { matcher: ['/((?!_next|favicon).*)'] }
   ```
1. Remove `@bridges` parallel slot from `app/` entirely
1. Add `bridges/app/` to root `package.json` concurrently script (port 3002)
1. Configure Nginx: `admin.partner.fractera.ai` → `localhost:3002`
1. The existing WebSocket server (`bridges/server.js`, ports 3200–3206) remains unchanged — it does not need auth middleware (WebSocket connections are initiated from authenticated browser sessions)

**Verification:**

- Open `admin.partner.fractera.ai` directly without cookie → redirected to auth
- Login at `auth.partner.fractera.ai` → open `admin.partner.fractera.ai` → terminals load
- Stop `partner.fractera.ai` process → `admin.partner.fractera.ai` continues working

**Do not proceed to Stage 4 until this is verified.**

-----

### Stage 4 — Rebuild Shell App

**Goal:** Reduce `partner.fractera.ai` to a pure iframe orchestrator.

**What to do:**

1. Remove from `app/`:
- All auth pages and API routes (moved to `services/auth/`)
- All database API routes (moved to `services/data/`)
- All media API routes (moved to `services/data/`)
- `@bridges` parallel slot (moved to `bridges/app/`)
- `lib/db.ts` (no longer needed)
- NextAuth dependency from `app/package.json`
1. Replace `app/app/page.tsx` with iframe orchestrator:
   
   ```tsx
   'use client'
   import { useEffect, useState } from 'react'
   
   export default function Shell() {
     const [authed, setAuthed] = useState<boolean | null>(null)
   
     useEffect(() => {
       fetch('http://auth.partner.fractera.ai/api/session', {
         credentials: 'include'
       }).then(r => setAuthed(r.ok))
   
       window.addEventListener('message', (e) => {
         if (e.data?.type === 'AUTH_SUCCESS') setAuthed(true)
       })
     }, [])
   
     if (authed === null) return <div>Loading...</div>
   
     if (!authed) return (
       <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
         <iframe
           src="https://auth.partner.fractera.ai/login"
           className="w-full max-w-md h-[500px] rounded-2xl border-0 shadow-2xl"
         />
       </div>
     )
   
     return (
       <iframe
         src="https://admin.partner.fractera.ai"
         className="w-full h-screen border-0"
         allow="clipboard-read; clipboard-write"
       />
     )
   }
   ```
1. Update `app/middleware.ts` — session validation now calls `auth` service, no local NextAuth
1. Settings panel (env editor, update button) remains in `app/` — these are shell-level operations
1. Update `CLAUDE.md` — clarify that `app/` is now the shell only, AI agents should not touch `services/` or `bridges/`

**Verification:**

- Open `partner.fractera.ai` without session → auth modal appears as iframe
- Login → auth iframe disappears, admin iframe loads
- Resize window — admin iframe fills full viewport
- Stop and restart `partner.fractera.ai` — user opens `admin.partner.fractera.ai` directly and continues working without interruption

-----

### Stage 5 — Update Root Package and Nginx

**Goal:** Update the startup scripts and server configuration to reflect the new four-service architecture.

**Root `package.json` after migration:**

```json
{
  "name": "fractera-light",
  "version": "2.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix app\" \"npm run dev --prefix services/auth\" \"npm run dev --prefix bridges/app\" \"node bridges/server.js\" \"node services/data/index.js\"",
    "start": "concurrently \"npm run start --prefix app\" \"npm run start --prefix services/auth\" \"npm run start --prefix bridges/app\" \"node bridges/server.js\" \"node services/data/index.js\"",
    "install:all": "npm i --prefix app && npm i --prefix services/auth && npm i --prefix bridges/app && npm i --prefix services/data"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

**Nginx configuration:**

```nginx
# Auth service
server {
    server_name auth.partner.fractera.ai;
    location / { proxy_pass http://localhost:3001; }
}

# Admin (Bridges)
server {
    server_name admin.partner.fractera.ai;
    location / { proxy_pass http://localhost:3002; }
    location /ws { proxy_pass http://localhost:3200; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
}

# Data service
server {
    server_name data.partner.fractera.ai;
    location / { proxy_pass http://localhost:3300; }
}

# Shell app
server {
    server_name partner.fractera.ai;
    location / { proxy_pass http://localhost:3000; }
}
```

**Update `CLAUDE.md`:**

```markdown
## Working directory rule

Always run Claude Code from `app/` — never from the project root.

`app/` is the shell application only. It contains no auth logic, no database,
no terminal UI, and no media handling. All development work on user-facing
features happens here.

Do not edit files in:
- `services/auth/` — authentication service, managed separately
- `services/data/` — data and media service, managed separately
- `bridges/` — AI terminal workspace, managed separately

If you need to work on those services, start a separate Claude Code session
from that service's directory.
```

-----

### Stage 6 — Update `fractera-easy-starter` Installer

**Goal:** Update the MCP installer to provision all four subdomains and configure Nginx correctly.

This stage is performed in the **`fractera-easy-starter` repository**, not in `ai-workspace`.

**What to update:**

1. `generate_install_command` MCP tool — the install script must now:
- Clone `ai-workspace` as before
- Run `npm run install:all` (installs dependencies for all four services)
- Configure Nginx with four server blocks (see Stage 5)
- Register four subdomains: `partner`, `auth`, `admin`, `data`
- Start all services with PM2 or systemd
1. `check_status` MCP tool — must check health of all four services, not just one
1. `get_subdomain` MCP tool — must return all four subdomains, not just the main one
1. Update `slides.config.ts` — onboarding slides must reflect new subdomain structure
1. Update `providers.config.ts` — no changes needed (provider list is independent)

-----

## Security Summary After Migration

|What an AI agent can destroy |What an AI agent cannot touch                |
|-----------------------------|---------------------------------------------|
|Shell UI components in `app/`|User accounts and sessions (`services/auth/`)|
|Shell routing and layout     |Session cookie issuance logic                |
|Shell settings panel         |Database content (`services/data/`)          |
|Shell auto-update logic      |File storage                                 |
|(nothing else)               |Terminal WebSocket handlers (`bridges/`)     |
|                             |Nginx configuration                          |
|                             |PM2 / systemd service definitions            |
|                             |The auth service itself                      |

An AI agent working in `app/` can break the shell. It cannot break authentication, data, or bridges. Those services continue running on their own subdomains regardless of what happens to `app/`.

-----

## Environment Variables After Migration

Each service has its own `.env` file. Shared variables are duplicated intentionally — this is the cost of independence.

**`services/auth/.env`**

```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://auth.partner.fractera.ai
DATABASE_URL=./data/auth.db
COOKIE_DOMAIN=.partner.fractera.ai
```

**`services/data/.env`**

```
AUTH_SERVICE_URL=http://localhost:3001
PORT=3300
STORAGE_PATH=../../storage
```

**`bridges/app/.env`**

```
AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=wss://admin.partner.fractera.ai/ws
```

**`app/.env`**

```
NEXT_PUBLIC_AUTH_URL=https://auth.partner.fractera.ai
NEXT_PUBLIC_ADMIN_URL=https://admin.partner.fractera.ai
AUTH_SERVICE_URL=http://localhost:3001
```

-----

## Definition of Done

Migration is complete when all of the following are true:

- [ ] `auth.partner.fractera.ai` is running independently, issues shared cookies
- [ ] `data.partner.fractera.ai` is running independently, validates via auth service
- [ ] `admin.partner.fractera.ai` is running independently, validates via auth service
- [ ] `partner.fractera.ai` contains zero auth logic and zero database connections
- [ ] Stopping `partner.fractera.ai` does not affect `admin` or `data`
- [ ] AI agents (Claude Code) are instructed to work only in `app/`
- [ ] `CLAUDE.md` is updated with new working directory rules
- [ ] `AGENTS.md` is updated with new setup instructions for all four services
- [ ] Root `package.json` starts all four services correctly
- [ ] Nginx routes all four subdomains correctly
- [ ] `fractera-easy-starter` installer provisions all four subdomains on fresh VPS
- [ ] Existing user data (SQLite, storage files) is migrated without loss

-----

## Questions Claude Code May Ask

Before starting, Claude Code should confirm the following with the operator:

1. **Is there live user data to preserve?** If yes, a database migration script is needed before Stage 2. If this is a fresh install, skip.
1. **What is the actual partner subdomain?** The placeholder `partner` in all subdomain examples must be replaced with the real subdomain assigned by `fractera.ai`.
1. **Is PM2 or systemd used for process management?** The root `package.json` `start` script uses `concurrently` as a default, but production servers should use PM2 or systemd for auto-restart. Claude Code should ask which is preferred before writing service definitions.
1. **Should the floating/draggable admin iframe be implemented in Stage 4?** This is an optional UI enhancement mentioned in the architecture. It can be deferred to a separate task after migration is complete.

-----

*This document was created as a migration technical specification for the Fractera AI Workspace project. Implement stages sequentially. Do not skip verification steps.*