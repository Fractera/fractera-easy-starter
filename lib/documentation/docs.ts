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
    readingMinutes: 7,
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
        kind: 'h3', text: 'Who can do what — without anyone studying a manual' },
      {
        kind: 'list',
        items: [
          '**A guest** (no login) acts only on their own view: language, theme, readability, finding pages. Nothing private, nothing shared.',
          '**A signed-in user** can reach **their own** data — their orders, their invoices, their requests — scoped to their identity, never anyone else’s.',
          '**The owner/administrator** changes shared configuration and global defaults, and grows the project itself.',
        ],
      },
      {
        kind: 'p',
        text: 'When you ask for something your role cannot do, the consultant does not dead-end you. If it needs your identity (your own data) or a higher role, it tells you plainly and offers a **sign-in button** — sign in, and the same request just works.',
      },

      // ── Growing the project ──────────────────────────────────────────────────
      { kind: 'h2', text: 'It grows with you — new tools in plain language' },
      {
        kind: 'p',
        text: 'If you want to add new tools or skills, you use the built-in service page **AI Draft Settings**. There you describe, in free form, a request to create a new MCP server, a skill, or an instruction. A specialized AI agent picks up that request and — working together with you — turns it into **another tool in your platform.** You pick who the tool is for (a guest, a signed-in user, or the owner) right as you draft it.',
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
          '**Draft** — describe a new tool on AI Draft Settings; an agent materializes it.',
          '**Extend** — drop to the terminal or local dev when you want full control. You own the code.',
        ],
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
