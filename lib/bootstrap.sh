#!/bin/bash
# Fractera Bootstrap Agent
# Reports progress + errors back to fractera-easy-starter.

SESSION_ID="$1"
PROGRESS_URL="https://www.fractera.ai/api/progress"
PING_URL="https://www.fractera.ai/api/server/ping"
INSTALL_SECRET="$2"
PLATFORM="${3:-}"  # step 500: coding agents removed; accepted for back-compat, ignored
SERVER_TOKEN="${4:-}"
SUBDOMAIN_OVERRIDE="${5:-}"  # accepted for back-compat with old deploy.ts callers; ignored
GITHUB_TOKEN="${6:-}"
SERVER_ID="${7:-}"  # ServerToken.id — non-secret, baked as NEXT_PUBLIC_SERVER_ID for marketplace links
COMPONENTS="${8:-}" # selective install (S1). "" or "all" => install everything (default,
                    # byte-identical to pre-selection deploys); "none" => CORE only; otherwise a
                    # csv subset of: memory
                    # (step 500 — the five coding agents and Hermes/brain are no longer installed;
                    #  their ids are accepted and silently ignored for back-compat with old callers)
LOG_FILE="/tmp/fractera-install-$SESSION_ID.log"

CURRENT_STEP=""
CURRENT_LABEL=""
INSTALL_START=$(date +%s)
# DEBUG — remove before launch
LOG_URL="https://www.fractera.ai/api/server/install-log"

log_email() {
  [ -z "$SERVER_TOKEN" ] && return
  local step="$1" label="$2" percent="$3"
  local elapsed=$(( $(date +%s) - INSTALL_START ))
  local elapsed_str="${elapsed}s"
  curl -s -X POST "$LOG_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SERVER_TOKEN" \
    -d "{\"step\":\"$step\",\"label\":\"$label\",\"percent\":$percent,\"elapsed\":\"$elapsed_str\"}" \
    > /dev/null 2>&1 &
}

# Send a step update (start or finish) — retries 3x so a transient Vercel hiccup doesn't lose progress
report() {
  local id="$1"
  local label="$2"
  local done="$3"
  local _payload="{\"session_id\":\"$SESSION_ID\",\"step\":{\"id\":\"$id\",\"label\":\"$label\",\"done\":$done,\"ts\":$(date +%s000)}}"
  local _attempt _code
  for _attempt in 1 2 3; do
    _code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "$PROGRESS_URL" \
      -H "Content-Type: application/json" \
      -H "x-install-secret: $INSTALL_SECRET" \
      -d "$_payload" 2>/dev/null)
    [ "$_code" = "200" ] && return 0
    [ "$_attempt" -lt 3 ] && sleep 5
  done
  return 0
}

# Send error and exit. --max-time is critical here: without it, a slow or
# unreachable Vercel function leaves bash blocked inside curl for the
# default ~75s connect timeout, and during that block the UI just keeps
# showing the last-known % with no error overlay. With --max-time the
# error post is bounded — if Vercel doesn't respond, we still exit
# promptly and the UI's poller eventually times out the session.
fail() {
  local message="$1"
  local last_log=$(tail -c 800 "$LOG_FILE" 2>/dev/null | tr '"' "'" | tr '\n' ' ' | head -c 700)
  curl -s --max-time 30 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "{\"session_id\":\"$SESSION_ID\",\"error\":\"Step '$CURRENT_LABEL' failed: $message. Last log: $last_log\"}" \
    > /dev/null 2>&1 || true
  exit 1
}

# Run a step. Args: id, label, command. Body runs in a subshell —
# see the comment on soft_step() below for the full reasoning.
step() {
  CURRENT_STEP="$1"
  CURRENT_LABEL="$2"
  local cmd="$3"
  report "$CURRENT_STEP" "$CURRENT_LABEL" false
  ( eval "$cmd" ) >> "$LOG_FILE" 2>&1
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    fail "command failed (exit $rc)"
  fi
  report "$CURRENT_STEP" "$CURRENT_LABEL" true
}

# npm-aware step: retries once on transient races (ENOTEMPTY, EACCES,
# EBUSY) that occasionally happen when npm rmdir's a directory while
# another worker still holds files inside. On retry we nuke node_modules
# and start fresh so half-extracted packages don't confuse npm.
step_npm() {
  CURRENT_STEP="$1"
  CURRENT_LABEL="$2"
  local cmd="$3"
  local prefix="$4"  # path passed to npm --prefix, or empty for root
  report "$CURRENT_STEP" "$CURRENT_LABEL" false
  for attempt in 1 2; do
    # Subshell — see comment on soft_step() below.
    ( eval "$cmd" ) >> "$LOG_FILE" 2>&1
    local rc=$?
    if [ "$rc" -eq 0 ]; then
      report "$CURRENT_STEP" "$CURRENT_LABEL" true
      return 0
    fi
    if [ "$attempt" -lt 2 ] && grep -qE 'ENOTEMPTY|EACCES|EBUSY' "$LOG_FILE"; then
      echo "  ⚠ npm transient race detected — wiping node_modules and retrying" >> "$LOG_FILE"
      if [ -n "$prefix" ]; then
        rm -rf "$prefix/node_modules" "$prefix/package-lock.json" 2>/dev/null || true
      else
        rm -rf node_modules package-lock.json 2>/dev/null || true
      fi
      continue
    fi
    fail "command failed (exit $rc)"
  done
}

