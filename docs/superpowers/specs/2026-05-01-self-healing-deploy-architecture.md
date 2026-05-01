# Self-Healing Deploy Architecture (POST-MVP)

> **Status:** Specification only — DO NOT implement until install MVP is fully working with SSL.
> **Reason:** This is the core value of Fractera. Must be designed carefully, not bolted on.

---

## What Fractera does

Fractera is an **online coding platform**. The user talks to Claude Code (or other AI platforms) inside the browser. Claude Code:

1. Generates new code (new pages, components, API routes)
2. Installs new dependencies (`npm install something`)
3. Modifies existing code
4. Pushes the result to the running server

After each push, the server **must auto-deploy** the new code. Two scenarios:

- **Happy path:** new code builds, services restart, user sees the site updated in real time
- **Failure path:** new code breaks (syntax error, dep conflict, runtime crash) → platform must stay alive so the user can keep coding and fix the bug

## Architectural constraint — parallel routes

Fractera uses Next.js parallel routes:

```
app/
  layout.tsx        ← imports children, appSlot, codeWorkspaceSlot
  @appSlot/         ← user's app — what AI is editing
  @codeWorkspaceSlot/  ← Claude Code chat UI — must stay alive even if @appSlot breaks
```

**Key insight:** Claude Code lives in `@codeWorkspaceSlot`. It is the **lifeline** — if user's edits break their app, they must still be able to talk to Claude Code to fix it.

But `@codeWorkspaceSlot` and `@appSlot` are rendered in the same Next.js process. If `@appSlot` has a syntax error, the build fails entirely — **both slots die**.

## Required guarantees

1. **`@codeWorkspaceSlot` must always work.** Even if `@appSlot` is broken, the user must be able to open the workspace and talk to Claude Code.

2. **Bridge service is the lifeline.** The Bridge is a separate Node.js process (`bridges/platforms/server.js`) that runs Claude Code via PTY. As long as Bridge is up, the workspace works.

3. **Auto-rollback on failed deploys.** If a new version of `@appSlot` fails to build or fails health check after start, the server must:
   - Roll back to the previous working version
   - Notify the user via the Bridge that the deploy failed
   - Keep the workspace alive so they can fix it

4. **Fallback for Bridge itself.** Even the Bridge process can crash. Need a "minimal recovery slot" — a static HTML page hosted independently (maybe on Vercel, or a separate Bridge process) that lets the user reset everything if everything else dies.

## Proposed architecture (sketch — needs detailed design)

### Layer 1 — User's app (`@appSlot`)

- Lives in `/opt/fractera-current` (symlink to active version)
- PM2 service: `fractera-app`
- Receives traffic from Nginx port 3000
- **Volatile** — gets rebuilt on every deploy, may break

### Layer 2 — Code workspace (`@codeWorkspaceSlot`)

- Same Next.js process as @appSlot — they share `next start`
- **Problem:** if app code breaks, workspace dies too
- **Solution options:**
  - **Option A:** separate Next.js process for workspace on different port (e.g. 3001), Bridge proxies to it
  - **Option B:** workspace lives in a frame that loads from a separate static fallback if main app is down
  - **Option C:** parallel route stays in main app, but Claude Code chat history persists in Bridge → user can reconnect via Bridge UI directly

### Layer 3 — Bridge (lifeline, separate process)

- PM2 service: `fractera-bridge` on port 3300
- Runs Claude Code/Codex/Gemini PTYs
- **Must survive deploys** — never restarts during user's app deploys
- Has its own minimal HTTP UI as fallback (Bridge can serve a static HTML page if everything else is down)

### Layer 4 — Deployment manager (NEW — needs to be built)

- A separate small service that:
  - Watches `/opt/fractera-staging` for new code
  - Runs `npm install` and `npm run build` in staging
  - On success: atomically swaps symlink `/opt/fractera-current` → `staging`, reloads PM2
  - On failure: keeps current version, posts error to Bridge channel
  - On health check failure after swap: rolls back symlink to previous version, reloads PM2
  - Maintains last 5 versions for rollback
- PM2 service: `fractera-deployer` on internal port

### Layer 5 — Recovery (last resort)

- Static HTML page hosted on `recovery.fractera.ai` (our Vercel)
- Shows: server IP, login form, "Reset to last known good version" button
- Connects to Bridge via WebSocket if Bridge is up
- Falls back to "contact support" if even Bridge is down

## Deployment flow (what user experiences)

1. User asks Claude Code: "add a new page /about"
2. Claude Code edits files in `/opt/fractera-staging`
3. Claude Code runs `npm install` if needed (in staging)
4. Claude Code calls `fractera-deployer.deploy()` API
5. Deployer:
   - Builds staging
   - If build OK: swaps symlink, reloads `fractera-app`
   - Health check on new version (ping `/api/health`)
   - If health OK: success, notify user
   - If health fails: rollback, notify user
6. User sees toast in Bridge UI: "Deploy successful" or "Deploy failed: <error>, rolled back"
7. User keeps coding either way

## Health checks

- `/api/health` on user's app — returns 200 if app is functioning
- `/bridge/health` on Bridge — returns 200 if Bridge can spawn PTYs
- `/deployer/health` on Deployer — returns 200 if deployer can read filesystem

## Open questions (to discuss before implementation)

1. **Staging build time:** `npm install` + `next build` = 3-5 min. Is that acceptable as deploy delay? Or do we need incremental builds?
2. **Disk space:** keeping 5 versions × 1.3GB = ~7GB. Need to budget VPS storage.
3. **Database migrations:** if Claude Code adds a SQLite migration that fails, how do we roll back schema?
4. **Bridge survives deploys?** Need to verify — currently `pm2 start` for bridge happens once. If user deploys 100 times, Bridge stays up.
5. **What if Claude Code itself breaks?** Bridge runs Claude Code as a subprocess. If Anthropic releases a broken version of Claude Code CLI, our system can't help. Need to pin Claude Code version.

## Why this is POST-MVP

To do this right we need:
- Working install pipeline (current MVP)
- Working SSL + auto-renewal
- A reliable test environment (multiple test domains we can break and restore)
- A test suite that verifies recovery actually works
- Decision on parallel-process vs single-process architecture

Estimate: 2-3 weeks of focused work after install MVP is solid.

## Acceptance criteria for this feature (when we build it)

- [ ] User can break their app on purpose and `@codeWorkspaceSlot` still loads
- [ ] Auto-rollback kicks in within 60 seconds if new deploy fails health check
- [ ] User receives toast notification of deploy result
- [ ] Bridge survives 100 consecutive deploys without restart
- [ ] Recovery page on Vercel works even if VPS is completely down
- [ ] Last 5 versions retained, manual rollback to any of them via Bridge UI
