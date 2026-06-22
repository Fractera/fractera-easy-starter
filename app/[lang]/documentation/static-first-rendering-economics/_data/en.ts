import type { DocBase } from '../../_lib/types'

// English base document for /documentation/static-first-rendering.
// Optimized for sharp human readability and strict AI token context efficiency.
export const en: DocBase = {
  title: 'Static-First Rendering: Minimizing Infrastructure Server Costs',
  description:
    'A technical breakdown of Fractera’s strict static-first data architecture. Learn how time-based ISR, on-demand revalidation, and strategic caching isolate database loads to keep your recurring server bills near zero.',
  summary:
    'An engineering guide to content rendering strategies, detailing their impact on compute cycles and database overhead, and explaining why lazy, traffic-driven ISR is the baseline standard.',
  faq: [
    {
      q: 'How long does it take for a backend data modification to become visible to users?',
      a: 'By default, time-based Incremental Static Regeneration (ISR) handles updates lazily. When a change occurs, the next visitor past the revalidation window (e.g., 10 minutes) receives the cached page while a background build updates the disk. Subsequent visitors see the fresh data. If you require zero-delay updates, you can use on-demand revalidation by setting the page parameter to false and executing revalidateTag within your data mutation handler.',
    },
    {
      q: 'Does time-based ISR run automated site-wide rebuilds on a background clock?',
      a: 'No. The ISR engine is lazy and strictly traffic-driven. A page is only regenerated when a direct request hits the server after its specific time window expires, and the mutation is restricted to that single file. If there is no visitor traffic, the background server does not execute builds, ensuring that maintaining thousands of idle pages costs nothing.',
    },
    {
      q: 'Why are internal administrative and cockpit surfaces kept on dynamic rendering?',
      a: 'Because a single developer or administrator accessing secure cockpits cannot generate critical system load. Administrative surfaces (Architecture view, AI Core setups, and execution steps) are isolated to authorized owners. Dynamic rendering is restricted here because the compute requirements are tightly bounded, while public routes are kept static to prevent traffic spikes from inflating server costs.',
    },
    {
      q: 'What specific operational metric is this static-first architecture optimizing?',
      a: 'The recurring monthly server bill, measured in raw compute cycles and database round-trips. Unlike build-time AI tokens which are paid once, dynamic runtime rendering consumes server hardware resources on every visitor request. Adopting a static-first default converts ongoing operational costs into flat, predictable generation baselines.',
    },
  ],
  blocks: [
    {
      kind: 'founder',
      text: 'Let’s state the quiet part out loud: application development metrics often focus entirely on the developer’s build-time token budget, but the real cost bottleneck is the recurring monthly compute invoice for your production infrastructure. AI tokens are a one-time investment during code generation. Run-time server compute runs forever on every visitor interaction. We engineered this entire architecture to push that recurring bill down to absolute zero.',
    },
    {
      kind: 'p',
      text: 'Fractera operates as a specialized [agentic engineering infrastructure](https://www.fractera.ai/). You provision a secure server workspace where AI models write and compile applications on your own virtual host. Because you control the underlying hardware, our system is built to minimize operating expenses. This specification documents our content rendering matrix, the performance trade-offs, and how to maintain hyper-efficient database utilization.',
    },
    {
      kind: 'callout',
      title: 'Real-Time Administrative Cockpits',
      text: 'The master administration pages inside a Fractera workspace update dynamically as mutations occur. When an agent or developer alters file trees, the visual panels reflect changes automatically. This dynamic behavior is intentional, and it is safe because these routes are locked behind private, architect-only credentials.',
    },
    {
      kind: 'h2',
      text: 'The Architecture Bottleneck: Runtime Multipliers',
    },
    {
      kind: 'p',
      text: 'Unchecked dynamic architectures scale poorly. Generating fresh pages on every request is manageable during low-traffic testing, but under production volumes, it triggers compounding database queries and demands expensive server scaling. For independent operations and growing businesses, this unconstrained resource drain is what breaks application unit economics.',
    },
    {
      kind: 'p',
      text: 'The primary challenge is that dynamic rendering is often the easiest default setup in modern frameworks. Without strict architecture rules, repositories naturally drift toward runtime queries. Fractera resolves this by enforcing a hard infrastructure boundary: **dynamic routes are disabled by default unless explicitly verified and signed off for secure administrative use.** Restricting runtime queries ensures your server remains highly optimized.',
    },
    {
      kind: 'h2',
      text: 'The Rendering Matrix: Data Retrieval Channels',
    },
    {
      kind: 'p',
      text: 'Evaluating data pipeline efficiency depends on clear infrastructure metrics: **when modifications go live**, **database queries generated per visit**, **JavaScript client dependencies**, and **raw server compute load**. The matrix below outlines these strategies from lowest to highest compute cost:',
    },
    {
      kind: 'code',
      text:
        'Strategy               Data Freshness Window   Database Load   Client JS   Server Compute Cost   Target Use Case\n' +
        '─────────────────────  ──────────────────────  ──────────────  ──────────  ───────────────────   ───────────────────────────\n' +
        'Static (SSG)           On repository deploy    None            No          Lowest                Immutable static assets\n' +
        'ISR, time-based (N)    Lazy window (N seconds) ~1 per N sec*   No          Low                   Standard public content\n' +
        'ISR + On-Demand        Instant on mutation     1 per mutation  No          Low (Fresh)           Data-driven layouts\n' +
        'Dynamic SSR            Instant on request      Every request   No**        High                  Secure admin panels\n' +
        'Client Fetch           Instant on client view  Every view      YES         Medium                Private user dashboards\n' +
        '\n' +
        '* Lazy and traffic-dependent: pages only re-render when requested after the designated time window expires.\n' +
        '** Dynamic SSR outputs valid HTML but executes database round-trips and layout re-evaluation on every request.',
    },
    {
      kind: 'h2',
      text: 'Time-Based ISR: Lazy Execution Protocols',
    },
    {
      kind: 'p',
      text: 'We leverage time-based Incremental Static Regeneration (ISR) as our primary production standard. By declaring a single control parameter—`export const revalidate = 600`—the layout is compiled once and served directly from cache. While the route receives no traffic, the server remains idle. When a visitor requests a page after the 600-second window, they are instantly served the cached asset, while a background process lazily triggers a fresh compilation for the next user. Only the specific file requested is rebuilt, leaving the rest of the file tree untouched.',
    },
    {
      kind: 'p',
      text: 'Consider an active content directory: adding a new database record updates only the targeted page layout when its validation window closes. All other sibling pages remain cached on disk, generating zero database overhead. This ensures that operational server load scales with your actual traffic density rather than your total database row count.',
    },
    {
      kind: 'code',
      text:
        '// app/items/page.tsx — Compiled once, refreshed lazily upon active visitor traffic\n' +
        'export const revalidate = 600   // Maximum of one background compilation per 10 minutes per page\n' +
        '\n' +
        'export default async function Page() {\n' +
        '  const items = await db.query("SELECT * FROM inventory")  // Executes strictly during background rebuilds\n' +
        '  return <InventoryList items={items} />\n' +
        '}',
    },
    {
      kind: 'p',
      text: 'The only fixed trade-off is that high-traffic routes will run one background compilation per designated window. This represents a predictable, tightly bounded resource cost. For public interfaces, this trade-off delivers fast, static execution that works independently of client-side JavaScript.',
    },
    {
      kind: 'h2',
      text: 'Immediate Synchronization: On-Demand Revalidation',
    },
    {
      kind: 'p',
      text: 'When application workflows require data modifications to reflect instantly across public layouts, you can utilize on-demand revalidation. Setting `revalidate = false` keeps the page static until the data mutation handler explicitly purges the specific cache tag upon a database write. This approach requires consistent use of cache invalidation commands across your mutation handlers to prevent pages from freezing, making it ideal for targeted, highly critical data updates.',
    },
    {
      kind: 'code',
      text:
        '// Executed within the data mutation handler — purges cache for the targeted route instantly\n' +
        'import { revalidateTag } from "next/cache"\n' +
        '\n' +
        'await db.prepare("INSERT INTO inventory ...").run(...)\n' +
        'revalidateTag("inventory")   // Triggers an immediate, isolated rebuild on the very next inbound request',
    },
    {
      kind: 'h2',
      text: 'Why Administrative Control Systems Remain Dynamic',
    },
    {
      kind: 'p',
      text: 'We apply dynamic rendering to the internal architect panels, including the [autonomous development loop](https://www.fractera.ai/ai-development-loop), system architecture configurations, and project settings. Because these routes are restricted to authenticated administrators, they cannot be abused to generate malicious or runaway server load. This isolates higher-compute operations behind secure access barriers while protecting public endpoints.',
    },
    {
      kind: 'h2',
      text: 'Deterministic Caching Boundaries over Automated PPR',
    },
    {
      kind: 'p',
      text: 'While Next.js’s Partial Prerendering (PPR)—which nests dynamic holes inside static shells—is an effective tool, Fractera deliberately avoids automating it. Selecting where to split layouts between static structures and live fragments is a deliberate architectural and cost decision. We build the core static-first foundation and provide the tools, leaving the precise boundaries of your layout components under your direct control.',
    },
    {
      kind: 'quote',
      text: 'The most efficient request is the one your infrastructure never has to compute. This architecture is engineered to build a page once and serve it millions of times from disk cache, allowing your host to minimize resource use.',
      cite: 'Roma Armstrong, Founder at Fractera',
    },
    {
      kind: 'p',
      text: 'Enforcing a strict static-first pattern means public routes are optimized to load fast even without client-side JavaScript, bypassing brittle client-only logic. In return, your host infrastructure scales smoothly under sudden traffic surges, database connection pools remain protected, and your operating costs stay flat. This financial predictability is what separates software that runs efficiently from applications that drain resources. This design philosophy guides our entire platform, from our [enterprise Next.js starter architecture](https://www.fractera.ai/next-aircraft-carrier) to the autonomous agents that maintain it.',
    },
    {
      kind: 'docref',
      title: 'static-first-rendering.md — Complete Technical Standard',
      summary:
        'The primary engineering manual used by AI agents to implement system-wide static rendering, detailing no-JS execution rules, route classification parameters, and cache revalidation pipelines.',
      href: '/docs/static-first-rendering.md',
    },
    {
      kind: 'cta',
      text: 'Deploy a static-first workspace where your server resource consumption remains optimized and independent of traffic volume.',
      href: 'https://www.fractera.ai/',
      label: 'Deploy with AI',
    },
  ],
}