# soft_step: like step() but NEVER fatal — a failing body is logged and skipped.
# Body runs in a SUBSHELL via `( eval ... )` so cd/exit/set -e/IFS can't leak into
# later steps (two past incidents froze bootstrap at 57%/77% before the subshell).
# DEFINED HERE (not lower) on purpose: dns_resolver + firewall_open call soft_step
# early. A call before the function is defined is a silent `command not found`
# (no `set -e`), so those steps never ran — that is exactly how the secure-mode
# ufw lockdown kept leaking into every IP redeploy. Keep this above first use.
soft_step() {
  local id="$1"
  local label="$2"
  local cmd="$3"
  report "$id" "Installing $label" false
  if ( eval "$cmd" ) >> "$LOG_FILE" 2>&1; then
    report "$id" "$label" true
  else
    echo "[skip] $label installation failed, continuing" >> "$LOG_FILE"
    report "$id" "$label (skipped)" true
  fi
}

# === Selective install (S1) ===
# should_install <component-id>: true if this component is in the requested set.
# COMPONENTS (arg $8): "" or "all" => everything (default); "none" => CORE only;
# else a csv subset. DEFINED HERE (above first use, near soft_step) on purpose —
# a call before definition is a silent `command not found` with no `set -e`
# (exactly how the ufw-lockdown leak survived; see soft-step-defined-after-use).
should_install() {
  local id="$1"
  case "$COMPONENTS" in
    ""|all) return 0 ;;
    none)   return 1 ;;
    *) case ",$COMPONENTS," in *",$id,"*) return 0 ;; *) return 1 ;; esac ;;
  esac
}

# maybe_step <component-id> <step-id> <label> <cmd>: run soft_step only if the
# component is selected; otherwise emit a "(skipped)" progress report so the
# install UI greys the line out (it keys off the "(skipped)" suffix) instead of
# leaving it stuck as pending.
maybe_step() {
  local comp="$1" id="$2" label="$3" cmd="$4"
  if should_install "$comp"; then
    soft_step "$id" "$label" "$cmd"
  else
    echo "[skip] $label — component '$comp' not selected" >> "$LOG_FILE"
    report "$id" "$label (skipped)" true
  fi
}

echo "=== Fractera bootstrap started: $(date) ===" > "$LOG_FILE"

step "apt_update"   "Updating system"         "rm -f /etc/apt/sources.list.d/nodesource.list /usr/share/keyrings/nodesource.gpg /etc/apt/keyrings/nodesource.gpg 2>/dev/null; apt-get update -qq"
step "apt_install"  "Installing base tools"   "apt-get install -y -qq git curl nginx build-essential dnsutils zsh bubblewrap certbot python3-certbot-nginx ffmpeg"
# Node 22 LTS (was 20 until 2026-08-02). Hermes' own monorepo lock carries
# @electron/rebuild@4.2.0 — a DESKTOP-app dependency requiring node>=22.12.0 — and its
# Node 22 is LTS; all our services are built and verified on it. (The original
# reason for pinning 22 — an engine-strict build loop in the removed Hermes
# dashboard — is gone, but 22 stays: it is what everything is tested against.)
step "node_repo"    "Adding Node.js repository" "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
step "node_install" "Installing Node.js 22"   "apt-get install -y nodejs"
step "pm2"             "Installing PM2 process manager" "npm install -g pm2"
log_email "pm2" "Node.js + PM2 installed" 10

# === Reliable DNS resolver ===
# Some VPS providers (e.g. Contabo) ship a default resolver that intermittently
# returns NXDOMAIN for freshly-created customer A-records (a customer adds the
# domain's records, the provider resolver still fails to resolve e.g. the www
# host). That breaks certbot during the Personal Domain wizard Step 2, which
# validates all 7 hostnames. Pin systemd-resolved to public resolvers so DNS is
# dependable. Best-effort: never fail the deploy over this.
soft_step "dns_resolver" "Configuring DNS resolver" "mkdir -p /etc/systemd/resolved.conf.d && printf '[Resolve]\nDNS=1.1.1.1 8.8.8.8\nFallbackDNS=9.9.9.9 1.0.0.1\n' > /etc/systemd/resolved.conf.d/fractera-dns.conf && systemctl restart systemd-resolved && sleep 1 && resolvectl flush-caches"

# === Firewall: open for IP mode ===
# Bootstrap always yields IP/insecure mode, where the service ports (3000-3002,
# 3300) MUST be reachable. A genuinely fresh VPS has ufw
# inactive, but a RE-bootstrap of a server that was once in Secure mode inherits
# its lockdown (ufw 22/80/443 only) — wipe doesn't reset it — so the admin port
# would silently time out from outside. Disable ufw here so every deploy/redeploy/
# recovery comes up reachable. Secure mode re-locks via lockdownFirewall() on
# domain activation; deactivate re-opens. No-op on a fresh VPS.
# → reports/patterns/mode-aware-firewall.md
soft_step "firewall_open" "Opening firewall for IP mode" "command -v ufw >/dev/null 2>&1 && { ufw --force reset >/dev/null 2>&1; ufw --force disable; } || true"

# (step 500) The "clear previous platform credentials" step is gone together with the
# five coding agents — there are no agent credential directories to clear any more.

