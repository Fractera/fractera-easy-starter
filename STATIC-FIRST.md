# STATIC-FIRST — the canon: "better nothing than a dynamic page"

> FES (the marketing/onboarding portal) **already complies**: the shell is `force-static`, and
> `force-dynamic` appears only on API routes and a few genuinely-dynamic pages (`partners/[slug]`, `embed`,
> `debug`). This file states the canon so it cannot drift. Authoritative dev source — `/code/CLAUDE.md`
> (§ "🛑 КАНОН СТАТИКИ"); content/i18n recipe — `/code/CONTENT-I18N-ARCHITECTURE-STANDARD.md §6`.

## The rule (verbatim)
**Creating a dynamic page is FORBIDDEN.** The only exception: when it is ABSOLUTELY necessary, and only
after the architect's **DOUBLE** confirmation. Principle: **better to build nothing than to make a page
dynamic where it could have been static.**

## Why — the product must work with JavaScript OFF
The Next.js App Router ships complete server HTML; a visitor with JS disabled (crawler, reader-mode,
locked-down browser, pre-hydration) must still get the full page. JS-dependent extras may degrade; that is
fine. The real no-JS killer is **client-side routing / a client component that owns a route** — not SSR.
So: routing is server-generated, routes are never owned by client components, content is **SSG/ISR**.
Static-first also buys predictable SEO/GEO, cheap caching and reproducible builds.

## The only exception — architect-only pages
A page may stay dynamic **only when its access is architect-only** (internal cockpit/admin tooling), never
the public marketing surface.

## The trap — never do it
A root-level `export const dynamic = "force-dynamic"` forces the **whole subtree** dynamic. Never put it on
a root layout to "reflect settings without a rebuild" — use **ISR (`revalidate`)**. Other silent
static/ISR breakers in a layout/page: `auth()`, `cookies()`, `headers()`.

## How to do it right
Reference implementation — `../22slots-main/app` (and `Documents/fractera/22slots-main/app`): every `[lang]`
content route uses `generateStaticParams` + `export const dynamicParams = true` + `export const
revalidate = N` (ISR), no root `force-dynamic`. FES recipe details —
`/code/CONTENT-I18N-ARCHITECTURE-STANDARD.md §6`.
