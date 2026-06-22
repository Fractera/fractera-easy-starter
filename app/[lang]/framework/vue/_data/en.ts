import type { FrameworkBase } from '../../_lib/post'

// English base document for /framework/vue. Standard co-located content (lives HERE,
// not generated). SEO core (Block 3 ID 12): primary key "vue agent engineering";
// LSI — vue js private deployment, vue local sqlite wal mode, vue agent framework
// companion. Mandatory root anchor "Agentic Engineering Infrastructure" → /en woven
// into the lead. Founder quote preserved (registry order 3).
export const en: FrameworkBase = {
  title: 'Vue.js Stack for Real-Time Agent Monitoring Systems',
  seoTitle: 'Vue Agent Engineering: Self-Hosted Vue.js Stack with a Private Backend',
  subtitle:
    'Deploy a Vite + Vue single-page app on your own server in ten minutes — a real-time monitoring UI backed by a private SQLite (WAL) database, built-in auth and object storage, driven by AI agents over MCP.',
  description:
    'A self-hosted Vue.js stack on the Fractera agent engineering infrastructure: private Vue.js deployment, a local SQLite WAL-mode database, and a Vue agent-framework companion — no cloud accounts, agents orchestrated by Hermes.',
  keywords:
    'vue agent engineering, vue js private deployment, vue local sqlite wal mode, vue agent framework companion, self hosted vue stack, agentic engineering infrastructure',
  listTitle: 'Vue',
  listDescription:
    'The agent-optimized Vue (Vite) stack on the Fractera infrastructure — private backend, SQLite WAL database, auth and media built in.',
  founderQuote:
    'Many channels at the start means scattering the resources you are already short of.',
  blocks: [
    {
      kind: 'callout',
      title: 'A Vue SPA with a Real Backend, Already Wired',
      text:
        'You deploy a Vite + Vue single-page app served as static assets, but it is not a frontend in a vacuum: a private SQLite (WAL-mode) database, built-in auth and object storage run on the same server behind it. Its reactive data model makes Vue a natural fit for real-time agent monitoring — dashboards that update as the agents work.',
    },
    {
      kind: 'p',
      text:
        'Vue is a first-class citizen of the Fractera [Agentic Engineering Infrastructure](/en). The starter lands on your VPS in one click: the build produces a static bundle served by a static server, while the private agent backend (auth, database, media) lives alongside it. Your code and data stay on your own server.',
    },

    { kind: 'h2', text: 'Real-Time Monitoring on a Private Backend' },
    {
      kind: 'p',
      text:
        'A private Vue.js deployment means your reactive UI talks to a backend you own — a local SQLite WAL-mode database, an open-source auth stack (Google OAuth, magic-link) and object storage — with no Clerk, no Supabase and no per-request cloud bill. WAL mode keeps reads fast while writes stream in, which is exactly what a live monitoring view needs.',
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
      q: 'Is this Vue with SSR or a static SPA?',
      a: 'A Vite + Vue single-page app: the build produces static assets served by a static server. The private backend (auth, SQLite WAL database, object storage) runs on the same server behind it.',
    },
    {
      q: 'Why SQLite in WAL mode for a Vue app?',
      a: 'WAL (write-ahead logging) lets reads continue uninterrupted while writes are appended — ideal for a real-time monitoring UI where data streams in while users keep viewing. It runs locally on your server, no managed cloud database needed.',
    },
    {
      q: 'How do the AI agents avoid burning tokens?',
      a: 'They compose pre-built, immutable patterns instead of regenerating boilerplate, and recall context from the shared LightRAG memory rather than re-reading the whole project each session.',
    },
  ],
}
