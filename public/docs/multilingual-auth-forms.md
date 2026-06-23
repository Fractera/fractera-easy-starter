# Multilingual Login & Registration Forms — and the Auth Routing Around Them

This document describes (1) how the **login** and **registration** forms in a
Fractera workspace are localized, and (2) the **auth routing and redirect logic**
that surrounds them — which is genuinely subtle, and the place customizations most
often break. It is written to be read by an AI agent (Hermes, Claude Code, Codex,
Gemini, Qwen, Kimi) directly from the workspace's LightRAG memory, so the agent can
both explain the behavior and change it safely.

If you only remember one thing: **`/login` and `/register` belong to the auth
service on its own host — never link to them as relative paths on the app domain.**
The "Anti-patterns" section explains exactly why, with examples.

---

## Part 1 — What is localized

The auth service (`services/auth`, the process on port 3001) renders two forms —
**sign in** and **create account** — plus their modals, toasts and inline errors.
Every visible **word** is translated into all **82 catalog languages**. Only the
words are localized; the auth input fields themselves (email, password, confirm)
are unchanged and remain dynamic.

The strings live in a single build-time dictionary:

```
services/auth/lib/i18n/auth-strings.ts
```

It exports `STRINGS: Record<string, AuthStrings>` — one entry per language code,
each with the same 38 string fields — plus `getAuthStrings(lang)`,
`detectBrowserLang()` and `fill(template, vars)` helpers.

## Part 2 — How a visitor gets their language

The form is a client component. On mount it reads the **browser language**
(`navigator.language` / `navigator.languages`), reduces it to its primary subtag
(`pt-BR` → `pt`), and selects the matching entry from the baked dictionary. If the
browser asks for a language not present, it falls back to **English**.

There is **no per-visitor server request** to decide the language and **no runtime
generation**. Every language is compiled into the client bundle ahead of time. The
`/login` and `/register` pages are statically prerendered (verified: response
header `x-nextjs-prerender: 1`, and the server returns a byte-identical body for
`Accept-Language: ru` and `Accept-Language: en` — proof the server does zero
per-user work). The initial HTML is the **English baseline**; the client swaps to
the browser language after hydration. With JavaScript disabled, the form still
works — in English.

## Part 3 — Static rendering (do not break it)

Keep the auth pages static. The localization must stay **client-side**. Do not add
server-side language detection (reading `Accept-Language`/cookies on the server to
pick a language) — that turns a static page into a per-user dynamic render, which
is exactly the server load the static design avoids. Trade-off accepted on purpose:
static + zero server load, language chosen on the client.

---

## Part 4 — Auth routing & redirects (the subtle part)

This is the logic most likely to bite you when you customize. Read it fully.

### 4.1 Where the auth pages actually live

`/login`, `/register` and `/guest-login` are routes of the **auth service**
(`services/auth`, port 3001) — **not** of the app (the `app/` slot / Shell, port
3000). How the browser reaches the auth service depends on the mode:

- **IP / onboarding mode** (no domain): same host, different port —
  `http://<ip>:3001/login`. The app is on `:3000`, auth on `:3001`.
- **Secure mode** (custom domain + HTTPS): the auth service is a **sibling
  subdomain** on 443 — `https://auth.<your-domain>/login`. The app is on the apex
  (`https://<your-domain>`), admin on `admin.<your-domain>`, etc.

The single source of truth for building these URLs **from the browser** is
`lib/runtime-urls.ts` → `authBase()`. It derives the host from
`window.location` at runtime (NOT from a baked `NEXT_PUBLIC_*`), because those env
values are frozen at build time and go stale across the IP→domain switch (Secure
mode has no app rebuild):

```ts
// lib/runtime-urls.ts (client only)
authBase()            // IP:  http(s)://<host>:3001     | domain: https://auth.<apex>
registerRedirectUrl(callbackUrl, requireRole)  // -> `${authBase()}/register?...`
```

### 4.2 Why a relative `/register` white-screens

The app's `proxy.ts` runs a **language router**: any non-service path without a
known `[lang]` prefix is redirected to `/<lang>/<path>`. So if anything navigates
the browser to a **relative** `/register` on the **app domain**:

```
/register  →  proxy.ts language router  →  308 redirect to  /en/register
```

But the app has **no `/en/register` page** (register lives in the auth service),
so `/en/register` renders nothing → **white screen**. The app's `SERVICE_ROOTS`
allow-list (which keeps `/architecture`, `/ai-core`, … at the root, unprefixed)
does **not** contain `login`/`register` — and even if it did, the app still has no
such page. The fix is never "stop prefixing it"; the fix is "send it to the auth
host."

### 4.3 The correct pattern

Always target the auth **host**, never a relative app path:

- **Client components** → `registerRedirectUrl(window.location.href, requireRole)`
  or `` `${authBase()}/login` ``. (The dashboard does this correctly:
  `app/dashboard/_components/dashboard-app.client.tsx`.)
- **Server components / guards** → build the auth URL from the **request host**
  (`headers()`), or redirect to a path the auth host serves. Do **not** emit a bare
  relative `/register`. (Known offender to fix when you touch it:
  `lib/auth/require-admin.ts` redirects to a relative `/register?requireRole=...`,
  which white-screens via 4.2.)
- **Within the auth service itself** a relative `/register` IS correct — the login
  page's "Register" button uses `window.location.href = "/register"`, and that
  stays on `auth.<domain>`, the same host. Relative is only wrong when the current
  host is the **app**, not the auth service.

