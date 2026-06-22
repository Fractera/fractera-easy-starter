import type { FrameworkBase } from '../../_lib/post'

// English base document for /framework/angular. Standard co-located content (lives
// HERE, not generated). SEO core (Block 3 ID 13): primary key "angular agent
// engineering"; LSI — angular enterprise vps deployment, angular private agent
// infrastructure, secure local angular database. Mandatory root anchor "Agentic
// Engineering Infrastructure" → /en woven into the lead. Founder quote preserved
// (registry order 4).
export const en: FrameworkBase = {
  title: 'Angular Enterprise Boilerplate for Secure Agent Workloads',
  seoTitle: 'Angular Agent Engineering: Secure Self-Hosted Enterprise Stack',
  subtitle:
    'Deploy an Angular enterprise boilerplate on your own VPS in ten minutes — a secure local database, built-in auth and object storage, with AI agents driven over MCP behind a hardened backend.',
  description:
    'A self-hosted Angular boilerplate on the Fractera agent engineering infrastructure: Angular enterprise VPS deployment, private agent infrastructure, and a secure local Angular database — no cloud accounts, agents orchestrated by Hermes.',
  keywords:
    'angular agent engineering, angular enterprise vps deployment, angular private agent infrastructure, secure local angular database, self hosted angular stack, agentic engineering infrastructure',
  listTitle: 'Angular',
  listDescription:
    'The agent-optimized Angular enterprise boilerplate on the Fractera infrastructure — secure local database, auth and media built in.',
  founderQuote:
    'Become a big fish in a small pond.',
  blocks: [
    {
      kind: 'callout',
      title: 'Angular, Already Wired for Secure Agent Workloads',
      text:
        'You deploy an Angular app served as static assets, but it is not a frontend in a vacuum: a secure local database, built-in auth and object storage run on the same VPS behind it. Angular’s opinionated, strongly-typed structure is a natural fit for enterprise agent workloads where predictable boundaries matter.',
    },
    {
      kind: 'p',
      text:
        'Angular is a first-class citizen of the Fractera [Agentic Engineering Infrastructure](/en). The starter lands on your VPS in one click: the build produces a static bundle served by a static server, while the private agent infrastructure (auth, database, media) lives alongside it. Your code and data stay on your own server.',
    },

    { kind: 'h2', text: 'Angular Enterprise VPS Deployment' },
    {
      kind: 'p',
      text:
        'A private agent infrastructure means your Angular UI talks to a backend you own — a secure local Angular database (SQLite/Postgres), an open-source auth stack (Google OAuth, magic-link, role tiers) and object storage — with no Clerk, no Supabase and no per-request cloud bill. Fractera provisions the runtime, the database and the reverse proxy automatically.',
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
      q: 'Is this Angular with SSR or a static build?',
      a: 'A standard ng build static bundle served by a static server. The secure backend (auth, local database, object storage) runs on the same VPS behind it; Angular Universal SSR is possible as a Node process if a project needs it.',
    },
    {
      q: 'Where do auth and the database run?',
      a: 'On your own server. The starter ships an open-source auth stack with role tiers (Google OAuth, magic-link) and a secure local Angular database (SQLite/Postgres) — no Clerk, no Supabase, no per-request cloud bills.',
    },
    {
      q: 'How do the AI agents avoid burning tokens?',
      a: 'They compose pre-built, immutable patterns instead of regenerating boilerplate, and recall context from the shared LightRAG memory rather than re-reading the whole project each session.',
    },
  ],
}
