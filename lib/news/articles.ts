// Single source of truth for Fractera News (EN only, curated — same precedent as
// blog and documentation). Chronological order, newest first. Blocks reuse the
// blog's BlogBlock type and the shared PostBody renderer. `ogImage` is required
// for social snippets; `heroImage` is optional — omit until the asset is ready.

import type { BlogBlock } from '@/lib/blog/posts'

export type NewsArticle = {
  slug: string
  title: string
  subtitle?: string
  description: string     // SEO meta description
  summary: string         // one-liner shown in the flat index list
  date: string            // ISO date
  readingMinutes: number
  tags: string[]
  author?: { name: string; role: string }
  heroImage?: string      // path relative to /public — omit until asset delivered
  ogImage: string         // path relative to /public or absolute URL
  blocks: BlogBlock[]
  faq?: { q: string; a: string }[]
}

const ARTICLES: NewsArticle[] = [
  {
    slug: 'ai-draft-settings-evolutionary-pipeline',
    title: 'AI Draft Settings: The Foundation of Fractera\'s Evolutionary AI Skills Pipeline',
    subtitle: 'Every framework starter ships with this page — and it is already rewriting how applications evolve',
    description:
      'Fractera introduces the AI Draft Settings page — the first link in a seven-stage evolutionary pipeline for AI skills. Ships with every framework by default, supports both UI and agent-driven interaction, and lays the ground for fully autonomous capability evolution.',
    summary:
      'A deep look at the AI Draft Settings page — the control surface that lets architects and AI agents co-author new capabilities, bundled as standard with every framework starter.',
    date: '2026-06-19',
    readingMinutes: 5,
    tags: ['AI Draft Settings', 'Evolutionary Pipeline', 'Multi-Framework', 'MCP'],
    author: { name: 'Fractera Team', role: 'Product' },
    ogImage: '/fractera-logo.jpg',
    blocks: [
      // ── Lead paragraph ───────────────────────────────────────────────────────
      {
        kind: 'p',
        text: 'Fractera is introducing the **AI Draft Settings page** as the first and foundational link in its evolutionary pipeline for AI skills — a system that lets architects and AI agents co-author new capabilities, propose MCP tools, and evolve a workspace\'s intelligence layer without touching production configuration directly.',
      },
      // ── What is it ───────────────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'What Is the AI Draft Settings Page?',
      },
      {
        kind: 'p',
        text: 'The AI Draft Settings page is a built-in control surface for the AI behavior layer of your workspace. Unlike a conventional admin panel, it does not configure business logic — it configures the intelligence layer itself. Here, architects define what AI agents are capable of, which instructions they follow, what skills they carry, and which MCP tools they can call.',
      },
      {
        kind: 'h3',
        text: 'Ships with Every Framework — By Default',
      },
      {
        kind: 'p',
        text: 'Every framework starter deployed through Fractera includes the AI Draft Settings page as part of the standard delivery. Whether you launch a Next.js workspace, a SvelteKit project, or a Django backend, this page is always present — not an optional module or an add-on, but pre-wired to all six AI agent personas in the workspace from the first deploy.',
      },
      {
        kind: 'list',
        items: [
          'Six agent personas pre-configured: Claude Code, Codex CLI, Gemini CLI, Qwen Code, Kimi Code, and Hermes',
          'Live reference view of each agent\'s instruction documents and active skills, pulled from the filesystem in real time',
          'Draft layer for staging new capabilities before they go into effect',
          'MCP tool registry per agent, browsable and editable through a Monaco-powered source view',
          'Danger zone for controlled removal of declarations — with a diff view and staged confirmation',
        ],
      },
      // ── Two ways to interact ─────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Two Ways to Interact: UI and AI Agents',
      },
      {
        kind: 'h3',
        text: 'Manual Interaction via the Interface',
      },
      {
        kind: 'p',
        text: 'From the UI, you open the AI Draft Settings page and find a dual-panel layout. The left column lists the six agent personas. Click any one and the right panel populates with that agent\'s live instruction documents, skills directory, and registered MCP tools. These are read-only reference views — the authoritative files on disk. The draft layer sits on top: you annotate the change you want, add a skill idea or a new MCP tool proposal, and save. The draft is tagged "pending" and waits for an agent to execute it.',
      },
      {
        kind: 'h3',
        text: 'AI Agent Integration via HTTP and MCP Protocol',
      },
      {
        kind: 'p',
        text: 'The page is not only a human interface. Any of the six AI coding agents can interact with it programmatically. Claude Code, for example, during an autonomous development session, can call the HTTP-native skill **`propose-new-agent-skill-or-mcp`** — it sends a description of the new capability, the target agent persona, and the proposed implementation, and the draft appears on the page immediately. Hermes reaches the same endpoint through a dedicated MCP bridge (**`owner_draft_create_record`** on the `ai-draft-bridge` server, port 3221). Every agent is self-sufficient: each carries its own copy of the skill and can act independently, without Hermes or any intermediary being online.',
      },
      // ── Evolving applications ────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Evolving Applications: From Semi-Automatic to Fully Automatic',
      },
      {
        kind: 'p',
        text: 'In the current semi-automatic mode, the workflow runs like this: an architect expresses a wish on the AI Draft Settings page — a new skill, a new MCP tool, a change to an agent\'s instructions. The **Launch** function bundles all pending drafts into a single development step. An AI agent picks it up, implements it, and the new capability ships — often within the same working session. The architect provides the direction; the AI provides the execution.',
      },
      {
        kind: 'p',
        text: 'This covers the first two stages of a planned seven-stage evolutionary pipeline. As the remaining stages are built — automated testing, regression detection, visual diff, usage analytics, and closed-loop optimization — the pipeline will require progressively less human involvement, until the full cycle runs end-to-end in **fully automatic mode**: a need surfaces, the AI agent plans and implements it, verifies it, ships it, and logs the outcome — with no one pressing a button.',
      },
      {
        kind: 'quote',
        text: 'The AI Draft Settings page is where human intent and machine capability meet. Today it needs a trigger. Tomorrow it will not.',
        cite: 'Fractera product team',
      },
      // ── Multi-framework strategy ─────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Multi-Framework Expansion: Every Popular Stack Gets Its Own AI-Optimized Transport',
      },
      {
        kind: 'p',
        text: 'Fractera is built on a single conviction: AI-native development should not be the exclusive territory of Next.js. The platform is expanding to support every popular web framework and application stack — and each one will ship with the same integration depth that Next.js developers have today.',
      },
      {
        kind: 'p',
        text: 'The approach is direct: for each framework, Fractera builds a dedicated **ai-workspace transport** — a preconfigured integration layer that connects the framework to the Fractera substrate services. The transport handles framework-specific wiring so that developers do not have to discover it themselves.',
      },
      {
        kind: 'h3',
        text: 'What Each Framework Gets',
      },
      {
        kind: 'list',
        items: [
          '**Integrated local database** — SQLite backed by the Fractera data service, with a framework-idiomatic data layer pre-configured',
          '**Authentication** — session management and a role model (guest, user, architect) adapted to the framework\'s own auth conventions',
          '**Object storage** — local file and media storage mounted at the framework level, with upload and retrieval APIs ready from day one',
          '**Full AI agent stack** — all five coding agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) and the Hermes orchestration brain, connected to the project from the first deploy',
          '**Unified MCP architecture** — the same MCP-first execution model regardless of stack; agents call tools, not raw APIs',
        ],
      },
      {
        kind: 'p',
        text: 'Frameworks with full transport support arriving on a rolling schedule: **React, Vue, Angular, SvelteKit, Nuxt, Astro, Remix, Gatsby, TanStack Start, SolidStart, Qwik, React Router, Django, Flask, FastAPI, Laravel, Symfony, Rails, Phoenix, NestJS, Fastify, Hono, .NET, Spring** — and more. As each new starter goes live, the announcement lands here in News first.',
      },
      {
        kind: 'cta',
        text: 'Deploy your first AI-optimized workspace today — choose your framework and get started.',
        href: 'https://www.fractera.ai/',
        label: 'Deploy with AI',
      },
    ],
    faq: [
      {
        q: 'What is the AI Draft Settings page and what does it do?',
        a: 'AI Draft Settings is a workspace page included as standard with every Fractera framework starter. It provides a visual control surface for managing the AI behavior layer of a project — editing agent instruction documents, reviewing active skills and MCP tools, and proposing new capabilities through a structured draft system. It connects all six AI agent personas (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code, and Hermes) in a single interface, with real-time views pulled from the project filesystem.',
      },
      {
        q: 'How do AI agents interact with AI Draft Settings automatically?',
        a: 'Any of the six AI coding agents can call the HTTP-native skill "propose-new-agent-skill-or-mcp" to create a draft capability without human involvement. Hermes can reach the same endpoint through a dedicated MCP bridge (the owner_draft_create_record tool on the ai-draft-bridge server, port 3221). Each agent carries its own copy of the skill and is fully self-sufficient — no single point of failure, no dependency on any other agent being available at the same time.',
      },
      {
        q: 'Which frameworks will Fractera support with AI-workspace transports?',
        a: 'Fractera is building AI-workspace transports for all major web frameworks and application stacks, including React, Vue, Angular, SvelteKit, Nuxt, Astro, Remix, Gatsby, TanStack Start, SolidStart, Qwik, Django, Flask, FastAPI, Laravel, Rails, Phoenix, NestJS, Fastify, Hono, .NET, and Spring. Each transport delivers the same integrated database, authentication, object storage, and full AI agent stack that Next.js developers have from day one. New transports are announced in News as they go live.',
      },
    ],
  },
]

export function getAllArticles(): NewsArticle[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticle(slug: string): NewsArticle | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getArticleSlugs(): string[] {
  return ARTICLES.map(a => a.slug)
}
