// Single source of truth for the Fractera Documentation service (EN only, curated —
// same precedent as the blog, /mcp-info, /ai-workspace-architect). The /documentation
// index renders a FLAT list (date + title + summary, no images), and
// /documentation/<slug> renders a high-quality tutorial page (tags + title + description
// + table of contents + an engaging intro + body). Blocks reuse the blog's BlogBlock type
// and the shared PostBody renderer. These pages present BASIC ideas only — each carries a
// reminder that detailed architecture lives in the LightRAG vector store, queried via the
// Hermes agent in the admin flow.

import type { BlogBlock } from '@/lib/blog/posts'

export type DocEntry = {
  slug: string
  title: string
  description: string // SEO meta description
  summary: string // one-line summary shown in the flat index list
  date: string // ISO publish date
  readingMinutes: number
  tags: string[]
  blocks: BlogBlock[]
  // Optional hero diagram, rendered responsively (mobile portrait / web landscape).
  // `web` doubles as the page's og:image (social/SEO snippet).
  image?: { mobile: string; web: string; alt: string }
  // Optional FAQ rendered at the bottom of the page + emitted as FAQPage JSON-LD.
  faq?: { q: string; a: string }[]
}

const DOCS: DocEntry[] = [
  {
    slug: 'one-button-workspace-ai-consultant',
    title: 'The One-Button Workspace: Turn Any Site Into a Conversation',
    description:
      'How Fractera replaces heavy, hard-to-navigate portals with a single AI consultant button: one click summons an evolving intelligence (Hermes) with global memory (LightRAG) and a growing arsenal of MCP tools, so a visitor just says “help me…” and the site responds — switches language, finds the right page, or acts on the user’s own data.',
    summary:
      'One small AI button, a huge arsenal of MCP tools, and an evolving intelligence with global memory — the minimal interface that turns a website into a conversation.',
    date: '2026-06-16',
    readingMinutes: 12,
    tags: ['AI consultant', 'MCP', 'Agentic UX', 'Self-hosted'],
    blocks: [
      // ── Intro — engaging, "wow, I want this" ────────────────────────────────
      {
        kind: 'p',
        text: 'We are building a project where **interactive conversation with your data** is given first-class — arguably central — importance. And like a lot of people, we are tired of heavy, sluggish, old websites. Worse still are the platforms where you wait minutes for the right information to open, and searching for it takes even longer.',
      },
      {
        kind: 'p',
        text: 'Many people who use portals their entire lives never master the interface. Some platforms are so complex that the people who decide to learn them have to **study at a university and then work in the field professionally** — just to walk an ordinary user from page A, through page B, to service C. It is appallingly clumsy. We fundamentally disagree with it.',
      },
      {
        kind: 'p',
        text: 'The strategy below is meant to change the user experience at its root. We dream that one day a large government portal of some institution could work roughly like this:',
      },
      {
        kind: 'list',
        items: [
          'An ordinary visitor enters the portal and simply asks **“where do I find this?”** — and an AI proposes the most relevant pages, instantly.',
          'That same visitor can ask to **switch the theme** to light or dark, make the site **larger and easier to read**, or see the site **in another language** — and it just happens, in their own view.',
          'An **authenticated user** can ask the site about **their own applications**, request a **statement of paid invoices**, or ask the site to **draft a new request and send it** to the right department.',
          'The **architect-administrator** of that portal signs in under their role and simply says: “we have a new service for the following category of users…” — then lists the tasks, and the **necessary pages and tools are created and published in the project in real time.**',
        ],
      },
      {
        kind: 'p',
        text: 'We will not dive here into testing specifics and the other engineering matters that often demand teamwork — those are solved too, through deployment into a connection secured for specific users. The point stays in the essential thing:',
      },
      {
        kind: 'quote',
        text: 'One small “AI consultant” button. A huge number of MCP tools that summon a smart, evolving intelligence like Hermes — with global memory of every event, like LightRAG — working together with your local database, Redis optimization and other tools. They all engage automatically the moment the user says: “hi, help me…”.',
      },

      // ── How Fractera delivers it ─────────────────────────────────────────────
      { kind: 'h2', text: 'How Fractera makes this real' },
      {
        kind: 'p',
        text: 'The Fractera architecture describes a way to implement exactly this, and ships a **minimal-but-sufficient interface** so you can start working on the project immediately after deployment. You already have a button. You can ask it to do the first simple tasks right away — switch a language, find a page, set a theme.',
      },
      {
        kind: 'p',
        text: 'The deep reason it works is a single, honest boundary: **the brain lives on the server, the action happens in the browser.** A server tool can know what is possible, read configuration, converse, and *propose* an action — but it cannot reach into your open tab. So the per-visitor things (your language, your theme, your navigation) are executed by an agent that lives **inside the browser**, while shared, workspace-wide changes stay server-side. That split is what makes “switch me to French” actually switch the page, instantly, with no reload.',
      },
      {
        kind: 'p',
        text: 'A quick way to feel the boundary: a server-side tool that writes the *default* theme honestly changes the on-disk default, but your already-open tab will not change — the server has no handle to your live tab, and your browser keeps its own theme in `localStorage`. Per-visitor view changes therefore must run client-side.',
      },

      // ── Access tiers ─────────────────────────────────────────────────────────
      { kind: 'h2', text: 'Access tiers — who can do what, without studying a manual' },
      {
        kind: 'p',
        text: 'Every tool carries one of three access tiers, and they nest: `public ⊆ user ⊆ owner`. Tier is decided **on the server from the session**, never trusted from the browser.',
      },
      {
        kind: 'list',
        items: [
          '**public** — a guest (no login). Acts only on their own view: language, theme, readability, finding pages. Nothing private, nothing shared.',
          '**user** — a signed-in end-user. Reaches **their own** data — orders, invoices, requests — scoped to their identity, never anyone else’s.',
          '**owner** — the administrator. Changes shared configuration and global defaults, and grows the project itself.',
        ],
      },
      {
        kind: 'p',
        text: 'A simplified sketch of how the tier is resolved from the request — the real source uses your auth session:',
      },
      {
        kind: 'code',
        text: `// lib/consultant/tier.ts (simplified)
async function resolveTier(req) {
  const session = await getSession(req)      // reads the auth cookie
  if (!session) return 'public'              // anonymous visitor
  if (session.roles.includes('architect')) return 'owner'
  return 'user'                              // signed-in end-user
}`,
      },

      // ── The button + modal ───────────────────────────────────────────────────
      { kind: 'h2', text: 'The entry point: one floating button on every page' },
      {
        kind: 'p',
        text: 'The consultant is a fixed button in the bottom-right corner, mounted globally so it appears on **every** page (it is deliberately NOT tied to any optional layout feature). It opens a small docked chat. The button only renders when the agent is actually reachable — if the brain is not connected, there is no dead button.',
      },
      {
        kind: 'code',
        text: `// the widget asks the server whether the consultant is live
const { available, tier, keyConfigured } = await fetch('/api/consultant').then(r => r.json())
if (!available) return null                  // agent offline → no button
// otherwise render the floating button + modal, with a tier badge: "You: Guest/User/Owner"`,
      },

      // ── Client actions ───────────────────────────────────────────────────────
      { kind: 'h2', text: 'Client actions: the server proposes, the browser executes' },
      {
        kind: 'p',
        text: 'Per-visitor actions (navigate, set language, set theme, set width) are tools the agent **proposes** but the browser **executes**. The server-side tool does no work — it returns a small deferred envelope. The chat turns that envelope into a button; a click runs a matching browser handler.',
      },
      {
        kind: 'code',
        text: `// the server tool returns an envelope, it does NOT act:
{ "__client_action__": true, "tool": "public_view_set_locale", "args": { "locale": "fr" } }

// the browser runs ONLY a known name mapped to a known handler, after validating args:
function runAction(action) {
  switch (action.tool) {
    case 'public_view_navigate_page': return router.push(action.args.to)
    case 'public_view_set_locale':    return router.replace(\`/\${action.args.locale}/...\`)
    case 'public_view_set_theme':     return setTheme(action.args.mode)
    case 'public_view_set_width':     return setWidth(action.args.width)
  }
}`,
      },
      {
        kind: 'p',
        text: 'This is the client-side safety boundary: the browser never executes an arbitrary instruction from the stream — only an **allowlisted** action name, with its arguments validated (e.g. the language must be one the site is actually configured for). The button click itself is the confirmation, so there is no heavy “are you sure?” ritual for harmless cosmetics.',
      },

      // ── The public agent process + security ──────────────────────────────────
      { kind: 'h2', text: 'A separate, sandboxed agent for the public — safe by construction' },
      {
        kind: 'p',
        text: 'The public consultant runs as its **own** agent process, separate from the owner/operator agent. Its toolset is a strict subset: it simply does **not contain** the owner tools, so an anonymous visitor cannot reach them — not because a check blocks them, but because they are not there. A second runtime guard caps the process at tier `user` for defense in depth.',
      },
      {
        kind: 'code',
        text: `# the public agent process is launched with a tier ceiling and its OWN home/key
HERMES_HOME=/root/.hermes-public  FRACTERA_AGENT_MAX_TIER=user  hermes dashboard --port 9129
# its config lists ONLY public-tier tool servers — no owner tool servers, no shared memory`,
      },
      {
        kind: 'p',
        text: 'It binds to loopback only; visitors never reach it directly — they talk to a thin server endpoint that holds the agent token server-side. It also uses its **own** API key, so anonymous traffic can never drain the owner’s key or quota.',
      },

      // ── Talking to the agent ─────────────────────────────────────────────────
      { kind: 'h2', text: 'Talking to the agent: one endpoint, one turn' },
      {
        kind: 'p',
        text: 'The widget only ever talks to a single server endpoint, `/api/consultant`. That endpoint resolves the tier, relays the message to the public agent, and returns a structured turn: the assistant text plus any proposed action buttons (and, when relevant, an authentication prompt or a key-needed flag).',
      },
      {
        kind: 'code',
        text: `// POST /api/consultant  →  one consultant turn
{
  "text": "Admin configured EN, DE, FR. Spanish isn't available — switch to:",
  "actions": [
    { "tool": "public_view_set_locale", "args": { "locale": "fr" }, "label": "Français" },
    { "tool": "public_view_set_locale", "args": { "locale": "de" }, "label": "Deutsch" }
  ]
}`,
      },

      // ── Role / auth escalation ───────────────────────────────────────────────
      { kind: 'h2', text: 'When a request needs sign-in' },
      {
        kind: 'p',
        text: 'When you ask for something your tier cannot do, the consultant does not dead-end you — and it does not blindly assume “admin.” The agent itself decides which of two situations applies, and the widget shows the matching message plus a sign-in button:',
      },
      {
        kind: 'list',
        items: [
          '**Personal data** — you asked about **your own** records (orders, invoices, profile). It says: “to access your personal information, please sign in to your account.” After login your session carries your identity, and a user-tier tool returns only your data.',
          '**Role capability** — you asked for an action not registered for your role. It says: “this function isn’t registered for your role — it may exist for a signed-in user or the administrator.”',
        ],
      },
      {
        kind: 'p',
        text: 'Both lead to a normal sign-in that returns you right back where you were, so you can simply repeat the request. Signing in just establishes your real role and identity; an administrator is not blocked.',
      },

      // ── Growing the project ──────────────────────────────────────────────────
      { kind: 'h2', text: 'It grows with you — new tools in plain language' },
      {
        kind: 'p',
        text: 'Growing the toolset is a first-class part of the architecture, not an afterthought. If you want to add new tools or skills, open the built-in service page at **[your-domain]/ai-draft-settings**. There you describe, in free form, a request to create a new MCP server, a skill, or an instruction — and you pick **who the tool is for** (a guest, a signed-in user, or the owner) right as you draft it. A specialized AI agent picks up that request and, working together with you, turns it into **another tool in your platform.**',
      },
      {
        kind: 'p',
        text: 'The draft you write captures exactly what the real tool needs: its **tier** (public / user / owner), whether it is **read-only or changes state**, and a preview of its tool name. That makes the access decision the moment the tool is conceived — the same tier model described above.',
      },
      {
        kind: 'p',
        text: 'And if that is not enough, you can always use the **terminal** installed on your platform, or **local development**, to extend functionality to whatever limit your own goals require. This project always ships **with source code** and is ready to grow and scale.',
      },
      {
        kind: 'olist',
        items: [
          '**Deploy** — and you immediately have a working site with the consultant button.',
          '**Ask** — the first simple tasks work out of the box.',
          '**Draft** — describe a new tool at **[your-domain]/ai-draft-settings**; pick its tier; an agent materializes it.',
          '**Extend** — drop to the terminal or local dev when you want full control. You own the code.',
        ],
      },

      // ── End-to-end example ───────────────────────────────────────────────────
      { kind: 'h2', text: 'A worked example: “switch this site to Spanish”' },
      {
        kind: 'olist',
        items: [
          'The button is visible because the agent is reachable; you open the modal and ask.',
          'The endpoint resolves your tier (public) and relays the message to the public agent.',
          'The agent reads the configured languages, sees EN/DE/FR and that Spanish is missing.',
          'It proposes a `public_view_set_locale` action for each available language — each returns the deferred envelope.',
          'The chat shows the explanation text plus two buttons: **Français**, **Deutsch**.',
          'You click **Français**; the browser validates `fr` is configured and runs `router.replace(\'/fr/...\')`. The site is now French.',
        ],
      },
      {
        kind: 'p',
        text: 'The “magic” is plain client-side navigation. The server only **knew** and **proposed**; the browser **did**. That is the whole pattern, end to end.',
      },

      // ── Why it is different (real advantages) ────────────────────────────────
      { kind: 'h2', text: 'Why this is genuinely different' },
      {
        kind: 'list',
        items: [
          '**Navigation by intent, not by map.** The user states a goal; the agent finds the path. No more learning a tree of menus to reach service C.',
          '**One entry point, an evolving arsenal.** A single button fronts a growing set of MCP tools — the interface does not get more crowded as capabilities multiply.',
          '**Memory that persists.** LightRAG keeps a global, graph-shaped memory of the project, so the intelligence behind the button gets sharper over time instead of forgetting.',
          '**Sovereign and open.** It runs on your own server, ships with source, and is built to scale — no lock-in, no black box.',
          '**Safe by construction.** A guest physically cannot reach owner tools; private data is scoped to the person who owns it.',
        ],
      },

      // ── Capabilities by access tier ──────────────────────────────────────────
      // NB: per the temporary sync rule, every new MCP tool / skill adds a line here with
      // its access tier (public / user / owner). This list grows as capabilities are built.
      { kind: 'h2', text: 'What you can ask — by access level' },
      {
        kind: 'p',
        text: 'The consultant answers strictly from the capabilities the project declares — it won’t invent data. What’s available depends on who you are. This list grows as new tools are added to the project.',
      },
      { kind: 'h3', text: 'Anyone (guest, no sign-in)' },
      {
        kind: 'list',
        items: [
          '**Switch the theme** — light, dark or system, for your own view.',
          '**Change the language** — to any language the site is configured for.',
          '**Change the content width** — narrower or wider, for your own view.',
          '**Navigate** — “open the pricing page”, “take me to …”.',
          '**Discover pages** — “what sections does this site have?”.',
        ],
      },
      { kind: 'h3', text: 'Signed-in user (your own data)' },
      {
        kind: 'p',
        text: 'After you sign in, the consultant can work with YOUR own records — scoped to your account, never anyone else’s. Ask and it offers a sign-in button. Examples a project can enable: your orders / purchase history, your invoices or payments, your profile or subscription, your viewing/activity history.',
      },
      { kind: 'h3', text: 'Owner / administrator (the workspace operator)' },
      {
        kind: 'p',
        text: 'The site owner — signed in under their role — manages the project itself: global defaults (a default theme/language for everyone), creating new pages and services, and adding new tools or skills (drafted at [your-domain]/ai-draft-settings). The public consultant never performs these; it recognises the request and points you to sign in.',
      },
      {
        kind: 'list',
        items: [
          '**Declare a page, endpoint, or to-do (owner)** — record code work on [your-domain]/architecture: a new page/endpoint to build, a follow-up on a live route, or a deletion request. Skill `declare-architecture-page-or-task`, or tool `owner_arch_create_record`.',
          '**Bundle the work into a build step (owner)** — collect every pending architecture record into one development step on [your-domain]/development-steps, then clear the records. Tool `owner_arch_send_to_steps`.',
          '**Propose a new skill or MCP tool (owner)** — draft a new capability at [your-domain]/ai-draft-settings. Skill `propose-new-agent-skill-or-mcp`, or tool `owner_draft_create_record` / `owner_draft_send_to_steps`.',
        ],
      },

      // ── Reminder ─────────────────────────────────────────────────────────────
      { kind: 'h2', text: 'This page is an introduction — here is where depth lives' },
      {
        kind: 'p',
        text: 'This documentation page is meant for **getting acquainted with the features** — the basic ideas, not the full architecture. It deliberately stays light.',
      },
      {
        kind: 'note',
        text: 'For a detailed technical investigation, query the project’s **LightRAG vector store** — the workspace’s global memory. The most natural way to do that is through the **Hermes agent in the administrator flow**, which can retrieve and explain any part of the architecture on demand. This page only opens the door; the vector store holds the whole house.',
      },
    ],
    faq: [
      {
        q: "What can a guest visitor ask the AI consultant without signing in?",
        a: "A guest (no account, no sign-in) can switch the site language, change the theme (light/dark/system), adjust the content width, navigate to any page by describing it, and discover what sections the site has. All of these act only on their own browser view — nothing shared changes.",
      },
      {
        q: "How does the consultant know what the site can do for a signed-in user?",
        a: "The consultant reads a curated capability declaration that the project owner configures at [your-domain]/ai-draft-settings. Each capability is tagged with its access tier (public / user / owner). When you ask for something your tier does not cover, the consultant offers a sign-in button rather than pretending it can help.",
      },
      {
        q: "Can the AI consultant change something visible to everyone on the site, or only my own view?",
        a: "Per-visitor actions (language, theme, width, navigation) change only your own browser view and never affect other visitors. Owner-tier actions — like setting a new global default theme — are deliberately absent from the public consultant process. Defense by construction: the public agent's toolset simply does not contain owner tools.",
      },
    ],
  },
  {
    slug: 'authentication-roles-and-providers',
    title: 'Authentication, Roles & Providers: One Account, Many Doors',
    description:
      'How Fractera ships a clean, scalable authentication scheme out of the box: start with email + password, then activate Google or magic-link by simply pasting credentials. One account can carry several roles and link several sign-in providers without duplicate users — and you can drive roles straight from your app layer.',
    summary:
      'A clean auth scheme you get for free: email+password to start, one-paste Google / magic-link, one account across many providers, and a full role model you can drive from your own app.',
    date: '2026-06-17',
    readingMinutes: 11,
    tags: ['Authentication', 'Roles', 'OAuth', 'NextAuth', 'Self-hosted'],
    image: {
      mobile: '/Fractera-Mobail-Auth.jpg',
      web: '/Fractera-Web-Auth.jpg',
      alt: 'Fractera Auth architecture diagram — a Next.js 16+ web app (13 parallel-routing slots, the Fractera design system, projects) over the AUTH layer, with the Hermes WebUI agent, code agents, a SQLite local database, LightRAG vector memory and object local storage, all running on the user’s own server.',
    },
    faq: [
      {
        q: 'Does Fractera support Google and email magic-link sign-in?',
        a: 'Yes — both ship built in. You start on email + password, then paste Google or Resend credentials in the secure admin settings and the matching sign-in button appears automatically. Under the hood Auth.js also supports 80+ other providers you can grow into.',
      },
      {
        q: 'Can one person sign in with several providers without creating duplicate accounts?',
        a: 'Yes. A single identity links multiple providers through the accounts table — sign up by email, later add Google, and both point to the same user record. No duplicate users, no tangled profiles.',
      },
      {
        q: 'Is a “guest” just an anonymous visitor?',
        a: 'No. A guest is a real, on-demand identity created the moment an unauthenticated visitor starts doing something worth saving — a cart, a chat. Their work is persisted in the database and attaches automatically to their real account when they sign up, with no data migration.',
      },
    ],
    blocks: [
      // ── Intro ────────────────────────────────────────────────────────────────
      {
        kind: 'p',
        text: 'Authentication is one of those things that quietly decides whether a project feels solid or fragile. We wanted it to feel **solid from the very first deploy** — and to grow with you, not against you. So every Fractera workspace ships with a complete, production-shaped sign-in system already wired in. You do not assemble it; you **turn parts of it on**.',
      },
      {
        kind: 'p',
        text: 'The result is genuinely pleasant to work with. You start with classic **email + password**. The moment you paste a set of provider credentials, a matching **sign-in button appears on its own**. Behind the scenes a single identity can sign in through several different providers and still be **one account** — no duplicate users, no tangled profiles. And because roles are first-class, you can shape who-can-do-what however your project needs.',
      },
      {
        kind: 'quote',
        text: 'One account. Many doors. You decide which doors exist, and you can open new ones by simply pasting a key.',
      },

      // ── Advantages for a project like ours ───────────────────────────────────
      { kind: 'h2', text: 'Why this matters for a project like yours' },
      {
        kind: 'p',
        text: 'If you are building a simple **landing page**, you may not want a sign-up button at all — and you do not have to place one. The scheme is happy to stay invisible. If instead you are building a **deep application**, authentication becomes a tool you actively use: from your own application layer you can call the provided endpoints to **read users, change their roles, grant or revoke access** — driving the permission model directly from your product code, exactly where your business logic lives.',
      },
      {
        kind: 'p',
        text: 'That flexibility — invisible for a landing, programmable for an app — is the whole point. The same foundation serves a one-page site and a multi-role platform.',
      },

      // ── Roles + examples ─────────────────────────────────────────────────────
      { kind: 'h2', text: 'The roles you get out of the box' },
      {
        kind: 'p',
        text: 'A user is not limited to a single role — roles are stored as a **list**, so one person can be, say, both a `manager` and `finance`. Three of these are **access tiers** the platform itself enforces (`guest`, `user`, `architect`); the rest are a ready **business vocabulary** you can assign as your product grows. Here is the full set, with examples of where each could shine:',
      },
      {
        kind: 'list',
        items: [
          '**guest** — a real, on-demand identity (not just an anonymous viewer): created the moment an unauthenticated visitor starts doing something worth saving — a cart, a chat — so their work persists and carries over when they sign up. See "Guest authentication" below.',
          '**user** — any signed-in person; the baseline for “my profile / my data”.',
          '**architect** — the owner who builds and publishes the project (the top tier; gates the admin workspace).',
          '**buyer** — a customer placing orders and using a cart in a shop.',
          '**vip_user** — a premium member with early access, perks, or higher limits.',
          '**subscriber_lite / subscriber_standard / subscriber_max** — tiered subscriptions, e.g. how much content or how many actions each plan unlocks.',
          '**manager** — handles the requests and conversations of their own customers.',
          '**senior_manager** — oversees a group of managers and their pipelines.',
          '**support_manager** — works the support queue and customer questions.',
          '**delivery_manager** — confirms shipments and tracks delivery status.',
          '**finance** — the accountant who confirms payments and reconciles invoices.',
          '**content_editor** — edits articles, pages, and catalogue content.',
          '**admin** — day-to-day operational administration short of full ownership.',
        ],
      },
      {
        kind: 'p',
        text: 'These are not just labels — they are the seed of real, role-specific experiences. On our **Next.js starter template** we are about to build an interactive **playground for every one of these roles**, so you can click through exactly what each role can see and do.',
      },
      {
        kind: 'cta',
        text: 'See the starter template in action — a live deployment where the per-role playgrounds will land:',
        href: 'https://aifa.dev',
        label: 'Open the live starter (aifa.dev)',
      },

      // ── Guest authentication ─────────────────────────────────────────────────
      { kind: 'h2', text: 'Guest authentication — keep a visitor’s work before they sign up' },
      {
        kind: 'p',
        text: 'Most pages need no identity at all. But picture a visitor who starts using your shop and drops a few items into the cart, or someone who writes a couple of messages to your chat / online consultant — and only **then** decides to sign up. You do not want their cart and their messages to vanish. The usual trick is to stash drafts in the browser, but that is fragile and awkward to carry into a real account.',
      },
      {
        kind: 'p',
        text: 'Guest authentication solves this elegantly. You **mark the pages** where it should kick in (the cart, the chat, a checkout step). When an unauthenticated visitor reaches one of those pages, the app **quietly creates a real guest identity** for them — no form, no password — and from that moment everything they do is saved in the database against that identity. When they later create a full account, all of it — the cart, the messages, the history — **attaches to their new account automatically**, with their email and settings layered on top. Nothing is lost, and there is no data migration.',
      },
      {
        kind: 'note',
        text: 'The key idea: a guest is a **real, persistent identity**, not a throwaway anonymous visitor. You simply flag the pages that should turn an anonymous visitor into a guest; visiting them triggers the guest sign-in under the hood, and the eventual sign-up promotes the very same record.',
      },

      // ── The technical picture (general) ──────────────────────────────────────
      { kind: 'h2', text: 'How it works — the general picture' },
      {
        kind: 'p',
        text: 'Under the hood, a dedicated **authentication service** runs alongside the rest of your workspace on its own port, built on **NextAuth (Auth.js)**. Sessions are carried in a signed cookie shared across your project’s subdomains, so signing in once works everywhere it should. To make modern sign-ins (Google, magic-link) persist properly, the service uses a small **database adapter** together with the providers — a standard, well-trodden combination.',
      },
      {
        kind: 'p',
        text: 'The same service quietly **covers every surface of your workspace**. Your public site stays fast and open where it should be, while administrative areas require the right role. The admin platform, each coding agent, the vector memory, the Hermes brain, and the built-in web chat are all gated through the same identity — directly or through the reverse proxy — so there is one source of truth for “who is this, and what may they do”. There are two modes: an open onboarding mode on a bare IP, and a strict, role-gated secure mode once you attach your own domain with HTTPS.',
      },
      {
        kind: 'h3', text: 'The database tables that make it work',
      },
      {
        kind: 'p',
        text: 'The system relies on four required tables, and the relationship between them is the clever part:',
      },
      {
        kind: 'list',
        items: [
          '**users** — one row per person. It stores the essentials and a bit more: email, display name, the role list, sign-in method, verification and active/blocked status — and notably the **user’s image** (for example a Google profile picture), plus locale and timezone preferences and a free-text bio.',
          '**accounts** — one row per **external provider linked to a user**. This is what lets a single account work with **one or several providers at the same time** without ever creating a duplicate person: sign up by email, later add Google, and the system links the new provider to the **same** user instead of making a second one.',
          '**sessions** — present for completeness (sessions actually travel in the signed cookie).',
          '**verification_tokens** — the single-use tokens behind magic-link / email sign-in.',
        ],
      },
      {
        kind: 'p',
        text: 'A few behaviours are worth knowing as the architect. The **database activates on first use** — the first request that needs identity opens it and ensures the tables exist. The **very first person to sign in becomes the architect** automatically (through any provider), and — importantly — **the architect cannot remove their own architect rights**; only another architect can change someone else’s roles. Roles themselves are always a **list of strings**, never a single value, so multi-role users are the norm, not a special case.',
      },
      {
        kind: 'p',
        text: 'Activating more sign-in methods is deliberately effortless. The two providers — **Google** and the **magic-link (email)** flow — are already wired under the hood. You provide each one’s credentials in the secure admin settings, and the corresponding **button appears automatically** on the sign-in page. Remove the credentials and the button disappears. Nothing to redeploy.',
      },

      // ── Login+password caveat ────────────────────────────────────────────────
      { kind: 'h2', text: 'Starting simple: email + password (and its one caveat)' },
      {
        kind: 'p',
        text: 'Your project starts you on a solution where you simply use **login and password**. It is the fastest way to get going. Its one honest limitation: there is currently **no technical flow to recover a lost password** — no “reset password” email. That is perfectly fine for an **early stage** of an application, and it is exactly why we recommend turning on a provider early: Google and magic-link are **passwordless and self-recovering** by nature, so a forgotten password stops being a dead end.',
      },

      // ── All providers ────────────────────────────────────────────────────────
      { kind: 'h2', text: 'Every sign-in method you can grow into' },
      {
        kind: 'p',
        text: 'The foundation (Auth.js) ships with **over 80 built-in providers**, and the schema scales to all of them without structural change — one account keeps linking new providers through the same tables. The complete built-in catalogue:',
      },
      {
        kind: 'p',
        text: '42 School, Apple, Asgardeo, Atlassian, Auth0, Authentik, Azure Active Directory, Azure Active Directory B2C, Azure DevOps, Battle.net, Beyond Identity, Bitbucket, Box, BoxyHQ SAML, Bungie, ClickUp, Cognito, Coinbase, Descope, Discord, Dribbble, Dropbox, DuendeIdentityServer6, EVE Online, FACEIT, Facebook, Figma, Foursquare, Freshbooks, FusionAuth, GitHub, GitLab, Google, HubSpot, Hugging Face, IdentityServer4, Instagram, Kakao, Keycloak, Kinde, LINE, LinkedIn, Logto, Mail.ru, Mailchimp, Mastodon, Mattermost, Medium, Microsoft Entra ID, Naver, Netlify, Notion, Okta, OneLogin, Osso, Osu!, Passage, Patreon, Pinterest, Pipedrive, Reddit, Salesforce, Slack, Spotify, Strava, TikTok, Todoist, Trakt, Twitch, Twitter, United Effects, VK, Webex, Wikimedia, WordPress.com, WorkOS, Yandex, ZITADEL, Zoho, Zoom — plus email/magic-link providers (Resend, Nodemailer, and others) and the built-in Credentials (email + password) flow.',
      },
      {
        kind: 'note',
        text: 'One of the most important rules: **add the providers you want early, while your application is still small.** Wiring identity into a young codebase is cheap and safe.',
      },

      // ── Production risk ──────────────────────────────────────────────────────
      { kind: 'h2', text: 'A word of caution for production apps' },
      {
        kind: 'p',
        text: 'If your application already has a **sizeable codebase, is running in production, and has real customers**, do not experiment with authentication directly on it. The safer path: **deploy a separate server**, bring up and test the new providers there, and only then ask the **AI agent inside your production application to carefully study how authentication is wired in your specific project** before changing anything.',
      },
      {
        kind: 'p',
        text: 'Why this matters: if you, as the architect, lose access during a change for any reason, your application keeps running on its app layer — but it could, in theory, end up **locked for sign-in**. That makes authentication experiments meaningfully risky for an unqualified developer. Respect that risk, and let an AI agent map the terrain first.',
      },

      // ── Footnote ─────────────────────────────────────────────────────────────
      { kind: 'h2', text: 'Want the full, exact picture?' },
      {
        kind: 'note',
        text: 'This page paints the scheme in broad strokes. For a complete, detailed investigation of how authentication is wired in your own project, ask your **Hermes agent connected to the LightRAG vector store** — or any AI agent you use in your project — to study it. The architecture is documented in depth for exactly that purpose; an agent can retrieve and explain every part on demand.',
      },
    ],
  },
]

export function getAllDocs(): DocEntry[] {
  return [...DOCS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find(d => d.slug === slug)
}

export function getDocSlugs(): string[] {
  return DOCS.map(d => d.slug)
}
