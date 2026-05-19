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
    {
      title: 'Hermes Orchestrator: Multi-Model Loops',
      text: 'Hermes Agent by Nous Research, deployed and configured on your VPS. Coordinates Claude Code, Codex, and Gemini CLI through shared context. Switch to API mode for autonomous agentic workflows that run without your input — every loop refines the next.',
    },
    {
      title: 'LightRAG: Persistent Memory for AI Agents',
      text: 'A persistent vector store by HKUDS, shared across all five coding platforms. Your codebase, every architectural decision, every solved problem — always in context. No more starting each AI session from scratch. The company brain that compounds with every iteration.',
    },
    {
      title: 'Five AI Coding Platforms, One Server',
      text: 'Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code — all preconfigured on your server. Run on your existing AI subscriptions. No API keys to manage, no per-token billing. Switch platforms mid-task without losing your project context — LightRAG keeps the thread.',
    },
    {
      title: 'Your Own VPS, Your Own Domain',
      text: 'Dedicated Ubuntu 24.04 VPS configured automatically. Custom domain provisioned, SSL issued, Nginx routed — before you write the first line of code. Tested providers: Contabo, Hetzner, Netcup, DigitalOcean. 4 cores and 6 GB RAM is the minimum we recommend.',
    },
    {
      title: 'Database, Storage, Auth — Built In',
      text: 'Google OAuth, magic-link email, SQLite with WAL mode, file storage, and vector store — preconfigured on your server. No Clerk subscription, no Supabase invoice, no separate email provider. One stack, owned by you, billed once through your VPS provider.',
    },
    {
      title: 'Monetize AI Workflows via Skills Marketplace',
      text: 'Package the workflows you\'ve solved into reusable AI Skills. Sell them in the community marketplace, share them free, or buy battle-tested recipes from other builders. Your AI infrastructure becomes a passive revenue stream — your best work earns while you sleep.',
    },
  ],
}
