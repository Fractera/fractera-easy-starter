import type { BlogBlock } from '@/lib/blog/types'

export const en = {
  title: 'Static-First, on Purpose: The Server-Bill Economics of an Agentic Engineering Infrastructure',
  description:
    'Why Fractera enforces static-first rendering with unusual rigor, and the honest price it costs you. A field guide to the five ways content reaches a page — SSG, time-based ISR, on-demand ISR, dynamic SSR, and client fetch — mapped to database load, JavaScript dependence, traffic and the one number that decides a small business: the monthly compute bill.',
  summary:
    'The five ways content reaches a page, what each costs in server compute and database queries, and why a hyper-efficient site treats dynamic rendering as a last resort — with the price stated plainly.',
  faq: [
    {
      q: 'If I add a paragraph or a row to my content, do visitors see it instantly or after a delay?',
      a: 'Instantly, when the page is wired the way Fractera recommends. A static/ISR page is regenerated on demand: the moment the content is saved, the write handler calls the revalidation hook (revalidatePath / revalidateTag) and the page is rebuilt on the very next request — there is no fixed waiting window. A time-based timer (revalidate = N) is only a backstop for changes made outside a save handler; it is not the normal update path. Data that is fetched in the browser (an interactive panel) is always live, because it is queried on every view rather than baked into the HTML.',
    },
    {
      q: 'Why does Fractera keep the architect/admin pages dynamic if dynamic rendering is discouraged?',
      a: 'Because a single architect cannot generate harmful load. The service cockpit (Architecture, AI Core, Development Steps, and so on) is visited by one owner doing necessary work; its per-request compute is bounded and unavoidable. The rule exists to protect you from the opposite case: public pages hit by many visitors — some careless, some curious, some malicious — where every dynamic render multiplies your server cost. So dynamic rendering is allowed exactly where it cannot hurt the bill: behind architect-only access.',
    },
    {
      q: 'What is the real cost the architecture is optimizing for?',
      a: 'The business’s server bill — compute and database load — not the developer’s token budget. Tokens are spent once, while building. Compute is spent forever, on every visitor, for as long as the product lives. A project that renders dynamically by default scales its server cost linearly with traffic, which is exactly where small businesses fail to close their unit economics. Static-first turns most of that recurring cost into a one-time generation.',
    },
    {
      q: 'Does Fractera automate Partial Prerendering (PPR) for me?',
      a: 'No, deliberately. PPR is a precise tool for a developer who knows exactly which slice of a page must be dynamic and which can be static, and who wants to balance freshness against server cost by hand. That is a conscious engineering decision, not something to switch on automatically, so Fractera leaves it to you rather than optimizing it on your behalf.',
    },
  ],
  blocks: [
    {
      kind: 'founder',
      text: 'I want to say the quiet part out loud. While a lot of developers are busy worrying about how to save tokens to build their apps, the real value was never in how much the developer saves. It is in how much money the business spends on compute for its own server, in its own business, every single month. That is where the real cost lives. Tokens you spend once. A server you pay for forever — on every visitor, for as long as the product is alive. So we built our architecture around that number, and we are not shy about the price it asks of you in return.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [agentic engineering infrastructure](https://www.fractera.ai/): you deploy a workspace where AI agents build your software on your own server. And because it is *your* server, the architecture is obsessed with one thing most starters quietly ignore — keeping the recurring cost of running your product as close to zero as physics allows. This document is the honest version of that promise: how content reaches a page, the five ways to do it, and the deliberate, slightly uncomfortable price we ask you to pay for hyper-efficiency.',
    },
    {
      kind: 'callout',
      title: 'Did you know?',
      text: 'The service pages of a Fractera workspace update automatically, in real time. When an AI agent or the architect edits something, new folders, pages and descriptions appear right before your eyes and the tree highlights what changed. Those pages are dynamic on purpose — and, as you will see below, that is allowed precisely because only the architect ever opens them.',
    },
    {
      kind: 'h2',
      text: 'The bill nobody warns you about',
    },
    {
      kind: 'p',
      text: 'Most projects start fast and slide, quietly, into a state that does not scale. It rarely shows up as a crash. It shows up on an invoice. The page that renders fresh on every request felt harmless at ten visitors a day; at ten thousand it is ten thousand renders, ten thousand database round-trips, a bigger box, a managed database tier, and a unit economy that no longer closes. For a large company that is a line item. For a small business — the audience we care about most — it is the difference between a product that pays for itself and one that does not.',
    },
    {
      kind: 'p',
      text: 'The trap is that the expensive default is also the *easy* default. Frameworks make "render it live every time" the path of least resistance, and without genuinely strict rules a codebase drifts there one convenient route at a time. So we made the rules strict, on purpose, and wrote them down as a canon: **a dynamic page is forbidden unless it is absolutely necessary, and only with the architect’s explicit, double sign-off.** Better to ship nothing than to ship a page dynamic where it could have been static. That severity is not dogma — it is the cheapest server bill you can have.',
    },
    {
      kind: 'h2',
      text: 'Five ways content reaches a page',
    },
    {
      kind: 'p',
      text: 'Everything comes down to one question: when a visitor asks for a page, where does the content come from? There are five honest answers, and they are not equal. They differ in **when a change becomes visible**, **how many database queries happen per visit**, **whether they need JavaScript to work at all**, and **how much server compute they burn**. Read the table top to bottom as cheapest to most expensive, per visitor:',
    },
    {
      kind: 'code',
      text:
        'Strategy               When change shows    DB / visit   Needs JS   Server cost     Use for\n' +
        '─────────────────────  ──────────────────   ──────────   ────────   ─────────────   ─────────────────────────\n' +
        'Static (SSG)           on redeploy          none         no         lowest          build-time content\n' +
        'ISR, time-based (N)    within N seconds     1 / regen    no         low, wasteful   backstop only\n' +
        'ISR + on-demand        instant, on change   1 / change   no         lowest + fresh  DB/config pages  ← default\n' +
        'Dynamic SSR            every request        every req    no*        high            architect-only cockpit\n' +
        'Client fetch           every view           every view   YES        medium          private panels, not lists\n' +
        '\n' +
        '* Dynamic SSR still ships real HTML, but it recomputes the page (and re-queries the DB) on every request.',
    },
    {
      kind: 'list',
      items: [
        '**Static (SSG)** — the content is baked in at build time. Zero database queries at request, zero per-visitor compute, works perfectly with JavaScript off. The catch: a change needs a redeploy. Ideal for content that only changes when you ship.',
        '**Time-based ISR** (`revalidate = N`) — the page regenerates at most every N seconds. It stays static and no-JS-friendly, but it re-renders on a timer **even when nothing changed** — paying for work no one asked for. A backstop, not a strategy.',
        '**On-demand ISR** (`revalidate = false` + a revalidation call on save) — generated once, then regenerated **only when the content actually changes**. Lowest cost *and* instant freshness. This is our default for anything backed by the database or the site config.',
        '**Dynamic SSR** (`force-dynamic`) — rendered fresh on every request, a database hit every time. It still returns real HTML (so it survives without JS), but the cost grows linearly with traffic. Reserved for architect-only pages.',
        '**Client fetch** — a client component pulls data in the browser on every view. Always live, but it needs JavaScript (no JS, no data) and queries the database on every single view. Fine for a private, interactive panel; a poor choice for a public, high-traffic list.',
      ],
    },
    {
      kind: 'h2',
      text: 'Our default: generate once, refresh only on change',
    },
    {
      kind: 'p',
      text: 'The third row is where a hyper-efficient site lives, and it is worth being concrete. Public pages declare `export const revalidate = false` — generated once, never re-rendered on a clock. Freshness comes from a small, architect-only endpoint that the layer making the change calls the moment it saves:',
    },
    {
      kind: 'code',
      text:
        '// app/api/revalidate/route.ts — purge exactly what changed, on save\n' +
        'import { revalidatePath, revalidateTag } from "next/cache"\n' +
        '\n' +
        'export async function POST(req: Request) {\n' +
        '  const { paths, tags, type } = await req.json().catch(() => ({}))\n' +
        '  tags?.forEach((t: string)  => revalidateTag(t))        // only pages carrying that tag\n' +
        '  paths?.forEach((p: string) => revalidatePath(p, type)) // one route, or its whole subtree\n' +
        '  return Response.json({ revalidated: true })\n' +
        '}\n' +
        '\n' +
        '// On a content write — regenerate just the affected surface, nothing else:\n' +
        'await db.prepare("INSERT INTO products …").run(…)\n' +
        'revalidateTag("products")   // the public list rebuilds once, on the next request',
    },
    {
      kind: 'p',
      text: 'So, to answer the question everyone asks: **no, your visitors do not stare at a stale page for five minutes.** The change is live on the next request after you save, because the save itself purges the cache. The only time a delay exists is if you deliberately rely on a time-based timer as a backstop — useful for content that changes *outside* a save handler (a file edited directly on disk), and nothing else. The naive `revalidate = 300` you see in many tutorials is the worst of both worlds: it re-renders every page every five minutes whether or not anything changed, and still is not truly instant. We do not use it as a default; we use on-demand revalidation, and keep timers only where a human cannot.',
    },
    {
      kind: 'h2',
      text: 'Why the architect’s layer stays dynamic',
    },
    {
      kind: 'p',
      text: 'There is one place we cheerfully break our own rule: the architect’s cockpit — the [autonomous development loop](https://www.fractera.ai/ai-development-loop), the architecture tree, the draft settings — runs dynamically, and we recommend it. The reasoning is the whole point of the canon. A single architect, doing necessary work on pages only they can open, cannot generate harmful load; the compute those pages use is bounded and unavoidable. The danger the rule guards against is the opposite shape entirely: a public page hit by a crowd — some careless, some merely curious, some outright malicious — where every dynamic render multiplies the server bill without limit. So we put dynamic rendering exactly where it cannot hurt you: behind architect-only access. Necessary compute for one owner is not the same animal as unbounded compute for the public, and the architecture treats them differently on purpose.',
    },
    {
      kind: 'h2',
      text: 'Why we do not automate PPR',
    },
    {
      kind: 'p',
      text: 'A fair question from anyone who follows Next closely: what about Partial Prerendering — serving a static shell with a dynamic hole inside it? It is a genuinely good tool, and we deliberately do **not** automate it. PPR is a scalpel for a developer who knows precisely which fragment of a page must be live and which can be frozen, and who wants to balance freshness against server cost with their own hands. That is a conscious decision about business economics versus server economics, and automating it would be pretending to make a judgment that is rightfully the developer’s. We give you the static-first foundation and the on-demand tools; where to cut a dynamic hole is yours to decide.',
    },
    {
      kind: 'quote',
      text: 'The cheapest request is the one your server never computes. Everything in this architecture is a way of computing a page once and serving it a million times — and paying, in full and out loud, only for the freshness you actually need.',
      cite: 'Roma Armstrong, Founder at Fractera',
    },
    {
      kind: 'p',
      text: 'None of this is free of trade-offs, and that is the honest part. Static-first asks you to think about *when* content changes and to call a revalidation on save instead of letting the framework re-render on every hit. It asks your public pages to work without JavaScript, which rules out a few convenient client-only patterns. In exchange, your server does a fraction of the work, your database is queried a fraction as often, your pages survive with JavaScript disabled — and your monthly bill stops scaling with your success. For a small business, that trade is not a detail. It is the difference between a product that compounds and one that quietly bleeds. The same instinct runs through the rest of the platform, from the [enterprise-grade Next.js starter](https://www.fractera.ai/next-aircraft-carrier) to the agents that build on it.',
    },
    {
      kind: 'docref',
      title: 'static-first-rendering.md — the full raw standard',
      summary:
        'The complete document an AI agent reads to apply static-first end to end: the canon, the no-JavaScript foundation, per-route classification, the content-actualization ladder, the on-demand revalidation recipe with code, and why the architect layer stays dynamic. It grows as the platform evolves.',
      href: '/docs/static-first-rendering.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a workspace where every page is static-first by default, and your server bill stops chasing your traffic.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
  ] satisfies BlogBlock[],
}
