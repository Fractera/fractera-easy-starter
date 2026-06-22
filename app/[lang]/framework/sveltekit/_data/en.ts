import type { FrameworkBase } from '../../_lib/post'

// English base document for /framework/sveltekit. Standard co-located content (lives
// HERE, not generated). SEO core (Block 3 ID 14): primary key "sveltekit agent
// engineering"; LSI — sveltekit self hosted boilerplate, sveltekit cloud alternative
// backend, private sveltekit database (WAL). Mandatory root anchor "Agentic
// Engineering Infrastructure" → /en woven into the lead. Founder quote preserved
// (registry order 5).
export const en: FrameworkBase = {
  title: 'SvelteKit Architecture for High-Performance Agent Backends',
  seoTitle: 'SvelteKit Agent Engineering: Self-Hosted SvelteKit Boilerplate on Your VPS',
  subtitle:
    'Deploy a SvelteKit app on your own VPS in ten minutes — a high-performance Node backend with a private database, built-in auth and object storage, driven by AI agents over MCP.',
  description:
    'A self-hosted SvelteKit boilerplate on the Fractera agent engineering infrastructure: a SvelteKit cloud-alternative backend, a private SvelteKit database, and built-in auth — no cloud accounts, agents orchestrated by Hermes.',
  keywords:
    'sveltekit agent engineering, sveltekit self hosted boilerplate, sveltekit cloud alternative backend, private sveltekit database, sveltekit ssr node, agentic engineering infrastructure',
  listTitle: 'SvelteKit',
  listDescription:
    'The agent-optimized SvelteKit boilerplate on the Fractera infrastructure — Node SSR backend, private database, auth and media built in.',
  founderQuote:
    'If you are forced to use many channels because none of them brings enough customers to break even, that is a reason to wonder — is there a real need for your product at all?',
  blocks: [
    {
      kind: 'callout',
      title: 'SvelteKit as a High-Performance Self-Hosted Backend',
      text:
        'You deploy a SvelteKit app that comes up as a long-lived Node process under PM2 — server endpoints, form actions and SSR all running on your own VPS. A private database, built-in auth and object storage sit behind it. SvelteKit’s lean output makes it a fast, low-overhead backend for agent workloads.',
    },
    {
      kind: 'p',
      text:
        'SvelteKit is a first-class citizen of the Fractera [Agentic Engineering Infrastructure](/en). The starter lands on your VPS in one click and runs as a Node process behind the reverse proxy, served over HTTP on your IP — or HTTPS once you attach a domain. Your code and data stay on your own server.',
    },

    { kind: 'h2', text: 'A SvelteKit Cloud-Alternative Backend' },
    {
      kind: 'p',
      text:
        'Self-hosting SvelteKit means your server endpoints talk to a backend you own — a private SvelteKit database (SQLite WAL / Postgres), an open-source auth stack (Google OAuth, magic-link) and object storage — with no Clerk, no Supabase and no per-request cloud bill. Fractera provisions the runtime, the database and the reverse proxy automatically.',
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
      q: 'How does SvelteKit run on Fractera?',
      a: 'As a long-lived Node process under PM2 (SSR + server endpoints + form actions), behind the Nginx reverse proxy. It comes up on your IP over HTTP first; attach a domain later and HTTPS is issued automatically.',
    },
    {
      q: 'Where do auth and the database run?',
      a: 'On your own server. The starter ships an open-source auth stack (Google OAuth, magic-link) and a private SvelteKit database (SQLite WAL / Postgres) — a cloud-alternative backend with no Clerk, no Supabase, no per-request bills.',
    },
    {
      q: 'How do the AI agents avoid burning tokens?',
      a: 'They compose pre-built, immutable patterns instead of regenerating boilerplate, and recall context from the shared LightRAG memory rather than re-reading the whole project each session.',
    },
  ],
}