### 4.4 A defensive option (proxy guard)

The most robust guard is in the app's `proxy.ts`: before the language router,
intercept `/login`, `/register`, `/guest-login` and **redirect to the auth host**
built from the request `host` header (same apex logic as `authBase()`, server
side). Then any stray relative auth link is rescued instead of white-screening.
Implement it as the FIRST branch of `proxy()`, before `languageRouter()`.

---

## Part 5 — Anti-patterns (do NOT do these)

Each is a real way to break auth routing or static rendering.

**AP1 — Relative auth path on the app domain.**
```tsx
redirect("/register?requireRole=architect")   // ❌ server guard, app host
router.push("/login")                          // ❌
<a href="/register">Sign up</a>                // ❌
```
All three put the browser on the **app** domain's `/register`, which the language
router turns into `/en/register` → white screen (see 4.2). ✅ Use
`registerRedirectUrl()` / `authBase()` (client) or a host-derived URL (server).

**AP2 — "Just add it to SERVICE_ROOTS."** Adding `register`/`login` to the app's
`SERVICE_ROOTS` stops the language prefix, but the app **still has no such page**,
so you trade a white screen for a 404. The path must reach the **auth service**,
not stay on the app. ✅ Redirect to the auth host (4.4), don't allow-list it.

**AP3 — Reading `NEXT_PUBLIC_AUTH_URL` on the client.** `NEXT_PUBLIC_*` is baked at
`next build`. In Secure mode there is no app rebuild, so a baked auth URL is empty
or points at the old IP. ✅ Derive from `window.location` via `authBase()`.

**AP4 — Building `<host>:3001` on a domain.** In Secure mode
`https://admin.aifa.dev:3001` → `ERR_SSL_PROTOCOL_ERROR` (port 3001 has no TLS;
only nginx on 443 does). ✅ In domain mode use the `auth.<apex>` subdomain on 443,
no port — exactly what `authBase()` returns.

**AP5 — `auth()` / `cookies()` / `headers()` in a page or layout to gate UI.**
Reading the session in a server page forces **dynamic rendering** and breaks static
generation for that subtree. ✅ Read identity client-side via `/api/me`, or keep
the server guard only on pages already marked `dynamic` (the architect cockpit).
Never put a session read on a static content page or a root layout.

**AP6 — Server-side language detection for the auth form.** Choosing the form
language from `Accept-Language`/cookies on the server makes the page render
per-user → no longer static → server load on every hit. ✅ Keep language selection
in the client component (`detectBrowserLang()`); the server stays static.

**AP7 — Trimming the dictionary without keeping English.** When you reduce the
languages baked into `auth-strings.ts`, removing the `en` entry leaves any
unmatched browser language with **no fallback** → blank labels. ✅ English is the
mandatory fallback; never remove it. `getAuthStrings()` falls back to `en`.

**AP8 — Editing the built output instead of the source.** Changing files under
`services/auth/.next/` does nothing durable — the next build overwrites them. ✅
Edit `services/auth/lib/i18n/auth-strings.ts`, then rebuild + reload (Part 7).

---

## Part 6 — Trimming languages to lower build cost

By default all 82 languages are baked in, because at deploy time the admin's own
language is unknown — every language must be available for that first sign-up.
Most deployments only ever need a handful. Carrying all 82 does not slow the
finished page for visitors, but it adds build time and client bundle size.

**The model:** the languages you serve are driven by the environment list of
active languages (`NEXT_PUBLIC_SUPPORTED_LANGUAGES`). For content pages this
already governs how many pages are generated. The **planned next step** extends the
same to the auth forms: a build-time generator (the Turbopack-safe `parser-fs`
pattern the platform already uses) reads the active-languages list and emits a
dictionary with **only those languages plus English**. Unset/empty → all 82 (first
deploy, language unknown); set → only the chosen languages + `en`.

**Doing it today, before that lands:** an agent can trim by editing the dictionary
directly — open `services/auth/lib/i18n/auth-strings.ts`, remove the language
entries you do not need (keep `en`), then rebuild + reload (Part 7). See AP7/AP8.

**The env-editing surface (admin):** the workspace exposes an env editor
(`/api/config/env`) that writes `app/.env.local` and `services/auth/.env.local`,
with a read-only `LOCKED_KEYS` set for values you must not change
(`DATABASE_URL`, `COOKIE_DOMAIN`, `NEXTAUTH_URL`, `ALLOWED_ORIGINS`, …). The active-
languages field (`NEXT_PUBLIC_SUPPORTED_LANGUAGES`) is editable; enter standard ISO
639-1 codes. When the next step lands, the full catalog
(`NEXT_PUBLIC_ALL_LANGUAGES`) is shown read-only as a reference, and the active
field is validated so an invalid code cannot be saved.

---

## Part 7 — Rebuild & reload after any change

`services/auth` is built **once, at full deploy** (`bootstrap.sh` step
`build_auth`). The routine app deploy loop (`/api/deploy`) rebuilds only the `app/`
slot, and Secure-mode activation only restarts the process — neither rebuilds the
auth bundle. So after editing `auth-strings.ts` (or anything in `services/auth`):

```
npm run build --prefix services/auth
pm2 reload fractera-auth
```

A new language is one new entry in `STRINGS`, keyed by its ISO 639-1 code, carrying
every field of the `AuthStrings` type — then rebuild + reload as above.