# === SERVER IP detection ===
SERVER_IP=$(curl -s --max-time 10 https://api.ipify.org || curl -s --max-time 10 ifconfig.me || hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
  fail "could not detect server IP"
fi

# IP-only deploy: no fractera.ai DNS registration. Customer attaches their
# own domain later via the admin panel. SUBDOMAIN is the IP itself (used
# as a synthetic identifier in logs and pings).
SUBDOMAIN="$SERVER_IP"
BASE="ip-$SERVER_IP"
CURRENT_STEP="register"
CURRENT_LABEL="Detecting server IP"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

if [ -n "$GITHUB_TOKEN" ]; then
  CLONE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/Fractera/Agent-Engineering-Infrastructure.git"
else
  CLONE_URL="https://github.com/Fractera/Agent-Engineering-Infrastructure.git"
fi
step "clone" "Downloading Fractera" \
  "rm -rf /opt/fractera && git clone $CLONE_URL /opt/fractera"

cd /opt/fractera || fail "Cannot cd to /opt/fractera"

# SECURITY: clean remote URL — do NOT store the GitHub token in .git/config
# (any user with SSH access could read it and push to our repo).
# Auto-updates that need to pull must provide credentials at command time.
git remote set-url origin "https://github.com/Fractera/Agent-Engineering-Infrastructure.git"

# Record deployed commit and branch for verification
DEPLOYED_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
DEPLOYED_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "$DEPLOYED_COMMIT" > /opt/fractera/DEPLOYED_COMMIT
echo "$DEPLOYED_BRANCH" > /opt/fractera/DEPLOYED_BRANCH
echo "=== DEPLOYED: branch=$DEPLOYED_BRANCH commit=$DEPLOYED_COMMIT ===" >> "$LOG_FILE"

# === App slot materialization (pivot 2026-06-16) ===========================
# /opt/fractera/app is a SWAPPABLE slot. By default it stays as the app/ that
# shipped in the ai-workspace clone above (our reference project) — so the default
# deploy is byte-identical to pre-pivot behaviour. When the install form requests a
# different project we replace the slot HERE — after the clone, BEFORE deps_app /
# build_app / start_app below — so the existing `--prefix app` machinery builds and
# starts the guest transparently. Inputs (set by deploy.ts; unset => default):
#   FRACTERA_APP_FRAMEWORK : fractera-pro | next | own-repo | <preset id>  (label only)
#   FRACTERA_APP_REPO_URL  : public git URL to clone into the slot, already RESOLVED by
#                            the FES install route (preset -> its catalog repo; own-repo
#                            -> the user's URL; fractera-pro -> empty = keep reference app)
# FIRST CUT = CONTRACT B ONLY: a long-lived Node process on :3000, exactly like
# Next (`npm run build` + `npm start`) — covers Next / Nuxt / Remix / SvelteKit-node
# and any Node guest repo. CONTRACT A (static-folder projects served by a file
# server) is deferred — see next-step Ф3.2.
APP_SLOT_FRAMEWORK="${FRACTERA_APP_FRAMEWORK:-fractera-pro}"
APP_SLOT_REPO_URL="${FRACTERA_APP_REPO_URL:-}"
APP_SLOT_CONTRACT="B"
if [ -n "$APP_SLOT_REPO_URL" ]; then
  # A repo URL is present (resolved by the FES install route: preset -> its catalog
  # repo; own-repo -> the user's URL). Clone it into the slot.
  echo "=== App slot: cloning '$APP_SLOT_FRAMEWORK' from $APP_SLOT_REPO_URL ===" >> "$LOG_FILE"
  rm -rf /opt/fractera/app
  git clone --depth 1 "$APP_SLOT_REPO_URL" /opt/fractera/app >> "$LOG_FILE" 2>&1 \
    || fail "Cannot clone slot repository: $APP_SLOT_REPO_URL"
  # Contract-B guard: the guest must be a Node app with build+start scripts and serve
  # :3000 on 'npm start'. If it is a static-only project (no start script) we stop with
  # a clear message rather than half-deploy - contract A lands later.
  [ -f /opt/fractera/app/package.json ] \
    || fail "Slot repo has no package.json - not a supported Node project yet"
  grep -q '"start"' /opt/fractera/app/package.json \
    || fail "Slot repo has no start script - only Next-like Node projects (contract B) are supported in this release; static projects (React/Vue/etc.) are coming soon"
  # The clone above is shallow (--depth 1) for speed, and a shallow repository CANNOT be
  # pushed: git sends a thin pack based on the truncated parent and the remote answers
  # "did not receive expected object ... index-pack failed". The slot pushes and pulls
  # against the USER's own repository, never against the starter, so the starter history
  # is dead weight here. Replace it with a fresh repository holding the cloned tree -
  # done now, before npm install, so node_modules cannot land in the baseline commit.
  if [ ! -f /opt/fractera/app/.gitignore ]; then
    printf '%s\n' 'node_modules/' '.next/' 'out/' '.env.local' '.env*.local' 'storage/' \
      'data/*.sqlite' 'data/*.sqlite-shm' 'data/*.sqlite-wal' > /opt/fractera/app/.gitignore
  fi
  rm -rf /opt/fractera/app/.git
  git -C /opt/fractera/app init -q >> "$LOG_FILE" 2>&1
  git -C /opt/fractera/app symbolic-ref HEAD refs/heads/main >> "$LOG_FILE" 2>&1
  # app/.gitkeep belongs to the substrate - it is how ai-workspace keeps the empty slot
  # directory in its own history, and any checkout there puts it back. It is not part of
  # the user's project, so exclude it locally instead of editing the guest's .gitignore.
  echo '/.gitkeep' >> /opt/fractera/app/.git/info/exclude
  git -C /opt/fractera/app add -A >> "$LOG_FILE" 2>&1
  git -C /opt/fractera/app -c user.email="admin@fractera.ai" -c user.name="Fractera Admin" \
    commit -q -m "Fractera slot: $APP_SLOT_FRAMEWORK baseline" >> "$LOG_FILE" 2>&1
  echo "=== App slot: detached from starter history, own repository initialised ===" >> "$LOG_FILE"
  # TODO (Ф3.2, developer E2E): some Node frameworks need PORT=3000 explicitly, and the
  # native-modules install below (lightningcss/tailwind-oxide) is tuned for our Next app.
else
  # No repo URL -> keep the app/ from the ai-workspace clone (default reference app,
  # e.g. temporary fractera-pro). No-op -> default deploy unchanged.
  echo "=== App slot: keeping default reference app (framework=$APP_SLOT_FRAMEWORK) ===" >> "$LOG_FILE"
fi
# Record the resolved slot so the admin panel / activation skill knows the stack.
cat > /opt/fractera/app-slot.json <<SLOTEOF
{"framework":"$APP_SLOT_FRAMEWORK","contract":"$APP_SLOT_CONTRACT","repoUrl":"$APP_SLOT_REPO_URL"}
SLOTEOF

# Record the resolved component selection as a JSON array. The deployed admin
# reads this (S5: GET /api/config/components) to show only the chosen tools in
# the carousel / settings. Missing file on old servers => admin shows all.
CURRENT_STEP="components_manifest"
CURRENT_LABEL="Recording component selection"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
{
  printf '['
  _first=1
  for _c in memory; do
    if should_install "$_c"; then
      [ "$_first" -eq 1 ] && _first=0 || printf ','
      printf '"%s"' "$_c"
    fi
  done
  printf ']\n'
} > /opt/fractera/installed-components.json
echo "=== COMPONENTS: $(cat /opt/fractera/installed-components.json) (arg='$COMPONENTS') ===" >> "$LOG_FILE"
report "$CURRENT_STEP" "$CURRENT_LABEL" true


# ── AGENTIC RAG (LightRAG) — the graph half of knowledge: it extracts entities and
#    relations at ingest, so questions that span many documents are answered from a
#    precomputed graph instead of re-reading everything. (step 500) ALWAYS installed,
#    like the vector store and object storage — a storage primitive, not an optional
#    component. The architect turns it on or off in Admin, the installer always puts
#    it there. Soft steps: a RAG failure never blocks the rest of the boot.
soft_step "install_lightrag" "LightRAG"    "{ command -v \"\$HOME/.local/bin/uv\" >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh; }; export PATH=\"\$HOME/.local/bin:\$PATH\" && \$HOME/.local/bin/uv tool install 'lightrag-hku[api] @ git+https://github.com/HKUDS/LightRAG.git@v1.4.16' || true"
# (step 500) LightRAG's own React WebUI is NOT built. Building it was the longest
#    step of the whole install (bun install + bun run build inside a Python package),
#    and nothing opens it: the Admin panel talks to LightRAG through our own server
#    routes, so the browser never reaches :9621. That is also why :9621 needs no
#    subdomain and no certificate host. If the native graph explorer is ever wanted,
#    the build, the subdomain and an iframe come back together as one piece.

step_npm "deps_root"   "Installing dependencies (1/5)" "npm install" ""
step_npm "deps_app"    "Installing dependencies (2/5)" "npm install --prefix app" "app"

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

step_npm "deps_auth"        "Installing dependencies (3/5)" \
  "npm install --prefix services/auth && npm rebuild better-sqlite3 --prefix services/auth" "services/auth"
step_npm "deps_bridges_app" "Installing dependencies (4/5)" \
  "npm install --prefix bridges/app && npm rebuild better-sqlite3 --prefix bridges/app" "bridges/app"
step_npm "deps_data"        "Installing dependencies (5/5)" \
  "npm install --prefix services/data && npm rebuild better-sqlite3 --prefix services/data && npm rebuild sharp --prefix services/data" "services/data"

log_email "deps_data" "All dependencies installed" 30

# === Install AI platform binaries (soft — each failure is skipped, not fatal) ===
# soft_step() is defined near step()/step_npm() above (it must precede its first
# callers dns_resolver + firewall_open). Do NOT redefine it here.
# (step 500) Hermes Agent removed — the installer, its dashboard UI build, plugins, skills,
# SOUL.md persona, dashboard theme and protected docs dir are no longer installed.

# === Prepare secrets (idempotent — never overwrite existing AUTH_SECRET) ===
CURRENT_STEP="prepare_secrets"
CURRENT_LABEL="Generating security keys"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
mkdir -p /etc/fractera
SECRETS_FILE="/etc/fractera/secrets.env"
if [ ! -f "$SECRETS_FILE" ] || ! grep -q "AUTH_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  NEW_SECRET=$(openssl rand -base64 32)
  echo "AUTH_SECRET=$NEW_SECRET" > "$SECRETS_FILE"
fi
if ! grep -q "DEPLOY_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  echo "DEPLOY_SECRET=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
if ! grep -q "DATA_SECRET=" "$SECRETS_FILE" 2>/dev/null; then
  echo "DATA_SECRET=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
if ! grep -q "LIGHTRAG_API_KEY=" "$SECRETS_FILE" 2>/dev/null; then
  echo "LIGHTRAG_API_KEY=$(openssl rand -hex 32)" >> "$SECRETS_FILE"
fi
chmod 600 "$SECRETS_FILE"
source "$SECRETS_FILE"
mkdir -p /opt/fractera/services/rag/storage
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Initial .env.local files (before build, without real subdomain) ===
CURRENT_STEP="prepare_env"
CURRENT_LABEL="Writing environment configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
source /etc/fractera/secrets.env

# IP-mode CORS: include cross-port origins so http://IP:3000 can call auth on :3001.
IP_ORIGINS=",http://$SERVER_IP:3000,http://$SERVER_IP:3001,http://$SERVER_IP:3002,http://$SERVER_IP:3003,http://$SERVER_IP:3004,http://$SERVER_IP:3300"

# Languages are owner-editable AFTER deploy (Admin → languages and the app-settings MCP write
# NEXT_PUBLIC_SUPPORTED_LANGUAGES into THIS file, then trigger a rebuild — step 138). Preserve an
# existing set on a re-bootstrap so a redeploy does NOT reset the owner's languages back to bilingual.
# Default to en,es only on a fresh slot (no prior .env.local). Captured BEFORE the heredoc truncates it.
EXISTING_LANGS="$(grep -E '^NEXT_PUBLIC_SUPPORTED_LANGUAGES=' /opt/fractera/app/.env.local 2>/dev/null | head -1 | cut -d= -f2-)"
EXISTING_LOCALE="$(grep -E '^NEXT_PUBLIC_DEFAULT_LOCALE=' /opt/fractera/app/.env.local 2>/dev/null | head -1 | cut -d= -f2-)"
# Public app-shell auth (header login → cockpit) — preserved across re-bootstrap; a fresh slot
# ships it ON (account drawer from the right), matching the platform's showcase-with-login default.
EXISTING_AUTH="$(grep -E '^NEXT_PUBLIC_APP_SHELL_AUTH=' /opt/fractera/app/.env.local 2>/dev/null | head -1 | cut -d= -f2-)"
# Fresh slot ships the platform's ten admin-layer languages (en + the nine others) so the showcase
# is multilingual out of the box; an owner's edited set is preserved on re-bootstrap.
SUPPORTED_LANGS="${EXISTING_LANGS:-en,es,fr,it,ru,de,pt,pl,tr,nl}"
DEFAULT_LOCALE_VAL="${EXISTING_LOCALE:-en}"
APP_SHELL_AUTH_VAL="${EXISTING_AUTH:-right}"

# 🔒 chmod 600 после КАЖДОГО файла с секретами (шаг 501, дефект найден замером 2026-08-09).
#    Здесь файлы СОЗДАЮТСЯ, и создаются они с обычной маской — то есть 644, читаемые
#    любым пользователем системы. Замер на живом сервере: так лежали ключ OpenAI, ключ
#    Resend, секрет Google, DATA_SECRET и DEPLOY_SECRET. Маршруты панели передавали
#    mode: 0o600 при записи и выглядели правильными, но этот параметр действует только
#    при создании файла — то есть никогда, потому что создавал их установщик.
#    Правильные права ставятся здесь, при рождении, и подтверждаются панелью при каждой
#    записи (hardenSecretFile).
cat > /opt/fractera/app/.env.local <<ENVEOF
AUTH_TRUST_HOST=true
NEXT_PUBLIC_AUTH_URL=
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_MEDIA_URL=http://localhost:3300
APP_DB_PATH=/opt/fractera/app/data/app.db
DEPLOY_SECRET=$DEPLOY_SECRET
# The Documents page (/documents) ingests knowledge-base files into Company
# Memory (LightRAG :9621) via /api/documents/ingest. It posts to LightRAG with
# this key (X-API-Key) — same key the admin app and the rag service use, so the
# public app authenticates instead of getting a 403. Generated at the secrets
# step above (openssl rand -hex 32), so it is always present and non-empty.
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
# Lets the Documents page report whether LightRAG has an OpenAI embedding key
# (read-only) so Activate can say "indexing will/won't finish" honestly.
RAG_ENV_PATH=/opt/fractera/services/rag/.env
# The data secret + URL: services that talk to the data layer (:3300) read them
# from THIS file. Server-side only, never NEXT_PUBLIC.
DATA_SECRET=$DATA_SECRET
REMOTE_DATA_URL=http://localhost:3300
# Deploy secret for the admin rebuild endpoint (POST :3002/api/deploy). Kept here
# as well as in the admin's own .env.local. Server-side only, never NEXT_PUBLIC.
DEPLOY_SECRET=$DEPLOY_SECRET
# IP-only deploy → open demo mode by default. Toggle via Admin → Security panel
# or recovery sed command in /opt/fractera/services/auth/.env.local.
FRACTERA_IP_NODOMAIN_MODE=true
# Multilingual content routing (the app slot reads these). Two or more languages
# → the /<lang> prefix is active and the language switcher button shows; a single
# language → pages serve from the bare root and the button hides. These are
# NEXT_PUBLIC_* (baked at build time), so a fresh slot ships with the platform's ten
# admin-layer languages and the switcher visible by default. Harmless for slots that do
# not use them. Preserved across re-bootstrap (see EXISTING_LANGS capture above): a redeploy
# keeps the owner's language set instead of resetting it to the default. → step 138.
NEXT_PUBLIC_SUPPORTED_LANGUAGES=$SUPPORTED_LANGS
NEXT_PUBLIC_DEFAULT_LOCALE=$DEFAULT_LOCALE_VAL
# Public app-shell auth: the header account/login control (guest → Sign in; architect/manager →
# account drawer with the link into the cockpit at :3003). Build-time (baked); a fresh slot ships
# it ON from the right. Owner flips it via Admin → App authorization (writes this key + rebuilds).
NEXT_PUBLIC_APP_SHELL_AUTH=$APP_SHELL_AUTH_VAL
ENVEOF
chmod 600 /opt/fractera/app/.env.local

cat > /opt/fractera/services/auth/.env.local <<ENVEOF
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true
COOKIE_DOMAIN=
COOKIE_SECURE=false
# IP-mode: NEXTAUTH_URL must point at the public host the browser uses,
# otherwise NextAuth sets callback URLs and CSRF origin to localhost and the
# browser refuses the redirect / drops the cookie. AUTH_TRUST_HOST=true makes
# NextAuth honour the X-Forwarded-Host/Host header on each request, so this
# value mainly seeds the default callbackUrl cookie.
NEXTAUTH_URL=http://$SERVER_IP:3001
DATABASE_URL=file:/opt/fractera/app/data/app.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002$IP_ORIGINS
FRACTERA_IP_NODOMAIN_MODE=true
# Optional sign-in methods — seeded EMPTY. The owner fills these from
# Admin -> Login methods only in secure mode (custom domain + HTTPS). While a
# value is empty its provider stays off and its button is hidden on /login.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
AUTH_RESEND_FROM=
ENVEOF
chmod 600 /opt/fractera/services/auth/.env.local

cat > /opt/fractera/bridges/app/.env.local <<ENVEOF
# Server-side only — admin proxy.ts calls auth on localhost.
AUTH_SERVICE_URL=http://localhost:3001
# Service URLs not needed here: bridges/app reads them at runtime via
# lib/runtime-urls.ts → window.location.hostname + service ports.
# NEXT_PUBLIC_SERVER_ID is the one baked client var (non-secret ServerToken.id)
# — used by the footer Skills / Product Loop marketplace links.
NEXT_PUBLIC_SERVER_ID=$SERVER_ID
DEPLOY_SECRET=$DEPLOY_SECRET
APP_DB_PATH=/opt/fractera/app/data/app.db
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_LLM_OPENAI_MODEL=gpt-4o-mini
RAG_ENV_PATH=/opt/fractera/services/rag/.env
# (step 500) The admin calls the data service SERVER-SIDE for the vector store —
# its status and its meaning-search. Those calls carry no browser cookie, so they
# authenticate with the shared service secret. Without this key every such call
# came back 401 and the panel silently reported "embeddings key: not set" even
# when the key was there. Must equal DATA_SECRET in services/data/.env.
DATA_SECRET=$DATA_SECRET
FRACTERA_IP_NODOMAIN_MODE=true
ENVEOF
chmod 600 /opt/fractera/bridges/app/.env.local

# (step 500) These two services read their configuration from a file at start,
# so the file has to exist BEFORE anything starts them. Writing it down here,
# in prepare_env, is not tidiness: the blocks used to sit after the start steps,
# where LightRAG came up with no storage path and no key.
mkdir -p /opt/fractera/services/channels
cat > /opt/fractera/services/channels/.env <<ENVEOF
PORT=3500
LIGHTRAG_URL=http://localhost:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
CHANNELS_CONFIG=/opt/fractera/services/channels/config.json
ENVEOF
chmod 600 /opt/fractera/services/channels/.env

cat > /opt/fractera/services/rag/.env <<ENVEOF
# IP-mode: bind to 0.0.0.0 so the Admin iframe (browser → http://IP:9621)
# can reach LightRAG. Healthchecks below still hit 127.0.0.1 (loopback works
# either way). When switching to Secure mode, gate this port via UFW or
# nginx auth_request.
HOST=0.0.0.0
PORT=9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
LIGHTRAG_KV_STORAGE=JsonKVStorage
LIGHTRAG_DOC_STATUS_STORAGE=JsonDocStatusStorage
LIGHTRAG_GRAPH_STORAGE=NetworkXStorage
LIGHTRAG_VECTOR_STORAGE=NanoVectorDBStorage
WORKING_DIR=/opt/fractera/services/rag/storage
LLM_BINDING=openai
LLM_BINDING_HOST=https://api.openai.com/v1
LLM_BINDING_API_KEY=
LLM_MODEL=gpt-4o-mini
EMBEDDING_BINDING=openai
EMBEDDING_BINDING_HOST=https://api.openai.com/v1
EMBEDDING_BINDING_API_KEY=
# 3-small chosen over 3-large: embeddings dominate Company Brain cost
# (every chunk gets embedded vs. one LLM call per chunk), and -small
# is ~7x cheaper with quality difference imperceptible for the typical
# partner workload. Dim must match the model: 1536 for -small, 3072
# for -large. Mismatched dim crashes LightRAG indexing.
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIM=1536
CORS_ORIGINS=http://localhost:3002
ENVEOF
chmod 600 /opt/fractera/services/rag/.env

# (step 500) The data service now holds the THIRD warehouse — vectors — next to
# rows and objects, in the same SQLite file. It embeds text itself, so it needs an
# OpenAI key; the owner pastes it in Admin → OpenAI settings, which writes THIS
# file and restarts the service. Shipped empty: without a key the vector doors
# answer with an honest error instead of pretending to index.
cat > /opt/fractera/services/data/.env <<ENVEOF
AUTH_SERVICE_URL=http://localhost:3001
DATA_PUBLIC_URL=http://localhost:3300
APP_DB_PATH=/opt/fractera/app/data/app.db
DATA_SECRET=$DATA_SECRET
OPENAI_API_KEY=
EMBED_MODEL=text-embedding-3-small
EMBED_DIMS=1536
FRACTERA_IP_NODOMAIN_MODE=true
ENVEOF
chmod 600 /opt/fractera/services/data/.env

# (step 500) Appended AFTER the file is written: the data service is the one
# published door, so it needs to know where the loopback services live in
# order to forward /service/rag, /service/geo and /service/channels to them.
cat >> /opt/fractera/services/data/.env <<ENVEOF
LIGHTRAG_URL=http://127.0.0.1:9621
LIGHTRAG_API_KEY=$LIGHTRAG_API_KEY
GEO_URL=http://127.0.0.1:3400
CHANNELS_URL=http://127.0.0.1:3500
ENVEOF


report "$CURRENT_STEP" "$CURRENT_LABEL" true

log_email "build_start" "Building services (this takes 5-10 min)" 40
step "build_app"         "Building shell (production)"   "npm run build --prefix app"
step "build_auth"        "Building auth (production)"    "npm run build --prefix services/auth"
# The admin panel bakes the platform commit it was built from. Without it the panel used to call itself
# "dev" on every deployed server - a word claiming it ran in a developer environment it can never be in.
# DEPLOYED_COMMIT is resolved above, right after the clone.
step "build_bridges_app" "Building admin (production)"   "NEXT_PUBLIC_GIT_COMMIT=$DEPLOYED_COMMIT npm run build --prefix bridges/app"

# The fallback the deploy route restores when a build fails. Seeded here so the very FIRST failed
# deploy already has something to fall back to - a failing `next build` deletes .next/BUILD_ID, and
# without a stored copy the app cannot be started again until some build succeeds. 33 MB, measured.
step "seed_last_good" "Storing the first good build" "rm -rf /opt/fractera/app/.next.last-good && cp -a /opt/fractera/app/.next /opt/fractera/app/.next.last-good && printf '%s\n' '/.next.last-good/' >> /opt/fractera/app/.git/info/exclude"

# Remove any previous services before starting fresh
pm2 delete all >> "$LOG_FILE" 2>&1 || true

step "start_app"    "Starting shell service"   "cd /opt/fractera/app && pm2 start npm --name fractera-app -- run start && cd /opt/fractera"
step "start_auth"   "Starting auth service"    "cd /opt/fractera/services/auth && pm2 start npm --name fractera-auth -- run start && cd /opt/fractera"
step "start_admin"  "Starting admin service"   "cd /opt/fractera/bridges/app && pm2 start npm --name fractera-admin -- run start && cd /opt/fractera"
step "start_data"   "Starting data service"    "cd /opt/fractera/services/data && pm2 start node --name fractera-data -- server.js && cd /opt/fractera"
step "start_channels" "Starting channels service" "cd /opt/fractera/services/channels && pm2 start node --name fractera-channels -- server.js && cd /opt/fractera"
soft_step "start_rag" "LightRAG service" "RAG_PY=\$HOME/.local/share/uv/tools/lightrag-hku/bin/python && RAG_BIN=\$HOME/.local/share/uv/tools/lightrag-hku/bin/lightrag-server && cd /opt/fractera/services/rag && pm2 start \$RAG_BIN --name fractera-rag --interpreter \$RAG_PY --cwd /opt/fractera/services/rag && cd /opt/fractera && for i in \$(seq 1 10); do curl -sf http://127.0.0.1:9621/health >> \"$LOG_FILE\" 2>&1 && break || sleep 3; done"

# ── GEO SUBSYSTEM — "the map brain" for map automations (courier routing, min-fuel TSP,
#    address geocoding). Self-hosted, free, no third-party keys — OpenStreetMap data behind
#    Docker: OSRM (routing/matrix) + Nominatim (geocoding), fronted by the fractera-geo facade
#    (:3400, loopback). The map is a permanent part of the product, so the ENGINES are always
#    installed — but WITHOUT a region (step 501, owner's decision 2026-08-08).
#
#    WHY NO REGION IS PRE-INSTALLED. This used to hardcode Île-de-France and prepare it for every
#    server. Measured on a live install: 892 MB of OSRM extract + 7.2 GB of Nominatim address
#    database + minutes of import — roughly 10 GB spent on a map of Paris that a customer in
#    Brazil does not need and will replace anyway, paying the cost twice. The whole planet cannot
#    be pre-installed either (Nominatim needs on the order of a terabyte), so ANY pre-chosen
#    region is guessing somebody else's geography.
#
#    So the install pulls the two images and stops there. The owner picks their region in
#    Admin → Map settings, where the region assistant checks the choice against the live
#    Geofabrik catalogue and states size and time honestly; provision-region.sh then creates both
#    containers from scratch (it already does `docker rm -f` + `docker run -d`), so nothing here
#    has to pre-create them. Until then the facade answers honestly: routing and geocoding
#    "down", region empty.
#
#    Pulling the images at install (1.8 GB) is deliberate: it is the part that is identical for
#    every region, so paying for it once here makes the owner's first provision shorter.
#    Steps are SOFT: a map failure never blocks the rest of the boot.
soft_step "geo_docker"    "Docker (geo engines)" "command -v docker >/dev/null 2>&1 || (curl -fsSL https://get.docker.com | sh); systemctl enable --now docker"
soft_step "geo_images"    "Geo engines (images only, region chosen later)" "mkdir -p /opt/fractera-geo/osrm && docker pull osrm/osrm-backend && docker pull mediagis/nominatim:4.4"
soft_step "deps_geo"      "Installing dependencies (geo)" "npm install --prefix services/geo"
soft_step "start_geo"     "Starting geo service" "cd /opt/fractera/services/geo && pm2 start node --name fractera-geo -- server.js && cd /opt/fractera"
log_email "start_data" "All services started" 65

CURRENT_STEP="pm2_save"
CURRENT_LABEL="Saving configuration"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
pm2 save >> "$LOG_FILE" 2>&1 || true
pm2 startup systemd -u root --hp /root | tail -1 | bash >> "$LOG_FILE" 2>&1 || true
systemctl enable pm2-root >> "$LOG_FILE" 2>&1 || true
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# Daily TLS cert-expiry relay → Easy Starter. The script self-guards (no-op
# until Secure mode with a cert on disk), so scheduling it now in IP mode is
# harmless. Keeps L1's certExpiresAt fresh after certbot auto-renewal and lets
# L1 send a single expiry-warning email at <=14 days. → reports/patterns.
soft_step "cert_relay_cron" "Cert-expiry relay (daily)" "chmod +x /opt/fractera/scripts/cert-relay.sh; echo '17 4 * * * root /opt/fractera/scripts/cert-relay.sh >> /var/log/fractera-cert-relay.log 2>&1' > /etc/cron.d/fractera-cert-relay; chmod 644 /etc/cron.d/fractera-cert-relay"

# === Initial Nginx config — IP-only, single default_server on :80 ===
# Customer attaches their own domain later through Admin → Personal Domain
# (admin app runs certbot directly). No Fractera-owned subdomains.
CURRENT_STEP="configure_nginx_http"
CURRENT_LABEL="Configuring web server (HTTP)"
report "$CURRENT_STEP" "$CURRENT_LABEL" false

cat > /etc/nginx/sites-available/fractera <<'NGINXEOF'
# Default HTTP server — catches all requests to the bare IP and proxies to
# the shell on :3000. Other services (auth :3001, admin :3002, data :3300) are
# reached directly on their ports until the user attaches a domain.
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # nginx defaults to a 1 MB request body, which silently kills media uploads
    # (the browser only sees "Failed to fetch"). 200m matches the multer limit in
    # services/data/server.js — keep the two equal.
    client_max_body_size 200m;

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
        proxy_set_header Accept-Encoding "";
        sub_filter_once on;
        sub_filter '</body>' '<div style="position:fixed;bottom:2px;left:0;right:0;text-align:center;z-index:200;line-height:1"><a href="https://github.com/Fractera/Agent-Engineering-Infrastructure" style="font-size:8px;color:#888;text-decoration:none">Powered by Fractera</a></div></body>';
    }
}

