# Static-First Rendering — the full standard

> The raw, downloadable companion to the documentation page *“Static-First, on Purpose”*. This is what an AI
> agent reads to apply static-first end to end. English only, by design. It grows as the platform evolves.

## The canon
**Creating a dynamic page is forbidden.** The only exception: when it is absolutely necessary, and only after
the architect’s **double** confirmation. Principle: *better to build nothing than to make a page dynamic where
it could have been static.* The severity is economic, not aesthetic — a dynamic public page scales your server
bill linearly with traffic; a static one does not.

## The foundation — the product must work with JavaScript off
The Next.js App Router fetches data on the server and ships complete HTML. A visitor with JavaScript disabled —
a crawler, reader-mode, a locked-down browser, a slow network before hydration — must still receive the full
page. JavaScript-dependent extras (a live switcher, a drag handle) may degrade; that is acceptable. Everything
that *can* work without JS *must* keep working. The real no-JS killer is **client-side routing / a client
component that owns a route** — not server rendering itself. So: routing is server-generated, a route is never
owned by a client component, and the overwhelming majority of content is SSG/ISR.

## The content-actualization ladder
Five ways content reaches a page, cheapest to most expensive per visitor:

| Strategy | Change appears | DB / visit | Needs JS | Server cost | Use for |
|---|---|---|---|---|---|
| **Static (SSG)** | on redeploy | none | no | lowest | build-time content |
| **ISR, time-based** (`revalidate = N`) | within N seconds | 1 / regeneration | no | low, but wasteful (re-renders on a timer even when unchanged) | backstop only |
| **ISR + on-demand** (`revalidate = false` + `revalidatePath`/`revalidateTag`) | instant, on change | 1 / actual change | no | lowest **with** freshness | **default** for DB/config-backed public pages |
| **Dynamic SSR** (`force-dynamic`) | every request | every request | no\* | high (per-request compute + DB) | architect-only cockpit |
| **Client fetch** (`fetch('/api/…')` in a client island) | every view | every view | **yes** | medium (per-view API+DB) | private/interactive panels, not public lists |

\* Dynamic SSR still ships real HTML, but recomputes and re-queries on every request.

## Classify every route before setting a render mode
- **Public content** (`[lang]` home, articles, user-built pages) → SSG/ISR. `generateStaticParams` (+
  `dynamicParams`/`revalidate` as needed). No dynamic markers.
- **Private but no server data at render** (e.g. a dashboard) → **static shell**. Gate client-side
  (`enforcedBy: "component"`, the client island reads `/api/me`); data comes from authenticated `/api/*`. The
  shell carries no secret, so it stays static. *Private does not mean dynamic.*
- **Architect-only service cockpit** → dynamic is allowed: put `export const dynamic = "force-dynamic"` on that
  one page, never on the root layout.

Never reach for `auth()`, `cookies()`, or `headers()` in a page to enforce access — they silently break
static/ISR. Use the client guard plus a protected API.

## Freshness without waste — on-demand revalidation (the real optimum)
Do not refresh on a timer. Generate once and re-compute only when content actually changes.

```ts
// app/api/revalidate/route.ts — architect-gated; purge exactly what changed, on save
import { revalidatePath, revalidateTag } from "next/cache"
export async function POST(req: Request) {
  const { paths, tags, type } = await req.json().catch(() => ({}))
  tags?.forEach((t: string)  => revalidateTag(t))
  paths?.forEach((p: string) => revalidatePath(p, type ?? "page"))
  if (!tags?.length && !paths?.length) revalidatePath("/", "layout") // global config surface
  return Response.json({ revalidated: true })
}

// On a content write — regenerate just the affected surface, nothing else:
await db.prepare("INSERT INTO products …").run(…)
revalidateTag("products")   // only pages tagged "products" rebuild, once, on the next request
```

- **Why `revalidate = false`, not a 5-minute timer.** `revalidate = 300` re-renders every page every five
  minutes *even when nothing changed* — pure waste. On-demand re-computes only on an actual change. A short
  timer is, at best, a backstop for content changed *outside* a write handler.
- **The one cross-layer wiring (architect-owned).** Global config (Site Settings) is saved by the Admin app,
  which is a separate process from the public app. After it writes the config it must POST `/api/revalidate`
  so the change reflects instantly. The hook lives in the app; the call lives in the architect’s layer.

## Why the architect layer stays dynamic
A single architect cannot create harmful load. The service cockpit is opened by one owner doing necessary
work; its compute is bounded and unavoidable. The rule protects the *public* surface, where many visitors —
careless, curious, or malicious — turn every dynamic render into multiplied cost. So dynamic rendering is
permitted exactly where it cannot hurt the bill: behind architect-only access.

## We do not automate PPR
Partial Prerendering (a static shell with a dynamic hole) is a precise tool for a developer who knows which
fragment must be live and wants to balance freshness against server cost by hand. That is a conscious
decision, not an automatic optimization — Fractera leaves it to you.

## Verification
- `grep` for `force-dynamic`: only on architect-only pages (and API routes), never on the root layout.
- Build output: public + `[lang]` routes are static/ISR, not `ƒ (Dynamic)`; service pages may be `ƒ`.
- JavaScript disabled: `/`, `/<lang>` render complete HTML.
- A private page renders its static shell with JS off, then gates/loads via client + API once JS runs.
- Content edits go live on the next request after save (on-demand revalidation), with no timer wait.
