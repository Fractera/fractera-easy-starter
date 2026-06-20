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
component that owns a route** — not server rendering itself.

## The content-actualization ladder
The ways content reaches a page, cheapest to most expensive per visitor:

| Strategy | Change appears | DB / visit | Needs JS | Server cost | Use for |
|---|---|---|---|---|---|
| **Static (SSG)** | on redeploy | none | no | lowest | build-time content |
| **ISR, time-based** (`revalidate = N`) | within N s, lazily | ~1 per N window\* | no | low | **the default** for most content |
| **ISR + on-demand** (`revalidate = false` + `revalidateTag`) | instant, on change | 1 per change | no | low + instant | optional: when you wire a purge on write |
| **Dynamic SSR** (`force-dynamic`) | every request | every request | no\*\* | high | architect-only cockpit |
| **Client fetch** (`fetch('/api/…')` in a client island) | every view | every view | **yes** | medium | private/interactive panels, not public lists |

\* **Lazy and traffic-bound.** A page re-renders only when it is *requested* after its N-second window, and
only that page. With no traffic the server sleeps — a page nobody visits is never re-rendered. There is no
clock rebuilding the whole site.

\*\* Dynamic SSR still ships real HTML, but recomputes and re-queries the database on every request.

## How time-based ISR actually behaves (the default)
You set `export const revalidate = N`. The page is generated once and served from cache. While nobody visits,
the server does nothing — it sleeps. When a visitor arrives after the window has passed, they get the cached
page instantly and that one page is regenerated in the background; the next visitor sees the fresh version.

Example: a page lists two dogs; you add a third. The next visitor after the window triggers a rebuild of that
page and sees three; the cats page nobody opened stays as it was, at zero cost. The only redundant cost is a
page visited constantly but changed rarely: it rebuilds once per window even when unchanged — a small,
traffic-bounded price, and the accepted trade.

```ts
// app/dogs/page.tsx
export const revalidate = 600   // at most one rebuild per 10 min, per page, only on traffic
export default async function Page() {
  const dogs = await db.query("SELECT * FROM dogs")  // runs only during a (rare) regeneration
  return <DogList dogs={dogs} />
}
```

## Optional: on-demand revalidation (instant, but you must wire it)
When a specific page cannot tolerate any delay, set `revalidate = false` (it never refreshes on its own) and
purge it explicitly from the handler that changes the data. The cost is discipline — call the purge on every
write, or the page freezes.

```ts
import { revalidateTag } from "next/cache"
await db.prepare("INSERT INTO dogs …").run(…)
revalidateTag("dogs")   // the dogs page rebuilds once, on the next request — instant
```

Time-based ISR is the default because it is self-correcting and needs no wiring; on-demand is the exception
for pages that genuinely need zero-delay freshness.

## Classify every route before setting a render mode
- **Public content** (`[lang]` home, articles, user-built pages) → SSG/ISR. `generateStaticParams` +
  `revalidate = N`; `dynamicParams = true` to render an unlisted param on demand. No `force-dynamic`.
- **Private but no server data at render** (e.g. a dashboard) → **static shell**. Gate client-side
  (`enforcedBy: "component"`, the client island reads `/api/me`); data comes from authenticated `/api/*`.
- **Architect-only service cockpit** → dynamic is allowed: `export const dynamic = "force-dynamic"` on that
  one page, never on the root layout.

Never reach for `auth()`, `cookies()`, or `headers()` in a page to enforce access — they silently break
static/ISR. Use the client guard plus a protected API.

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
- With no traffic, the server is idle; a content change appears on the next visit after the revalidate window.
