import type { FrameworkBase } from '../../_lib/post'

// English base document for /framework/react. Standard co-located content (lives
// HERE, not generated). SEO core (Block 3 ID 11): primary key "react agent
// engineering"; LSI — react private agent backend, self hosted react database,
// react open source auth starter. Mandatory root anchor "Agentic Engineering
// Infrastructure" → /en woven into the lead. Founder quote preserved (registry order 2).
export const en: FrameworkBase = {
  title: 'React Architecture for Private Agentic User Interfaces',
  seoTitle: 'React Agent Engineering: Self-Hosted React Starter with a Private Backend',
  subtitle:
    'Deploy a Vite + React single-page app on your own server in ten minutes — backed by a private database, built-in auth and object storage, and driven by AI agents over MCP.',
  description:
    'A self-hosted React (Vite) starter on the Fractera agent engineering infrastructure: a private agent backend, a self-hosted React database, and an open-source auth starter — no cloud accounts, agents orchestrated by Hermes.',
  keywords:
    'react agent engineering, react private agent backend, self hosted react database, react open source auth starter, vite react self hosted, agentic engineering infrastructure',
  listTitle: 'React',
  listDescription:
    'The agent-optimized React (Vite) starter on the Fractera infrastructure — private backend, database, auth and media built in.',
  founderQuote:
    'If different channels give you different acquisition costs, what is the point of using the more expensive one while you are not yet in a market-saturation situation?',
  blocks: [
    {
      kind: 'callout',
      title: 'A React SPA with a Real Backend, Already Wired',
      text:
        'You deploy a Vite + React single-page app served as static assets, but it is not a frontend in a vacuum: a private database, built-in auth and object storage run on the same server behind it. The AI agents compose features on top of that backend instead of rebuilding it — that is where the token savings start.',
    },
    {
      kind: 'p',
      text:
        'React is a first-class citizen of the Fractera [Agentic Engineering Infrastructure](/en). The starter lands on your VPS in one click: the build produces a static bundle served by a static server, while the private agent backend (auth, database, media) lives alongside it. Your code and data stay on your own server.',
    },

    { kind: 'h2', text: 'A Private Agent Backend Behind Your React UI' },
    {
      kind: 'p',
      text:
        'Self-hosting React means your UI talks to a backend you own — a self-hosted React database (SQLite/Postgres), an open-source auth starter (Google OAuth, magic-link), and object storage — with no Clerk, no Supabase and no per-request cloud bill. Fractera provisions all of it automatically, so what is left is building the interface with AI agents.',
    },

    { kind: 'h2', text: 'How the AI Builds It' },
    {
      kind: 'p',
      text:
        'Hermes orchestrates five subscription coding agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) over the Model Context Protocol, while LightRAG keeps the project context in a shared graph memory. The agents recall exactly what they need instead of re-reading the whole codebase — read the [system architecture](/en/documentation/multi-agent-workspace-architecture) for the full picture.',
    },
  ],
  faq: [
    {
      q: 'Is this React with SSR or a static SPA?',
      a: 'A Vite + React single-page app: the build produces static assets served by a static server. The private backend (auth, database, object storage) runs on the same server behind it.',
    },
    {
      q: 'Where do auth and the database run?',
      a: 'On your own server. The starter ships an open-source auth starter (Google OAuth, magic-link) and a self-hosted React database (SQLite/Postgres) — no Clerk, no Supabase, no per-request cloud bills.',
    },
    {
      q: 'How do the AI agents avoid burning tokens?',
      a: 'They compose pre-built, immutable patterns instead of regenerating boilerplate, and recall context from the shared LightRAG memory rather than re-reading the whole project each session.',
    },
  ],
}
