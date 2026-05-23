import type { LightContent } from '../../types'

export const light: LightContent = {
  hero: {
    badge: 'Open Source · Free Forever',
    eyebrow: 'Fractera Light',
    h1: 'Self-Hosted Backend-as-a-Service — Your Private Vercel + Supabase + Clerk + S3',
    description: 'Stop paying the Vercel tax. Deploy a complete backend (auth, database, storage, custom domain, HTTPS) on your own VPS from $1/mo in 10 minutes. Open source, no vendor lock-in.',
    ctaPrimary: 'Deploy on your own server',
    ctaSecondary: 'See how it works',
  },

  benefitsHeader: {
    label: 'What you get',
    h2: 'The Brand-Ready Self-Hosted Backend Stack',
    description: 'Pre-configured: role-based auth, database, file storage, custom domain, Cloudflare SSL, landing + dashboard with protected routing. Git-sync between local and production — out of the box.',
  },

  benefits: [
    {
      h3: 'Local AI Development Stays Traditional',
      text: 'Claude Code, Codex, Gemini CLI run on your machine the way you are used to. No changes to your dev workflow. AI generates code locally — production knows nothing about AI.',
    },
    {
      h3: 'Git Sync Between Local and Production — Out of the Box',
      text: 'The cloud project is wired to a git repo. Your local machine connects to the same. Push → automatic deploy to production. The pattern proven in the main Fractera project.',
    },
    {
      h3: 'Pre-Configured Auth: Roles, Guest Access, Any OAuth Provider',
      text: 'User roles, guest access, protected routing — ready out of the box. Attach any OAuth provider (Google, GitHub, Yandex, custom SSO) — your choice.',
    },
    {
      h3: 'SQLite / Postgres Database + File Storage on Your VPS',
      text: 'SQLite (WAL) or Postgres + local file storage with media proxy. No Neon, no Supabase, no AWS S3, zero egress fees. Full data ownership.',
    },
    {
      h3: 'Custom Domain + Automatic HTTPS via Cloudflare',
      text: 'Cloudflare issues the SSL certificates. DDoS protection and CDN included. One DNS record — the rest just works.',
    },
    {
      h3: 'Default Landing Page You Can Edit — Brand-Ready Out-of-Box',
      text: 'Included: public landing + protected dashboard with role-based routing in place. Edit the brand — the structure is ready.',
    },
  ],

  howItWorks: {
    label: 'How it works',
    h2: 'From Empty VPS to Production Backend in 10 Minutes',
    description: 'Eight steps from a clean server to an automatic workflow with AI on your local machine.',
    steps: [
      {
        title: 'Get any Ubuntu 24.04 VPS',
        text: 'Any VPS provider starting from $1/month — your choice. Enough for all Light features.',
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
        title: 'Sync your GitHub and clone the project locally',
        text: 'Auth and DB wiring are added automatically. Your local project connects to the remote backend out of the box.',
      },
      {
        title: 'Use AI (Claude Code CLI) to generate your site',
        text: 'See changes with hot reload, test in the browser. All updates land automatically on the database and object storage on your server.',
      },
      {
        title: 'Use the Settings tab quick-setup',
        text: 'A ready configuration template — your project is set up in seconds.',
      },
      {
        title: 'SEO is already configured — you do not need to think about it',
        text: 'Just build your project as usual. The starter template is rich — AI burns fewer tokens because the foundation is already there.',
      },
      {
        title: 'Backups and a copy from GitHub',
        text: 'Take data backups when needed, or deploy a clean copy of your project from your GitHub repo — without data. Your choice.',
      },
    ],
  },

  extrasCta: {
    label: 'Need more',
    h2: 'Need advanced AI right on the server?',
    description: 'If you need automatic interaction with modern AI agents on the remote server itself — that is the main Fractera. Hermes orchestrator, LightRAG memory, 5 coding platforms. Open source.',
    cta: 'Go to main Fractera',
    href: '/',
  },

  audience: {
    label: 'Who it is for',
    h2: 'Who Fractera Light Is For',
    description: 'This demands more skill than no-code platforms. A full traditional dev infrastructure — more powerful, but more demanding.',
    fitsLabel: 'Good fit',
    fits: [
      'Developers comfortable with git (push/pull, branches, merges)',
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
    label: 'Why they leave',
    h2: 'The Hidden Costs of Managed Backend Platforms',
    // H3 fragments below match keymap PART 4 exactly:
    // - "Bandwidth Markup: Vercel Charges $0.15/GB, Hetzner Charges $0.01/GB"
    // - "Vendor Lock-In: Migrating Off Supabase Is a Multi-Week Project"
    // - "Compliance Friction: GDPR + NIS2 + Data Residency on Foreign Clouds"
    // - "Surprise Bills: $20/month Plans That Become $700 Overnight"
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

  comparison: {
    label: 'Comparison',
    h2: 'Fractera Light vs Vercel + Supabase + Coolify + PocketBase',
    description: 'How self-hosted Fractera Light stacks up against managed clouds and other self-hosted backends.',
    productLabel: 'Fractera Light',
    competitors: ['Vercel', 'Supabase', 'Coolify', 'PocketBase', 'Appwrite'],
    rows: [
      { feature: 'Self-hosted on your own VPS', values: [true, false, false, true, true, true] },
      { feature: 'Open source · free forever', values: [true, false, 'partial', true, true, true] },
      { feature: 'Auth + DB + storage out of the box', values: [true, 'hosting only', true, false, true, true] },
      { feature: 'Landing + dashboard with role-based routing', values: [true, false, false, false, false, false] },
      { feature: 'Git sync between local and production', values: [true, true, true, 'setup needed', false, 'setup needed'] },
      { feature: 'AI runs locally (no AI on prod)', values: [true, 'n/a', 'n/a', 'n/a', 'n/a', 'n/a'] },
      { feature: 'GDPR / NIS2 friendly defaults', values: [true, 'on EU VPS', 'on EU VPS', true, true, true] },
      { feature: 'Vendor lock-in', values: ['none', 'high', 'high', 'low', 'low', 'low'] },
      { feature: 'Price', values: ['VPS from $1', 'from $20/mo', 'from $25/mo', 'VPS from $1', 'VPS from $1', 'VPS from $1'] },
    ],
  },

  deploy: {
    label: 'Deploy',
    h2: 'Deploy Self-Hosted Backend: Free Forever, Open Source',
    description: 'You pay only for your VPS — from $1/mo at any provider. No per-seat fees, no hidden bills, no vendor lock-in.',
    vpsHint: 'Any Ubuntu 24.04 VPS with 2+ cores and 2+ GB RAM works. Pick a provider yourself — the market is wide open.',
    cta: 'Deploy backend (coming soon)',
    ctaHint: 'The full install flow ships in the next step (bootstrap-light.sh). The cheap install pipeline is in active development.',
  },

  faq: {
    label: 'FAQ',
    h2: 'Fractera Light Frequently Asked Questions',
    items: [
      {
        q: 'Where does the AI run — on the server or locally?',
        a: [
          'AI runs locally on your machine the traditional way — Claude Code, Codex, Gemini CLI, just as you are used to.',
          'The remote server knows nothing about AI: it stores auth, DB and files. A sharp contrast with managed AI platforms that route your entire codebase through their servers.',
        ],
      },
      {
        q: 'How does git sync between local and production actually work?',
        a: [
          'Out of the box, the cloud project is wired to a git repository (GitHub/GitLab/self-hosted). Your local machine connects to the same.',
          'Edit locally → git push → automatic deploy to production. The same pattern proven in the main Fractera project.',
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
        q: 'Is it actually free?',
        a: [
          'Yes. Open source under a permissive license. You pay only for your VPS — from $1/mo at any provider. No per-seat fees, no bandwidth surprises.',
        ],
      },
      {
        q: 'How Is Fractera Light Different From Coolify or Dokploy?',
        a: [
          'Coolify and Dokploy give you a PaaS panel — you still deploy auth, DB, storage and landing yourself.',
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
        q: 'Who is this for? What skills do I need?',
        a: [
          'Best fit: developers comfortable with git (push/pull, branches), familiar with the dev/prod split, with basic Linux/VPS knowledge (SSH, files).',
          'Not for no-code/low-code users — a full dev infrastructure, not a visual builder. More skill-demanding than managed platforms, more powerful and more sovereign.',
        ],
      },
    ],
  },

  ctaFooter: {
    label: 'Get started',
    h2: 'Exit the Cloud in 10 Minutes — Free Open-Source Forever',
    description: 'Local AI development + git sync + your private backend. No surprise bills, no vendor lock-in, no cloud anchoring your stack.',
    cta: 'Deploy Fractera Light',
  },
}
