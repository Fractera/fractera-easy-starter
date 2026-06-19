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
    title: 'AI Draft Settings: The Page Where Your Workspace Learns New Skills',
    subtitle: 'It comes with every Next.js-based starter, and it is the first piece of a system that lets a project grow its own intelligence over time',
    description:
      'Meet the AI Draft Settings page — the place where you, or any of your AI agents, propose a new skill, instruction, or connector and stage it safely before it goes live. It ships with every Next.js-based framework today, works by hand or by agent, and is the first link in a seven-stage pipeline for evolving a workspace.',
    summary:
      'A plain-language tour of the AI Draft Settings page — where people and AI agents draft new capabilities together, included as standard with every Next.js-based starter.',
    date: '2026-06-19',
    readingMinutes: 6,
    tags: ['AI Draft Settings', 'Evolutionary Pipeline', 'Multi-Framework', 'MCP'],
    author: { name: 'Fractera Team', role: 'Product' },
    heroImage: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings.jpg',
    ogImage: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings-screenshot.png',
    blocks: [
      // ── Lead paragraph ───────────────────────────────────────────────────────
      {
        kind: 'p',
        text: 'Fractera is adding a new page to every workspace: **AI Draft Settings**. It is the place where you — or one of your AI agents — propose a new skill, a new instruction, or a new connector, and hold it safely as a draft before it ever touches your live setup. It is also the first piece of something bigger we are building: a system that lets a workspace grow its own intelligence over time. Below is what the page does, how you and your agents use it, and where it is headed — in plain words.',
      },
      // ── What is it ───────────────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'What the AI Draft Settings page is',
      },
      {
        kind: 'p',
        text: 'Think of it as the control room for the AI side of your project. A normal admin panel manages your business data — users, orders, content. This page manages something different: what your AI agents know and what they are allowed to do. On it you can see and shape each agent\'s instructions, the skills it carries, and the MCP tools it can call. Nothing here configures your app\'s features — it configures the minds behind them.',
      },
      {
        kind: 'h3',
        text: 'It comes with every Next.js-based framework',
      },
      {
        kind: 'p',
        text: 'Today the AI Draft Settings page is part of every Next.js-based starter Fractera deploys. You do not install it, switch it on, or wire it up — the moment your workspace comes online, the page is already there and already connected to all six AI agents. (Support for other framework families is on the way; there is more on that near the end.)',
      },
      {
        kind: 'list',
        items: [
          'Six agents ready out of the box: Claude Code, Codex CLI, Gemini CLI, Qwen Code, Kimi Code, and Hermes',
          'A live view of each agent\'s real instruction files and active skills, read straight from the project exactly as it is right now',
          'A draft layer where new ideas wait safely before they go live',
          'Each agent\'s MCP tools, listed and editable in a full code editor',
          'A guarded "danger zone" for removing things on purpose — with a clear before-and-after view and a confirmation step',
        ],
      },
      // ── Two ways to use it ───────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Two ways to use it — by hand or by agent',
      },
      {
        kind: 'h3',
        text: 'Doing it yourself, in the interface',
      },
      {
        kind: 'p',
        text: 'Open the page and you see two panels. On the left, the six agents. Click one and the right side fills in with that agent\'s real instructions, its skills, and its registered tools — exactly as they sit on disk. Those views are read-only on purpose: they are the source of truth, not a scratchpad. The scratchpad is the draft layer on top. You write down the change you want — a new skill, a tweak to an instruction, an idea for a tool — and save it. The draft is marked as waiting, and it stays there until something acts on it.',
      },
      {
        kind: 'figure',
        media: 'image',
        src: '/news/fractera-ai-draft-settings/fractera-ai-draft-settings-screenshot.png',
        alt: 'The AI Draft Settings page in a live workspace: the agents tree on the left, the selected MCP connector and its real source on the right',
        caption: 'The AI Draft Settings page in a live workspace — every agent and its files on the left, the selected item and its real source on the right. Saving stores your version on the draft; nothing touches the real file until an agent applies it.',
      },
      {
        kind: 'h3',
        text: 'Letting an agent do it',
      },
      {
        kind: 'p',
        text: 'The page is not just for people. Any of the agents can use it too. In the middle of a normal working session, Claude Code (or any of the others) can call a built-in skill — **`propose-new-agent-skill-or-mcp`** — describe the capability it has in mind, and the draft shows up on the page on its own. Hermes does the same thing through its own connector (**`owner_draft_create_record`** on the `ai-draft-bridge` server, port 3221). Here is the part that matters most: every agent carries its own copy of this ability. It keeps working even if your project runs just one agent and nothing else — no shared brain required, no single point that can fail.',
      },
      // ── How it works (lifecycle) ─────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'From a wish to a working skill',
      },
      {
        kind: 'h3',
        text: 'How it works',
      },
      {
        kind: 'p',
        text: 'At some point you — or one of your agents — will want to change how an agent behaves: update an instruction, add a new skill, or hook up a new connector. Any model on the platform can start this, because these settings are copied to every agent. That is on purpose: even if your whole workspace is a single agent — only Codex, say, or only Hermes — the ability is still there. Nothing about it depends on one particular agent being present.',
      },
      {
        kind: 'p',
        text: 'You can say what you want in plain words — just write down your wish for how the agent should work. If you would rather be precise, you can hand it over in a structured way instead: through a small built-in terminal, or step by step with a to-do-style tool. One thing is important to be clear about: writing the wish is **not** the actual technical work. It does not build anything yet. It is a note — a clear brief kept for later, for the tool that will eventually generate the real skill.',
      },
      {
        kind: 'p',
        text: 'Every draft you add marks its parent container as changed — a small orange **req** badge appears next to it, so it is obvious that something is waiting. Whenever the moment is right, you or an agent can send that draft into work, either by pressing the matching button or as the result of a logical step. When that happens, the AI first clears the existing note, and then a fresh entry called **Next Step** is created on the **Development Steps** page. All the details of the task move into that entry. From there — depending on what else is running and what matters most — either an agent or a person starts the real build at the right time.',
      },
      {
        kind: 'p',
        text: 'Notice what does **not** happen: the draft is never turned into code automatically the instant you create it. That is a deliberate choice. Kicking off a build right then could crowd the agent\'s active context window, drag down the quality of the code it is generating in the main process, or — in the worst case — break the run entirely, for example by burning through your token budget earlier than you planned. So the hand-off is always a conscious step, taken when it makes sense.',
      },
      {
        kind: 'p',
        text: 'In short, the lifecycle is three simple moves:',
      },
      {
        kind: 'olist',
        items: [
          '**Create a draft** — write down the skill, instruction, or connector you want.',
          '**Move it into the queue** — when you are ready, send the draft on; it becomes a Next Step on the Development Steps page and waits its turn.',
          '**Turn it into the real thing** — an agent (or you) builds the actual skill, instruction, or connector, and it goes live.',
        ],
      },
      // ── Evolving applications ────────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'Evolving applications — from semi-automatic to fully automatic',
      },
      {
        kind: 'p',
        text: 'Right now the loop is semi-automatic, and it is already fast. You describe what you want on the AI Draft Settings page. You send it on. An agent picks it up, builds it, and the new ability ships — often inside the same session. You set the direction; the AI does the building.',
      },
      {
        kind: 'p',
        text: 'This is the first part of a larger plan — a seven-stage pipeline for growing a workspace\'s skills. As we add the rest — automatic testing, catching regressions, visual diffs, usage data, and a feedback loop that tunes itself — each stage needs a little less human help than the last. The end state is a loop that runs on its own from start to finish, much like [Fractera\'s autonomous development loop](https://www.fractera.ai/ai-development-loop): a need shows up, an agent plans it, builds it, checks it, ships it, and writes down what happened — with nobody pressing a button.',
      },
      {
        kind: 'quote',
        text: 'The AI Draft Settings page is where human intent and machine capability meet. Today it needs a trigger. Tomorrow it will not.',
        cite: 'Fractera product team',
      },
      // ── Multi-framework strategy ─────────────────────────────────────────────
      {
        kind: 'h2',
        text: 'One page today, every framework tomorrow',
      },
      {
        kind: 'p',
        text: 'Fractera started on Next.js, but the idea was never meant to stop there. AI-native development should not belong to a single framework. So we are bringing the same setup — the same depth that [Next.js developers have today](https://www.fractera.ai/next-aircraft-carrier) — to every popular web framework and application stack.',
      },
      {
        kind: 'p',
        text: 'The way we do it is straightforward. For each framework, we build a dedicated **ai-workspace transport**: a ready-made integration layer that wires that framework into Fractera\'s shared services, so you never have to figure out the plumbing yourself. Here is the full set of stacks we are bringing on board — open it up to see them all:',
      },
      {
        kind: 'frameworks',
      },
      {
        kind: 'h3',
        text: 'What every framework gets',
      },
      {
        kind: 'list',
        items: [
          '**A built-in database** — local SQLite through Fractera\'s data service, with a data layer that feels native to your framework',
          '**Authentication** — sessions and a [simple role model (guest, user, architect)](https://www.fractera.ai/en/documentation/authentication-roles-and-providers), fitted to how your framework already handles auth',
          '**File and media storage** — local object storage mounted at the framework level, with upload and download APIs ready on day one',
          '**The full AI agent stack** — all five coding agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) plus the Hermes brain, connected from the first deploy',
          '**One MCP architecture** — the same tool-first model no matter the stack; agents call tools, not raw APIs',
        ],
      },
      {
        kind: 'p',
        text: 'We are rolling these out one at a time, and every new starter gets announced here in News first.',
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
        a: 'AI Draft Settings is a workspace page included as standard with every Next.js-based Fractera starter. It is a visual control room for the AI side of your project — you can see and edit each agent\'s instruction files, review its active skills and MCP tools, and propose new capabilities through a simple draft system. It connects all six AI agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code, and Hermes) in one place, with live views read straight from the project files.',
      },
      {
        q: 'How do AI agents interact with AI Draft Settings automatically?',
        a: 'Any of the six agents can call a built-in skill, "propose-new-agent-skill-or-mcp", to create a draft on its own, with no human in the loop. Hermes reaches the same place through its own connector (the owner_draft_create_record tool on the ai-draft-bridge server, port 3221). Each agent carries its own copy of the skill and is fully self-sufficient, so there is no single point of failure and no dependency on any other agent being online at the same moment.',
      },
      {
        q: 'Does turning a draft into a real skill happen automatically?',
        a: 'No — and that is deliberate. Creating a draft only writes down a brief; it does not build anything. When you or an agent send the draft on, it clears the note and creates a Next Step entry on the Development Steps page, where the real work is scheduled and run at the right time. Auto-launching a build the instant a draft is created could crowd the agent\'s context window, hurt the quality of the code in the main process, or burn through token limits early, so the hand-off is always a conscious step.',
      },
      {
        q: 'Which frameworks does Fractera support, and which are coming?',
        a: 'The AI Draft Settings page ships today with every Next.js-based starter. Beyond that, Fractera is building dedicated AI-workspace transports for all major web frameworks and stacks, including React, Vue, Angular, SvelteKit, Nuxt, Astro, Remix, Gatsby, TanStack Start, SolidStart, Qwik, Django, Flask, FastAPI, Laravel, Rails, Phoenix, NestJS, Fastify, Hono, .NET, and Spring. Each one delivers the same built-in database, authentication, file storage, and full AI agent stack — and every new starter is announced here in News as it goes live.',
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
