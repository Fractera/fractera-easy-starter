import type { SiteContent } from '../../types'

type HeroPart = Pick<SiteContent,
  | 'heroBadge' | 'heroTitle' | 'deployButton' | 'heroButtonCaption' | 'architectureCta' | 'devLoopCta' | 'referenceLinks' | 'description'
  | 'featureItems' | 'heroBenefitsHeader' | 'heroBenefits' | 'lightPitch' | 'heroNarrativeVariant' | 'elonTrillion'
  | 'deployCaptions'
>

export const hero: HeroPart = {
  heroBadge: 'Open Source — Free Forever',
  // 'none' — the Elon-Trillion narrative moved off the homepage into the blog post
  // /blog/trillion-dollar-service-opportunity. No narrative section renders here.
  heroNarrativeVariant: 'none',
  heroTitle: 'Agentic Engineering Infrastructure: Self-Hosted & Token-Free',
  lightPitch: {
    label: 'Alternative',
    h2: "Don't need full AI automation? Take just the backend",
    body: "Fractera Light is the bare backend on your VPS: role-based auth, database (SQLite or Postgres), file storage, custom domain and HTTPS — in 10 minutes from $1/mo. No Hermes, no five coding platforms, no LightRAG. If you're looking for a self-hosted alternative to Vercel/Netlify and just want a ready-to-go environment where all that's left to do is write code — Light is exactly that.",
    cta: 'Explore Fractera Light',
  },
  elonTrillion: {
    label: '$1,000,000,000,000',
    h2: 'Fractera is built so you can reach this trillion-dollar opportunity',
    description:
      "In February 2026, Elon Musk pointed at where the biggest AI money sits today: inside businesses that have neither a website nor an API. That's exactly who Fractera is built for.",
    quote:
      "If AI can simply take whatever is given to the outsourced customer service company that they already use and do customer service using the apps that they already use, then you can make tremendous headway in customer service, which is, I think, 1% of the world economy or something like that. It's close to a trillion dollars all in, for customer service.",
    author: 'Elon Musk',
    source: 'Dwarkesh Patel interview, February 2026',
    watchButton: 'Watch the moment on YouTube',
    videoUrl: 'https://www.youtube.com/watch?v=BYXbuik3dgA&t=4119s',
  },
  deployButton: 'Launch in 1 click',
  heroButtonCaption: 'Fractera — your smart robot installer.',
  architectureCta: 'More about the AI Workspace architecture',
  devLoopCta: 'See how the Fractera development loop works',
  referenceLinks: {
    intro: 'Go deeper:',
    architecture: 'AI Workspace architecture',
    knowledgeBase: 'project knowledge base',
    developmentLoop: 'AI development loop',
  },

  description:
    'The Fractera robot installs agentic engineering infrastructure on your VPS in 10 minutes.',

  heroBenefitsHeader: {
    h2: 'The Self-Hosted AI Agent Infrastructure: Zero Token Metering',
    cardLink: 'Learn more',
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
      text: 'Package the workflows you\'ve solved into reusable AI Skills. Sell them in the community marketplace, share them free, or buy battle-tested recipes from other builders. Your self-hosted stack becomes a passive revenue stream — your best work earns while you sleep.',
    },
  ],

  deployCaptions: {
    afterHero: 'Looks like magic, runs like a pipeline — completely hands-off.',
    afterUltimateScale: 'Get your zero-overhead infrastructure now.',
    afterAircraftCarrier: 'This whole framework ships the moment you deploy — one click, nothing to buy on top.',
    afterLoop: 'The whole pipeline — from server to code — deploys itself. You just click.',
    afterPresentation: 'Hermes and memory come pre-wired — tokens saved, you just build.',
    afterPlatforms: 'Five AI platforms spin up in one click — no keys, no hassle.',
    afterProblem: 'No cloud bills, no data leaving the country — it all lives on your server.',
    afterFeatures: 'The full production stack assembles itself — like magic.',
    afterBrain: 'Project memory cuts token spend automatically — you just save.',
    afterSponsors: 'Back the project or just launch — the start is always one click.',
    afterFaq: 'Still have questions? The fastest answer is to launch and see.',
  },
}
