import type { DocBlock } from '../../_lib/types'

export const en = {
  title: 'Static-First, on Purpose: The Server-Bill Economics of an Agentic Engineering Infrastructure',
  description:
    'Why Fractera enforces static-first rendering with unusual rigor, and the honest price it costs you. A field guide to the ways content reaches a page — SSG, time-based ISR (the lazy, sleep-when-idle default), optional on-demand revalidation, dynamic SSR, and client fetch — mapped to database load, JavaScript dependence, traffic and the one number that decides a small business: the monthly compute bill.',
  summary:
    'How content reaches a page, what each strategy costs in server compute and database queries, why time-based ISR lets your server sleep when no one is looking, and why dynamic rendering is a last resort — with the price stated plainly.',
  faq: [
    {
      q: 'If I add a row to my content — say a third dog to a list of two — when do visitors see it?',
      a: 'With time-based ISR (the default), the next visitor who arrives after the page’s revalidate window (say ten minutes) is served the current cached page and quietly triggers a background rebuild of that one page; the visitor after them sees three dogs. A page nobody visits is never rebuilt, and while there is no traffic the server sleeps. If you need the third dog to appear with zero delay, opt into on-demand revalidation: set that page to revalidate = false and call revalidateTag in the handler that adds the dog, so the change is live on the very next request. Data fetched in the browser (an interactive panel) is always live, since it is queried on every view.',
    },
    {
      q: 'Does time-based ISR rebuild my whole site on a timer, even when nobody is looking?',
      a: 'No. ISR is lazy and driven by traffic, not by a clock. A page is regenerated only when it is requested after its window has passed, and only that one page. With no traffic the server does nothing — it sleeps. The cost is therefore bounded by your real traffic, not by your page count: a thousand pages nobody visits cost nothing to keep fresh.',
    },
    {
      q: 'Why does Fractera keep the architect/admin pages dynamic if dynamic rendering is discouraged?',
      a: 'Because a single architect cannot generate harmful load. The service cockpit (Architecture, AI Core, Development Steps, and so on) is visited by one owner doing necessary work; its per-request compute is bounded and unavoidable. The rule exists to protect you from the opposite case: public pages hit by many visitors — some careless, some curious, some malicious — where every dynamic render multiplies your server cost. So dynamic rendering is allowed exactly where it cannot hurt the bill: behind architect-only access.',
    },
    {
      q: 'What is the real cost the architecture is optimizing for?',
      a: 'The business’s server bill — compute and database load — not the developer’s token budget. Tokens are spent once, while building, while compute is spent forever, on every visitor, for as long as the product lives. A project that renders dynamically by default scales its server cost linearly with traffic, which is exactly where small businesses fail to close their unit economics. Static-first turns most of that recurring cost into a one-time generation that a sleeping server reuses.',
    },
  ],
  blocks: [
    {
      kind: 'founder',
      text: 'I want to say the quiet part out loud. While a lot of developers are busy worrying about how to save tokens to build their apps, the real value was never in how much the developer saves. It is in how much money the business spends on compute for its own server, in its own business, every single month. That is where the real cost lives. Tokens you spend once. A server you pay for forever — on every visitor, for as long as the product is alive. So we built our architecture around that number, and we are not shy about the price it asks of you in return.',
    },
    {
      kind: 'p',
      text: 'Fractera is an [agentic engineering infrastructure](https://www.fractera.ai/): you deploy a workspace where AI agents build your software on your own server. And because it is *your* server, the architecture is obsessed with one thing most starters quietly ignore — keeping the recurring cost of running your product as close to zero as physics allows. This document is the honest version of that promise: how content reaches a page, the trade-offs between the options, and the deliberate, slightly uncomfortable price we ask you to pay for hyper-efficiency.',
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
      text: 'The ways content reaches a page',
    },
    {
      kind: 'p',
      text: 'Everything comes down to one question: when a visitor asks for a page, where does the content come from? The honest answers differ in **when a change becomes visible**, **how many database queries happen per visit**, **whether they need JavaScript to work at all**, and **how much server compute they burn**. Read the table top to bottom as cheapest to most expensive, per visitor:',
    },
    {
      kind: 'code',
      text:
        'Strategy               When a change shows    DB / visit     Needs JS   Server cost     Use for\n' +
        '─────────────────────  ──────────────────    ───────────    ────────   ─────────────   ──────────────────────────\n' +
        'Static (SSG)           on redeploy           none           no         lowest          build-time content\n' +
        'ISR, time-based (N)    within N sec, lazily   ~1 per N *     no         low             the default for most content\n' +
        'ISR + on-demand        instant, on change    1 per change   no         low + fresh     optional: when you wire a purge\n' +
        'Dynamic SSR            every request         every req      no **      high            architect-only cockpit\n' +
        'Client fetch           every view            every view     YES        medium          private panels, not public lists\n' +
        '\n' +
        '*  Lazy and traffic-bound: a page re-renders only when REQUESTED after its N-second window, and only\n' +
        '   that page. With no traffic the server sleeps — a page nobody visits is never re-rendered.\n' +
        '** Dynamic SSR still ships real HTML, but recomputes and re-queries the database on every request.',
    },
    {
      kind: 'h2',
      text: 'Time-based ISR: the lazy default that lets your server sleep',
    },
    {
      kind: 'p',
      text: 'This is the strategy we recommend for almost everything, and it is worth describing precisely, because it is widely misunderstood. You set one line — `export const revalidate = 600` — and the page behaves like this: it is generated once and served from cache. While nobody visits, the server does **nothing at all** — it sleeps, for an hour or a year. When a visitor arrives and more than the window (here, 600 seconds) has passed, they are served the existing cached page **instantly**, and that single page is regenerated in the background; the next visitor sees the fresh version. The key point everyone gets wrong: **only the page that was actually requested is regenerated.** There is no clock rebuilding your whole site, and a page no one opens is never touched.',
    },
    {
      kind: 'p',
      text: 'Concretely — your dog example. You publish a page with two dogs. Later you add a third. The next visitor after the ten-minute window sees the page rebuild and gets three dogs; everyone after them gets three. Your cats page, which no one touched, stays exactly as it was — untouched, costing nothing. The cost of this whole scheme is bounded by your **real traffic**, not by your page count: a thousand quiet pages cost nothing to keep fresh.',
    },
    {
      kind: 'code',
      text:
        '// app/dogs/page.tsx — generated once, then refreshed lazily on a visit after the window\n' +
        'export const revalidate = 600   // at most one rebuild per 10 minutes, per page, only on traffic\n' +
        '\n' +
        'export default async function Page() {\n' +
        '  const dogs = await db.query("SELECT * FROM dogs")  // runs only during a (rare) regeneration\n' +
        '  return <DogList dogs={dogs} />\n' +
        '}',
    },
    {
      kind: 'p',
      text: 'The one honest cost: a page that is visited constantly but changes rarely still rebuilds once per window — one redundant regeneration, and one database query, every ten minutes. That is a small, fixed, traffic-bounded price, and for the overwhelming majority of content it is exactly the right trade: your server sleeps when idle, your pages are fast and static and work without JavaScript, and freshness lands inside a window you choose.',
    },
    {
      kind: 'h2',
      text: 'When you need it instant: on-demand revalidation (optional)',
    },
    {
      kind: 'p',
      text: 'If one particular change must be visible immediately — no window at all — there is a refinement. Set `revalidate = false` so the page never refreshes on its own, and have the handler that changes the data **explicitly purge** that page the moment it writes. The catch, and the reason this is opt-in rather than our default, is discipline: you must remember to call the purge on **every** write, or the page freezes — two dogs forever. Time-based ISR is the default precisely because it is self-correcting and needs no wiring; on-demand is the tool you reach for when a specific page genuinely cannot tolerate any delay.',
    },
    {
      kind: 'code',
      text:
        '// In the handler that adds a dog — purge just that page (pairs with revalidate = false on it)\n' +
        'import { revalidateTag } from "next/cache"\n' +
        '\n' +
        'await db.prepare("INSERT INTO dogs …").run(…)\n' +
        'revalidateTag("dogs")   // the dogs page rebuilds once, on the very next request — instant',
    },
    {
      kind: 'h2',
      text: 'Why the architect’s layer stays dynamic',
    },
    {
      kind: 'p',
      text: 'There is one place we cheerfully break our own rule: the architect’s cockpit — the [autonomous development loop](https://www.fractera.ai/ai-development-loop), the architecture tree, the draft settings — runs dynamically, and we recommend it. The reasoning is the whole point of the canon. A single architect, doing necessary work on pages only they can open, cannot generate harmful load; the compute those pages use is bounded and unavoidable. The danger the rule guards against is the opposite shape entirely: a public page hit by a crowd — some careless, some merely curious, some outright malicious — where every dynamic render multiplies the server bill without limit. So we put dynamic rendering exactly where it cannot hurt you: behind architect-only access.',
    },
    {
      kind: 'h2',
      text: 'Why we do not automate PPR',
    },
    {
      kind: 'p',
      text: 'A fair question from anyone who follows Next closely: what about Partial Prerendering — serving a static shell with a dynamic hole inside it? It is a genuinely good tool, and we deliberately do **not** automate it. PPR is a scalpel for a developer who knows precisely which fragment of a page must be live and which can be frozen, and who wants to balance freshness against server cost with their own hands. That is a conscious decision about business economics versus server economics, and automating it would be pretending to make a judgment that is rightfully the developer’s. We give you the static-first foundation and the tools; where to cut a dynamic hole is yours to decide.',
    },
    {
      kind: 'quote',
      text: 'The cheapest request is the one your server never computes. Everything in this architecture is a way of computing a page once and serving it a million times — letting the machine sleep when no one is looking, and paying, in full and out loud, only for the freshness you actually need.',
      cite: 'Roma Armstrong, Founder at Fractera',
    },
    {
      kind: 'p',
      text: 'None of this is free of trade-offs, and that is the honest part. Static-first asks you to accept a freshness window (or to wire a purge where you cannot), and it asks your public pages to work without JavaScript, which rules out a few convenient client-only patterns. In exchange, your server sleeps when idle, does a fraction of the work under load, queries your database a fraction as often, and your pages survive with JavaScript disabled — so your monthly bill stops scaling with your success. For a small business, that trade is not a detail. It is the difference between a product that compounds and one that quietly bleeds. The same instinct runs through the rest of the platform, from the [enterprise-grade Next.js starter](https://www.fractera.ai/next-aircraft-carrier) to the agents that build on it.',
    },
    {
      kind: 'docref',
      title: 'static-first-rendering.md — the full raw standard',
      summary:
        'The complete document an AI agent reads to apply static-first end to end: the canon, the no-JavaScript foundation, per-route classification, the content-actualization ladder, how time-based ISR sleeps and refreshes lazily, optional on-demand revalidation, and why the architect layer stays dynamic. It grows as the platform evolves.',
      href: '/docs/static-first-rendering.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a workspace where every page is static-first by default, your server sleeps when idle, and your bill stops chasing your traffic.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
  ] satisfies DocBlock[],
}
