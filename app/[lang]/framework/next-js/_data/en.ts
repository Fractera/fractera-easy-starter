import type { FrameworkBase } from '../../_lib/post'

// English base document for /framework/next-js. Standard co-located content (lives
// HERE, not generated). Mandatory root anchor "Agentic Engineering Infrastructure"
// → /en woven into the lead. Founder quote preserved from the registry (order 1).
export const en: FrameworkBase = {
  title: 'Next.js Environment for Enterprise Agent Engineering',
  seoTitle: 'Next.js Agent Engineering: Self-Hosted Next.js Starter on Your VPS',
  subtitle:
    'Deploy an agent-optimized Next.js starter on your own server in ten minutes — App Router, a private database, auth and media wired in advance, driven by AI agents over MCP.',
  description:
    'A self-hosted Next.js starter on the Fractera agent engineering infrastructure: App Router, private SQLite/Postgres, built-in auth and object storage, and five coding agents orchestrated by Hermes — no cloud accounts, near-zero token overhead.',
  keywords:
    'nextjs agent engineering, self hosted nextjs starter, private database nextjs template, nextjs mcp agent integration, app router, agentic engineering infrastructure',
  listTitle: 'Next.js',
  listDescription:
    'The agent-optimized Next.js starter on the Fractera infrastructure — App Router, private DB, auth and media built in.',
  founderQuote:
    'A startup can test different acquisition channels, but only in order to pick one — the channel with the lowest acquisition cost and enough capacity to pay off.',
  blocks: [
    {
      kind: 'callout',
      title: 'Next.js, Already Wired for Agents',
      text:
        'You deploy a Next.js App Router project that already carries the parts an AI agent would otherwise spend a session re-deriving: authentication, a private database, object storage and routing. The agents compose on top of them instead of rebuilding them — that is where the token savings start.',
    },
    {
      kind: 'p',
      text:
        'Next.js is a first-class citizen of the Fractera [Agentic Engineering Infrastructure](/en). The starter lands on your VPS in one click and comes up as a running Node process under PM2, served over HTTP on your IP — or HTTPS once you attach a domain. Your code, database and media stay on your own server.',
    },

    { kind: 'h2', text: 'Why Next.js on Your Own Server' },
    {
      kind: 'p',
      text:
        'Self-hosting a Next.js app means no per-request cloud bill, no vendor lock on auth or database, and full data ownership. Fractera provisions the runtime, the database, the storage and the reverse proxy automatically, so what is left is the part you actually care about — building features with AI agents.',
    },

    { kind: 'h2', text: 'How the AI Builds It' },
    {
      kind: 'p',
      text:
        'Hermes orchestrates five subscription coding agents (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code) over the Model Context Protocol, while LightRAG keeps the project context in a shared graph memory. The agents recall exactly what they need instead of re-reading the whole codebase — read the [system architecture](/en/documentation/multi-agent-workspace-architecture) for the full picture.',
    },

    { kind: 'h2', text: 'Fractera Pro vs Ordinary Next.js' },
    {
      kind: 'table',
      caption: 'The Fractera Pro Next.js starter vs an ordinary Next.js project',
      headers: ['Capability', 'Ordinary Next.js', 'Fractera Pro'],
      rows: [
        ['Token savings — huge projects', '75%', '90%'],
        ['Token savings — small projects', '75%', '30%'],
        ['Content updates', 'Rare redeploy', 'On the fly'],
        ['New pages', 'Deploy', 'No deploy'],
        ['Simple components', 'Deploy', 'On the fly'],
        ['Complex components', 'Deploy', 'Rare deploy'],
        ['Parallel routing', 'Not recommended', 'Native'],
        ['Design system', 'Partial', 'Full'],
        ['Ready-made business solutions', 'None', 'Landing, page, store, cart, forms, bookings, blog, news, chat'],
        ['Design complexity', 'Simple', 'Requires advanced architecture understanding'],
        ['Highlight — find in codebase', 'No', 'Yes'],
        ['Highlight — show on page', 'No', 'Yes'],
        ['Service pages', 'Yes', 'Yes'],
        ['Local database', 'Yes', 'Yes'],
        ['Local object storage', 'Yes', 'Yes'],
        ['Multilingual', '82 languages', '82 languages'],
        ['Localization', 'Yes', 'Yes'],
        ['Recursive 3-level agent evolution', 'Yes', 'Planned — needs the most powerful models (perhaps +2 model generations out)'],
        ['Agent self-replication', 'Coming soon', 'Long-term plans'],
      ],
    },
  ],
  faq: [
    {
      q: 'Which Next.js version and rendering modes are supported?',
      a: 'A current Next.js App Router project running as a Node process (SSR) under PM2. It comes up on your IP over HTTP first; attach a domain later and HTTPS is issued automatically.',
    },
    {
      q: 'Do I need cloud accounts for auth or the database?',
      a: 'No. Authentication, a private SQLite/Postgres database and object storage run on your own server — no Clerk, no Supabase, no per-request cloud bills.',
    },
    {
      q: 'How do the AI agents avoid burning tokens?',
      a: 'They compose pre-built, immutable patterns instead of regenerating boilerplate, and recall context from the shared LightRAG memory rather than re-reading the whole project each session.',
    },
  ],
}
