import type { LightContent } from '../../types'

export const light: LightContent = {
  hero: {
    h1: 'Your Private Backend on a Remote Server — Git-Synced With Your Local AI Dev Machine',
    description: 'Traditional dev workflow: AI (Claude Code, Codex, Gemini) runs locally on your machine, production runs on your own VPS, both linked by git. The only difference: the remote server, database, auth and storage are now under your full control.',
    ctaPrimary: 'Deploy on your own server',
    ctaSecondary: 'See how it works',
  },

  benefitsHeader: {
    h2: 'A Complete Backend Stack on Your Server — Built for Traditional Dev/Prod Workflows With AI',
    description: 'Pre-configured: role-based auth, database, file storage, custom domain, Cloudflare SSL, landing + dashboard with protected routing. Git-sync between local and production — out of the box.',
  },

  benefits: [
    {
      h3: 'Local AI Development Stays Traditional',
      text: 'Claude Code, Codex, Gemini CLI run on your machine the way you are used to. No changes to your dev workflow. AI generates code locally — production knows nothing about AI and pays nothing for API tokens.',
    },
    {
      h3: 'Git Sync Between Local and Production — Out of the Box',
      text: 'The cloud project is already wired to a git repository. Your local machine connects to the same repo. Edit locally → push → automatic deploy to production. The same pattern proven in the main Fractera project.',
    },
    {
      h3: 'Pre-Configured Role-Based Auth With Guest Access',
      text: 'User roles, guest access, protected routing — ready out of the box. Attach any OAuth provider (Google, GitHub, Yandex, custom SSO) — your choice.',
    },
    {
      h3: 'Database and File Storage on Your VPS',
      text: 'SQLite (WAL) or Postgres + local file storage with media proxy. No Neon, no Supabase, no AWS S3, no vendor lock-in. Full data ownership.',
    },
    {
      h3: 'Custom Domain + Cloudflare SSL Automatically',
      text: 'Cloudflare issues the SSL certificates (not Let’s Encrypt). DDoS protection and CDN included. One step — add a DNS record, the rest just works.',
    },
    {
      h3: 'Landing Page + Dashboard With Protected Routing',
      text: 'Included: public landing + protected dashboard with role-based routing already in place. Edit the brand — the structure is ready.',
    },
  ],

  audience: {
    h2: 'Who Fractera Light Is For',
    description: 'This approach demands more skill than no-code platforms. It is a full traditional dev infrastructure — more powerful, but more demanding.',
    fitsLabel: 'Good fit',
    fits: [
      'Developers already comfortable with git (push/pull, branches, merges)',
      'Teams that understand the dev/production split',
      'Developers with basic Linux/VPS knowledge (SSH, files, processes)',
      'Those who want to use AI coding locally without cloud-API subscriptions',
      'Teams that need GDPR/NIS2 compliance or geographic data sovereignty',
    ],
    notFitsLabel: 'Not for',
    notFits: [
      'No-code / low-code builders — this is a full dev environment',
      'Anyone looking for an AI agent that deploys everything without human input',
      'Teams who need visual UI editing without touching code',
    ],
  },

  problem: {
    h2: 'The Hidden Costs of Managed Backend Platforms',
    description: 'Predictable bills, full control, no vendor lock-in. Here is what you escape.',
    items: [
      {
        h3: 'Bandwidth Markup: Vercel Charges $0.15/GB, Hetzner Charges $0.01/GB',
        text: 'A 15× markup. The viral Cara case hit a $95K Vercel bill overnight after a growth surge. Self-hosting on Hetzner = same bandwidth, 1/15 the cost.',
      },
      {
        h3: 'Vendor Lock-In: Migrating Off Supabase Is a Multi-Week Project',
        text: 'Managed BaaS providers tie your runtime to their stack. Exporting data is one thing; rewriting auth, real-time, storage glue is another.',
      },
      {
        h3: 'Compliance Friction: GDPR + NIS2 + Data Residency on Foreign Clouds',
        text: 'The CLOUD Act vs GDPR conflict is real. EU AI Act compliance pushes data sovereignty harder every quarter.',
      },
      {
        h3: 'Surprise Bills: $20/month Plans That Become $700 Overnight',
        text: 'Heroku entered "sustaining engineering mode" in February 2026. Railway, Vercel, and Render price hikes keep coming. Owning the bill = owning the predictability.',
      },
    ],
  },

  howItWorks: {
    h2: 'From an Empty VPS to Production With Git Sync',
    description: 'One bootstrap command on the server, link your local git — and dev/prod are connected. Then you work locally with AI as usual.',
    steps: [
      {
        title: 'Get any Ubuntu 24.04 VPS',
        text: 'We recommend the cheapest tier — Hetzner CPX11 from €4/month or Contabo VPS S from €3.60. Enough for all Light features.',
      },
      {
        title: 'Run bootstrap-light.sh',
        text: 'One command. We configure Nginx, Cloudflare SSL, database, role-based auth, storage, and the landing + dashboard.',
      },
      {
        title: 'Connect git locally and remotely',
        text: 'The cloud project is already wired to a git repo. Connect your local machine to the same repo — dev/prod are now synced.',
      },
      {
        title: 'Develop locally with AI, push — production updates',
        text: 'Claude Code, Codex or Gemini run on your machine the traditional way. git push — changes deploy to production automatically.',
      },
    ],
  },

  comparison: {
    h2: 'Fractera Light vs Vercel · Supabase · Coolify · PocketBase · Appwrite',
    description: 'How self-hosted Fractera Light stacks up against managed clouds and other self-hosted backends.',
    productLabel: 'Fractera Light',
    competitors: ['Vercel', 'Supabase', 'Coolify', 'PocketBase', 'Appwrite'],
    rows: [
      { feature: 'Self-hosted on your own VPS', values: [true, false, false, true, true, true] },
      { feature: 'Open source', values: [true, false, 'partial', true, true, true] },
      { feature: 'Auth + DB + storage out of the box', values: [true, 'hosting only', true, false, true, true] },
      { feature: 'Landing + dashboard with role-based routing', values: [true, false, false, false, false, false] },
      { feature: 'Git sync between local and production', values: [true, true, true, 'setup needed', false, 'setup needed'] },
      { feature: 'AI runs locally (no AI on prod)', values: [true, 'n/a', 'n/a', 'n/a', 'n/a', 'n/a'] },
      { feature: 'GDPR / NIS2 friendly defaults', values: [true, 'on EU VPS', 'on EU VPS', true, true, true] },
      { feature: 'Vendor lock-in', values: ['none', 'high', 'high', 'low', 'low', 'low'] },
      { feature: 'Price', values: ['$5 VPS', 'from $20/mo', 'from $25/mo', '$5 VPS', '$5 VPS', '$5 VPS'] },
    ],
  },

  deploy: {
    h2: 'Deploy Fractera Light on Your VPS',
    description: 'Pick a cheap Ubuntu 24.04 VPS — recommendations below. Then one command — and your backend is live in 10 minutes.',
    providerLabel: 'Recommended VPS providers',
    providers: [
      { name: 'Hetzner CPX11', tagline: 'Cheap EU VPS, perfect for self-host', price: 'from €4/mo' },
      { name: 'Contabo VPS S', tagline: 'Maximum resources for a minimal price', price: 'from €3.60/mo' },
      { name: 'DigitalOcean Droplet', tagline: 'Global presence, mature infra', price: 'from $6/mo' },
    ],
    cta: 'Deploy backend (coming soon)',
    ctaHint: 'The full install flow ships in step 67 (bootstrap-light.sh). Cheap install pipeline is currently in active development.',
  },

  faq: {
    h2: 'Fractera Light Frequently Asked Questions',
    items: [
      {
        q: 'Where does the AI run — on the server or locally?',
        a: [
          'AI runs locally on your machine the traditional way — Claude Code, Codex, Gemini CLI, just as you are used to.',
          'The remote server knows nothing about AI: it just stores auth, DB and files. This is a sharp contrast with managed AI platforms that route your entire codebase through their servers and bill you per API call.',
        ],
      },
      {
        q: 'How does git sync between local and production actually work?',
        a: [
          'Out of the box, the cloud project is already wired to a git repository (GitHub, GitLab, or self-hosted). Your local machine connects to the same repo.',
          'Edit locally → git push → automatic deploy to production. This is the same pattern proven in the main Fractera project.',
        ],
        bullets: [
          'Works with GitHub, GitLab, Gitea, or self-hosted git',
          'CI/CD pre-wired — push to main = deploy to prod',
          'Local branches = preview environments',
        ],
      },
      {
        q: 'Can I attach another OAuth provider (GitHub, Yandex, custom SSO)?',
        a: [
          'Yes. Google OAuth and Email magic link are pre-configured, but the architecture supports any provider — GitHub, GitLab, Yandex, VK, custom SSO.',
          'Underlying model: user roles (admin / user / guest) + protected routing. Adding a new provider = one config block.',
        ],
      },
      {
        q: 'How is Fractera Light different from Coolify or Dokploy?',
        a: [
          'Coolify and Dokploy give you a PaaS panel — you still deploy auth, DB, storage and landing yourself, gluing them together.',
          'Fractera Light ships the full brand-ready stack out of the box: one command, ten minutes, production-ready. Plus git-sync between local and prod is wired in by default.',
        ],
      },
      {
        q: 'Does it work for EU NIS2 / GDPR compliance?',
        a: [
          'Self-hosting on an EU VPS gives you data sovereignty by default. Fractera Light defaults are configured for NIS2/GDPR-friendly logging and data residency.',
          'You choose the VPS region — full geographic control, no provider lock-in.',
        ],
      },
      {
        q: 'Who is Fractera Light for? What skills do I need?',
        a: [
          'Best fit: developers comfortable with git (push/pull, branches), familiar with the dev/prod split, with basic Linux/VPS knowledge (SSH, files, processes).',
          'Not for no-code/low-code users — this is a full dev infrastructure, not a visual builder. More skill-demanding than managed platforms, but more powerful and more sovereign.',
        ],
      },
    ],
  },

  ctaFooter: {
    h2: 'Move Production Under Your Own Control — In 10 Minutes',
    description: 'Local AI development + git sync + your private backend. No bills surprises, no vendor lock-in, no cloud anchoring your stack.',
    cta: 'Deploy Fractera Light',
  },
}
