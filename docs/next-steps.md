# Fractera Easy Starter — Next Steps

## What works (confirmed on real server)

### Auth
- NextAuth (Auth.js v5) works in production
- Required: `AUTH_SECRET` + `AUTH_TRUST_HOST=true` in `.env.local`
- `AUTH_SECRET` is generated once at `/etc/fractera/secrets.env` — never regenerated on reinstall

### Media service (`services/media`)
- Express server on port 3300, SQLite DB, file storage
- **Root cause of past failures:** nginx was stripping `/media/` prefix
  - Wrong: `proxy_pass http://127.0.0.1:3300/` → Express received `GET /` → 404
  - Fixed: `proxy_pass http://127.0.0.1:3300/media/` → Express receives `GET /media` → 200
- `NEXT_PUBLIC_MEDIA_URL` is baked into the Next.js bundle at **build time** — changing `.env.local` and restarting pm2 is NOT enough, requires `npm run build`
- Bootstrap order: write `.env.local` → `next build` → start services → after domain registration update `.env.local` with real subdomain → `pm2 restart fractera-app`
- pm2 must `cd` into the service directory before start — `--prefix` flag does not set pm2's cwd

### Nginx routing (confirmed working)
```nginx
location /media/  → proxy_pass http://127.0.0.1:3300/media/
location /bridge/ → proxy_pass http://127.0.0.1:3201/bridge/
location /        → proxy_pass http://127.0.0.1:3000
```

### Bootstrap pipeline
- Idempotent: re-running on same server reuses existing `AUTH_SECRET`
- All steps report progress to Redis (Upstash), UI polls every 3s
- Cloudflare DNS record created automatically, deleted on Danger Zone destroy
- Let's Encrypt SSL via certbot with auto-renewal

### UI (fractera-easy-starter on Vercel)
- Install form → progress tracker → DomainStatus → PlatformSelector → ClaudeCodeSetup
- Danger Zone: SSH to server + delete Cloudflare DNS + clear localStorage
- Error state (install started, no domain): shows PlatformSelector immediately
- Success state: shows MCP section + PlatformSelector (Claude Code card opens ClaudeCodeSetup)

---

## Next step: platform selection in UI + install in bootstrap

### Problem
Bridge server (`bridges/platforms`) starts correctly and listens on all WebSocket ports (3200–3206). But when a user tries to start a session, bridge cannot find any platform binary:
```
/bin/sh: 1: /root/.local/bin/claude: not found
```
No AI platform binaries are installed on the server after bootstrap.

### UI change: platform selector in install-form

After the three server inputs (IP, login, password), show a platform selector — radio/single-select cards. The "Install Fractera" button is only active when a platform is selected. Selected platform is passed to `/api/install` → bootstrap.sh as a parameter.

**5 cards (Codex excluded — desktop only, no Linux server install):**

| Card | ID |
|---|---|
| Claude Code | `claude-code` |
| Gemini CLI | `gemini` |
| Qwen Code | `qwen` |
| Kimi Code | `kimi` |
| Open Code | `open-code` |

### Bootstrap change: new step `install_platform`

Add after `deps_media`, before `prepare_secrets`. Receives platform ID as `$3` argument.

**Install commands (Linux, confirmed from official docs):**

```bash
# Claude Code
curl -fsSL https://claude.ai/install.sh | bash
# binary lands at: /root/.local/bin/claude

# Gemini CLI
npm install -g @google/gemini-cli
# binary: gemini

# Qwen Code
npm install -g @qwen-code/qwen-code@latest
# binary: qwen

# Kimi Code
curl -LsSf https://code.kimi.com/install.sh | bash
# binary: kimi

# Open Code
npm install -g opencode-ai
# binary: opencode
```

**Codex** — desktop app only (macOS/Windows), no Linux CLI install available. Excluded from server install.

### Auth after install

Each platform requires authentication after install. Claude Code is the only one with a browser-based OAuth flow via PTY bridge (already specced). Others require API keys set as env vars. Auth flow is a separate task — install is the first step.

### Bridge auth flow (already specced)
See: `docs/superpowers/specs/2026-05-01-self-healing-deploy-architecture.md`
Bridge runs the platform via PTY and surfaces the auth URL through the existing WebSocket connection. No SSH needed from the user side.

---

## Known issues to watch

1. **NEXT_PUBLIC_MEDIA_URL on reinstall** — if Danger Zone is used and server reinstalled, the new subdomain must be written to `.env.local` AND `npm run build` must re-run. Bootstrap does this correctly now, but verify after each reinstall.

2. **pm2 cwd** — all three services (app, bridge, media) must be started with `cd /opt/fractera/<service> && pm2 start npm --name <name> -- run start`. Using `--prefix` does not work for pm2.

3. **Cloudflare DNS cleanup** — if Danger Zone Cloudflare call fails silently, old DNS record stays. Not critical (points to dead server) but accumulates over time.
