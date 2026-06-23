# Multilingual Login & Registration Forms

This document describes how the **login** and **registration** forms in a Fractera
workspace are localized, and how an AI agent can adjust them. It is written to be
read by an AI agent (Hermes, Claude Code, Codex, Gemini, Qwen, Kimi) directly from
the workspace's LightRAG memory.

## What is localized

The auth service (`services/auth`, the process on port 3001) renders two forms —
**sign in** and **create account** — plus their modals, toasts and inline errors.
Every visible **word** in those forms is translated into all **82 catalog
languages**. Only the words are localized; the auth input fields themselves
(email, password, confirm) are unchanged and remain dynamic.

The strings live in a single build-time dictionary:

```
services/auth/lib/i18n/auth-strings.ts
```

It exports `STRINGS: Record<string, AuthStrings>` — one entry per language code —
plus `getAuthStrings(lang)`, `detectBrowserLang()` and `fill()` helpers.

## How a visitor gets their language

The form is a client component. On mount it reads the **browser language**
(`navigator.language` / `navigator.languages`), reduces it to its primary subtag
(`pt-BR` → `pt`), and selects the matching entry from the baked dictionary. If the
browser asks for a language that is not present, it falls back to **English**.

There is **no per-visitor server request** to decide the language and **no runtime
generation**. Every language is compiled into the bundle ahead of time, so the
pages (`/login`, `/register`) are served as **static** HTML. This keeps server load
minimal and the forms fast everywhere.

## When the forms are (re)built

`services/auth` is built **once, at full deploy** (the bootstrap step
`build_auth` runs `npm run build --prefix services/auth`). The routine app deploy
loop (`/api/deploy`, which rebuilds the `app/` slot) does **not** rebuild the auth
service, and secure-mode activation only restarts it. To pick up a change to
`auth-strings.ts`, rebuild the auth service and reload it:

```
npm run build --prefix services/auth
pm2 reload fractera-auth
```

## Trimming languages you do not need (planned)

By default all 82 languages are baked in, because at deploy time the admin's own
language is unknown — every language must be available for that first sign-up.
Realistically most deployments only ever need a handful of languages. Carrying all
82 does not slow the finished page for visitors, but it does add build time and
bundle size.

A planned follow-up makes this a one-line choice: an environment variable will list
the languages to keep, and a small **build-time generator** (the same Turbopack-safe
`parser-fs` pattern the platform already uses for content) will emit a dictionary
containing **only those languages plus English** as the fallback. Unset/empty →
all 82 (first deploy, language unknown); set → only the chosen languages.

Until that ships, an agent can achieve the same result **today** by editing the
dictionary directly: open `services/auth/lib/i18n/auth-strings.ts`, remove the
language entries that are not needed (keep `en`), then rebuild and reload the auth
service with the two commands above. English must always remain as the fallback.

## Adding or correcting a language

To add a language or fix a translation, edit the relevant entry in
`auth-strings.ts` (each entry must contain every field of the `AuthStrings` type),
then rebuild and reload `fractera-auth`. A new language is one new entry keyed by
its ISO 639-1 code.
