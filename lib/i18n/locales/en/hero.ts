import type { SiteContent } from '../../types'

type HeroPart = Pick<SiteContent,
  | 'heroBadge' | 'heroTitle' | 'deployButton' | 'description'
  | 'featureItems' | 'heroBenefitsHeader' | 'heroBenefits' | 'lightPitch'
>

export const hero: HeroPart = {
  heroBadge: 'Open Source — Free Forever',
  heroTitle: 'One-Click Open-Source AI Coding Infrastructure on Your VPS',
  lightPitch: {
    label: 'Alternative',
    h2: "Don't need full AI automation? Take just the backend",
    body: "Fractera Light is the bare backend on your VPS: role-based auth, database (SQLite or Postgres), file storage, custom domain and HTTPS — in 10 minutes from $1/mo. No Hermes, no five AI platforms, no LightRAG. If you're looking for a self-hosted alternative to Vercel/Netlify and just want a ready-to-go environment where all that's left to do is write code — Light is exactly that.",
    cta: 'Explore Fractera Light',
  },
  deployButton: 'Deploy My Server',

  description:
    'Open-source platform that deploys your complete AI development infrastructure on your own VPS in 10 minutes: Hermes orchestrator, LightRAG memory, 5 AI platforms (Claude Code, Codex, Gemini CLI, Qwen, Kimi), auth, database, and file storage. Zero API fees. No Clerk. No Supabase. Your server, your stack, your data.',

  heroBenefitsHeader: {
    h2: 'The AI-Native Self-Hosting Platform',
  },

  featureItems: [
    { title: 'Zero to Production',  text: 'Your VPS, domain, auth, database, and five AI platforms — live in 10 minutes. No cloud accounts to set up. No infrastructure decisions to make.' },
    { title: 'Exit the Cloud',      text: 'No Clerk. No Supabase. No Vercel. Auth, storage, and database run on your own server — one bill, one place, full ownership.' },
    { title: 'Any Device, Full Speed', text: 'All computation runs on your VPS. Build from a laptop, tablet, or phone without hitting hardware limits.' },
    { title: 'Ship 10× Faster',    text: 'AI skips months of scaffolding. Production-grade starters mean your first feature ships in hours, not weeks.' },
  ],

  heroBenefits: [
    {
      title: 'Hermes Orchestrator: Multi-Model Agentic Loops',
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
      title: 'Dedicated VPS Environment with Custom Domain',
      text: 'Dedicated Ubuntu 24.04 VPS configured automatically. Custom domain provisioned, SSL issued, Nginx routed — before you write the first line of code. Recommended provider: Contabo. 4 cores and 6 GB RAM is the minimum we recommend.',
    },
    {
      title: 'Pre-Configured Secure Database & Auth Stack',
      text: 'Google OAuth, magic-link email, SQLite with WAL mode, file storage, and vector store — preconfigured on your server. No Clerk subscription, no Supabase invoice, no separate email provider. One stack, owned by you, billed once through your VPS provider.',
    },
    {
      title: 'Monetize AI Workflows via Skills Marketplace',
      text: 'Package the workflows you\'ve solved into reusable AI Skills. Sell them in the community marketplace, share them free, or buy battle-tested recipes from other builders. Your AI infrastructure becomes a passive revenue stream — your best work earns while you sleep.',
    },
  ],
}
