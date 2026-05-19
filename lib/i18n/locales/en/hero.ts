import type { SiteContent } from '../../types'

type HeroPart = Pick<SiteContent,
  | 'heroTitle' | 'deployButton' | 'description'
  | 'featureItems' | 'heroBenefits' | 'loopShowcase'
>

export const hero: HeroPart = {
  heroTitle: 'One-Click Open-Source AI Coding Infrastructure on Your VPS',
  deployButton: 'Deploy My Server',

  loopShowcase: {
    h2: 'From Idea to Marketplace — The Fractera Build Loop',
    description:
      'Three ways your private AI infrastructure compounds value: ship products, automate with Hermes loops, monetize through the skills marketplace.',
    slides: [
      {
        label: 'Build Products',
        sublabel: 'Idea → Production in days',
        title: 'Ship full products with AI on your VPS',
        description:
          'Pre-configured stack — auth, DB, storage, routing. Hermes orchestrates Claude Code, Codex, Gemini to turn ideas into production-grade applications. Your code stays on your server. Your domain is live in 10 minutes.',
      },
      {
        label: 'Hermes Loops',
        sublabel: 'Agentic orchestration cycles',
        title: 'Agentic loops that learn from every iteration',
        description:
          'Hermes coordinates 5 AI platforms through LightRAG persistent memory. Each task feeds context back into the loop. Agents share state, avoid repetition, and ship faster with fewer tokens.',
      },
      {
        label: 'Skills Marketplace',
        sublabel: 'Buy, sell, share workflows',
        title: 'Monetize the workflows you build',
        description:
          'Package your best AI workflows as Fractera Skills. Sell them in the community marketplace, share for free, or buy battle-tested recipes from other builders. Your AI infrastructure becomes a passive revenue stream.',
      },
    ],
  },

  description:
    'Open-source platform that deploys your complete AI development infrastructure on your own VPS: Hermes orchestrator, LightRAG memory, 5 AI platforms (Claude Code, Codex, Gemini CLI, Qwen, Kimi), auth, database, and file storage. No API fees. No Clerk. No Supabase. Your server, your stack, your data.',

  featureItems: [
    { title: 'Zero to Production', text: 'Everything comes pre-configured out of the box: architecture, database, development agents, global memory, your own server and domain.' },
    { title: 'Build the Product',  text: "If you're a product manager or entrepreneur — you can build both the product and the code. Community skill libraries help you discover new approaches and ship faster." },
    { title: 'Beyond the Code',    text: "If you're a developer who wants to build products, not just write code — you'll expand your expertise into SEO, multi-language support, routing, and other product-level capabilities." },
    { title: 'Ship 10× Faster',    text: 'All of this lets you ship professional applications at a fraction of the time and cost of managing a project by hand.' },
  ],

  heroBenefits: [
    { title: 'Hermes — AI Orchestrator',  text: 'Runs on subscriptions — Claude Code, Codex, Gemini CLI. Zero API spend for everyday coding. Switch to API mode for fully autonomous, hands-free workflows.' },
    { title: 'LightRAG — Company Brain',  text: 'Persistent vector memory shared across all five AI platforms. Your codebase, every decision, every pattern — always in context. No more starting from scratch each session.' },
    { title: 'Five Coding Platforms',     text: 'Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code — all on subscription. No API keys. No per-token billing. Switch platforms without losing your project thread.' },
    { title: 'Your Server & Domain',      text: 'A dedicated VPS only you control. Your personal domain — provisioned and fully configured automatically. SSL, DNS, Nginx — ready before you write a single line of code.' },
    { title: 'Auth, Storage & Database',  text: 'Google OAuth, magic-link, SQLite, file storage, and vector store — pre-configured on your server. No Clerk. No Supabase. No extra invoices. Everything owned by you.' },
    { title: 'Sell Your Skills',          text: 'Solved something hard? Package your workflow as a skill and sell it on the marketplace. Others pay for your solution — not your time. Your best work earns while you sleep.' },
  ],
}
