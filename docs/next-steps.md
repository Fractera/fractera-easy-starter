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

## Next step: install AI platforms in bootstrap

### Problem
Bridge server (`bridges/platforms`) starts correctly and listens on all WebSocket ports (3200–3206). But when a user tries to start a Claude Code session, bridge cannot find the `claude` binary:
```
/bin/sh: 1: /root/.local/bin/claude: not found
```
No AI platform binaries are installed on the server after bootstrap.

### Required: add platform installation to bootstrap.sh

**Claude Code** (minimum viable — enables the main flow):
```bash
# Install Node.js-based Claude Code CLI
npm install -g @anthropic-ai/claude-code
# Verify
claude --version
```

Claude Code requires authentication after install. This is the hard part — it needs a browser login flow. Options:
1. Show user a one-time auth URL in the UI after install
2. Use `claude auth login --print-url` if available
3. Bridge handles auth via PTY (already implemented in bridge spec)

**Other platforms** (lower priority, add one by one):
- Codex: `npm install -g @openai/codex`
- Gemini CLI: `npm install -g @google/gemini-cli`
- Qwen, Kimi, OpenCode: TBD

### Bridge auth flow (already specced)
See: `docs/superpowers/specs/2026-05-01-self-healing-deploy-architecture.md`
The bridge runs Claude Code via PTY and can surface the auth URL to the user through the existing Bridge PTY connection. This is the cleanest path — no SSH needed from the user side.

---

## Known issues to watch

1. **NEXT_PUBLIC_MEDIA_URL on reinstall** — if Danger Zone is used and server reinstalled, the new subdomain must be written to `.env.local` AND `npm run build` must re-run. Bootstrap does this correctly now, but verify after each reinstall.

2. **pm2 cwd** — all three services (app, bridge, media) must be started with `cd /opt/fractera/<service> && pm2 start npm --name <name> -- run start`. Using `--prefix` does not work for pm2.

3. **Cloudflare DNS cleanup** — if Danger Zone Cloudflare call fails silently, old DNS record stays. Not critical (points to dead server) but accumulates over time.