NGINXEOF

rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/fractera /etc/nginx/sites-enabled/fractera
nginx -t >> "$LOG_FILE" 2>&1 || fail "nginx config invalid"
systemctl reload nginx >> "$LOG_FILE" 2>&1 || fail "nginx reload failed"
report "$CURRENT_STEP" "$CURRENT_LABEL" true

# === Health check before registration ===
CURRENT_STEP="health_check"
CURRENT_LABEL="Verifying server is responding"
report "$CURRENT_STEP" "$CURRENT_LABEL" false
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


# === White label check — remove footer if user has paid for it ===
if [ -n "$SERVER_TOKEN" ]; then
  WL=$(curl -s --max-time 5 \
    -H "Authorization: Bearer $SERVER_TOKEN" \
    "https://www.fractera.ai/api/server/white-label" 2>/dev/null || echo "")
  if echo "$WL" | grep -q '"white_label":true'; then
    echo "White label active — removing footer from nginx" >> "$LOG_FILE"
    python3 - << 'WLEOF' >> "$LOG_FILE" 2>&1
import os
MARKERS = ['proxy_set_header Accept-Encoding ""', 'sub_filter_once on', "sub_filter '</body>'"]
for path in ['/etc/nginx/sites-available/fractera', '/etc/nginx/sites-enabled/fractera-custom']:
    try:
        lines = open(path).readlines()
        filtered = [l for l in lines if all(m not in l for m in MARKERS)]
        open(path, 'w').writelines(filtered)
        print(f'white label: cleaned {path}')
    except: pass
