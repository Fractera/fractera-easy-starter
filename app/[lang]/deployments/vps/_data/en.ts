import type { DeploymentBase } from '@/lib/deployments/post'

// Base English document for /[lang]/deployments/vps (Production VPS target).
// IP-first reality: the deploy comes up on plain HTTP at http://<ip>:3002 — never
// promise HTTPS/a domain as the result of the deploy (that is an optional later
// step done inside the workspace).
export const en: DeploymentBase = {
  title: 'Production VPS: Your Own Agentic Engineering Server',
  seoTitle: 'Deploy AI Agents to a VPS — Self-Hosted Agentic Engineering Infrastructure',
  subtitle:
    'Deploy the full stack to an Ubuntu VPS in about ten minutes. A coding-agent team, Hermes orchestration and LightRAG memory come up on hardware you rent for a few dollars a month — fully owned by you.',
  description:
    'Stand up a production Agentic Engineering Infrastructure on your own Ubuntu VPS. IP-first deploy: your workspace is live on plain HTTP in about ten minutes, with no DNS or certificate wait. Self-hosted, open-source, your data on your disk.',
  keywords:
    'self-hosted ai vps, deploy ai agents to vps, ubuntu ai coding server, agentic engineering infrastructure, self hosted vercel alternative, claude code on a vps, hermes orchestration server, lightrag memory server, own your ai stack, ip-first deploy',
  listTitle: 'Production VPS',
  listDescription:
    'Deploy the full stack to an Ubuntu VPS in about ten minutes — production-grade agent environments on hardware you rent for a few dollars a month.',
  blocks: [
    {
      kind: 'callout',
      title: 'Production-grade, IP-first, in about ten minutes',
      text:
        'The full stack installs onto an Ubuntu VPS you rent and comes up live on plain HTTP at http://<your-ip>:3002 — the Admin workspace where you start coding. No DNS, no certificate, no wait. Attaching your own domain with HTTPS is an optional later step.',
    },
    {
      kind: 'p',
      text:
        'A production server is the default home for a Fractera [platform for agentic engineering](/en). The same stack runs end to end on a box you control: five coding CLIs, the Hermes orchestrator, a LightRAG memory graph, your application, its database and its media — all as long-running processes on your own machine, not someone else’s cloud.',
    },

    { kind: 'h2', text: 'One install, a full stack on hardware you own' },
    { kind: 'h3', text: 'IP-first: live on plain HTTP, no DNS wait' },
    {
      kind: 'p',
      text:
        'The deploy is IP-first by design. When it finishes — typically in about ten minutes — your workspace is reachable on plain HTTP at http://<your-ip>:3002. There is no domain and no HTTPS yet, and that is deliberate: it gets you into a working environment in minutes instead of waiting on DNS propagation and certificate issuance. When you are ready, you attach your own domain with HTTPS from inside the workspace (Admin → Personal Domain) — a separate, optional step you do yourself, later.',
    },
    { kind: 'h3', text: 'Rent the box, own the stack' },
    {
      kind: 'p',
      text:
        'Any Ubuntu 24.04 VPS with root access works — Contabo, Hetzner and similar providers rent suitable machines for a few dollars a month. The install runs the whole stack as PM2 processes on that machine. The open-source layer that runs on your VPS is yours: the code, the database and the AI memory all live on your disk, and nothing is routed to an external service to keep the lights on.',
    },

    { kind: 'h2', text: 'What comes up on the server' },
    { kind: 'h3', text: 'A coding-agent team plus Hermes orchestration' },
    {
      kind: 'p',
      text:
        'Claude Code, OpenAI Codex, Gemini CLI, Qwen Code and Kimi Code initialize inside browser-native terminals on the server and run on your own developer subscriptions. The Hermes orchestrator coordinates them, turning a request into precise tool calls and checking the result against the project’s own memory rather than guessing.',
    },
    { kind: 'h3', text: 'LightRAG memory and your data on your disk' },
    {
      kind: 'p',
      text:
        'A LightRAG knowledge graph acts as the shared long-term memory of the server, so context compounds across sessions instead of evaporating when a chat closes. Your application database and media storage sit on the same disk. Because everything is local to the server, your operational knowledge never leaves the machine you control.',
    },

    {
      kind: 'quote',
      text:
        'A server you rent for the price of a few coffees, running the sustained output of a full engineering team — owned outright, with the code, the database and the memory all on your own disk.',
      cite: 'Fractera Engineering Core · June 2026',
    },

    {
      kind: 'p',
      text:
        'Ready to put it on a server? [Start a deploy now](/en#pricing) — paste your VPS details and watch the stack come up, or read how it is [orchestrated end to end](/ai-workspace-architect).',
    },
  ],
  faq: [
    {
      q: 'How long does a VPS deploy take, and what URL do I get?',
      a: 'About ten minutes on a typical Ubuntu VPS. When it finishes, your workspace is live on plain HTTP at http://<your-ip>:3002 — that is the Admin workspace where you start coding. The deploy is IP-first, so there is no DNS or certificate wait.',
    },
    {
      q: 'Do I need a domain or HTTPS to deploy?',
      a: 'No. The default deploy is IP-first and comes up on plain HTTP at your server’s IP address. Attaching your own custom domain with HTTPS is an optional later step you do yourself from inside the workspace (Admin → Personal Domain). It is not part of the deploy.',
    },
    {
      q: 'Which VPS providers and operating systems are supported?',
      a: 'Any VPS running Ubuntu 24.04 with root access. Providers such as Contabo and Hetzner rent suitable machines for a few dollars a month. You bring the server; the install puts the entire Agentic Engineering Infrastructure on it and runs it as managed processes.',
    },
  ],
}