WLEOF
    nginx -t >> "$LOG_FILE" 2>&1 && systemctl reload nginx >> "$LOG_FILE" 2>&1
  fi
fi

# === Install ping agent cron (if SERVER_TOKEN provided) ===
if [ -n "$SERVER_TOKEN" ]; then
  sed -i "/^SERVER_TOKEN=/d" /etc/fractera/secrets.env 2>/dev/null; echo "SERVER_TOKEN=$SERVER_TOKEN" >> /etc/fractera/secrets.env
  # Cron: ping platform every 15 min, send subdomain on first ping
  CRON_CMD="*/15 * * * * curl -s -X POST $PING_URL -H 'Content-Type: application/json' -H 'Authorization: Bearer $SERVER_TOKEN' -d '{\"subdomain\":\"$SUBDOMAIN\"}' >> /var/log/fractera-ping.log 2>&1"
  # Idempotent: drop any prior ping cron (stale tokens from earlier deploys on
  # this host) BEFORE adding the current one, so a server that is bootstrapped
  # repeatedly keeps exactly ONE ping line instead of accumulating a stale-token
  # 401 storm. wipe does not clean crontab, so reconcile here (one deploy = one
  # ping line, regardless of host history). A real customer VPS is deployed once
  # and is unaffected; this only matters for the shared, repeatedly-wiped test IP.
  (crontab -l 2>/dev/null | grep -v '/api/server/ping'; echo "$CRON_CMD") | crontab -
  echo "Ping agent installed (token: ${SERVER_TOKEN:0:8}...)" >> "$LOG_FILE"
  log_email "complete" "Server is ready — all services running on plain HTTP. Attach your own domain through Admin → Personal Domain to enable HTTPS." 100
  # Ping immediately (retry up to 5 times in case Vercel is redeploying)
  for i in 1 2 3 4 5; do
    PING_RESP=$(curl -s -X POST "$PING_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SERVER_TOKEN" \
      -d "{\"subdomain\":\"$SUBDOMAIN\"}")
    echo "[ping] attempt $i: $PING_RESP" >> /var/log/fractera-ping.log
    if echo "$PING_RESP" | grep -q '"ok":true'; then break; fi
    [ $i -lt 5 ] && sleep 30
  done
fi

# Signal completion with subdomain — retry up to 5x to survive Vercel cold starts
# In IP-mode RESPONSE is empty (no register call) — use a synthetic JSON.
_response_json="${RESPONSE:-{\"subdomain\":\"$SUBDOMAIN\",\"ip\":\"$SERVER_IP\",\"mode\":\"ip\"}}"
_done_payload="{\"session_id\":\"$SESSION_ID\",\"done\":true,\"response\":$_response_json}"
for _attempt in 1 2 3 4 5; do
  _code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST "$PROGRESS_URL" \
    -H "Content-Type: application/json" \
    -H "x-install-secret: $INSTALL_SECRET" \
    -d "$_done_payload" 2>/dev/null)
  [ "$_code" = "200" ] && break
  sleep 10
done

echo "=== Fractera bootstrap finished: $(date) ===" >> "$LOG_FILE"
echo "FRACTERA_READY: http://$SERVER_IP:3000 (app) | http://$SERVER_IP:3001 (auth) | http://$SERVER_IP:3002 (admin) | http://$SERVER_IP:3300 (data)"
