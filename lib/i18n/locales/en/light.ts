import type { LightContent } from '../../types'

export const light: LightContent = {
  hero: {
    h1: 'Self-Hosted Backend-as-a-Service — Your Private Vercel + Supabase + Clerk + S3',
    description: 'Stop paying the Vercel tax. Deploy a complete backend (auth, database, storage, custom domain, HTTPS) on your own $5–10 VPS in 10 minutes. Open source, no AI, no telemetry, no lock-in.',
    ctaPrimary: 'Deploy in 10 minutes',
    ctaSecondary: 'See how it works',
  },

  benefitsHeader: {
    h2: 'The Brand-Ready Self-Hosted Backend Stack',
    description: 'Everything you need to ship a private SaaS — pre-wired, brand-ready, on your own VPS.',
  },

  benefits: [
    { h3: 'Pre-Configured Authentication: Google OAuth + Email Magic Link', text: 'NextAuth with Google + magic link out of the box. A Clerk alternative on your own server, no external dependency.' },
    { h3: 'SQLite / Postgres Database — No External Services', text: 'Local SQLite (WAL) or Postgres on the same VPS. No Neon, no Supabase, no per-row pricing.' },
    { h3: 'File Storage on Your VPS — No S3 Bills', text: 'Local disk storage with media proxy. Zero egress fees, zero AWS S3 markup.' },
    { h3: 'Custom Domain + Automatic HTTPS in Minutes', text: 'Nginx + Let’s Encrypt auto-configured. Cloudflare-friendly, no manual SSL dance.' },
    { h3: 'Default Landing Page You Can Edit — Brand-Ready Out-of-Box', text: 'One-click rebranding. Editable Next.js page, no boilerplate setup, ship within an hour.' },
    { h3: 'No AI, No Telemetry, No Vendor Lock-In', text: 'Open source. No agents, no LLM tracking, no Mixpanel. Your code, your data, your server.' },
  ],

  problem: {
    h2: 'The Hidden Costs of Managed Backend Platforms',
    description: 'Predictable bills, full control, no surprise pricing changes. Here is what you escape.',
    items: [
      { h3: 'Bandwidth Markup: Vercel Charges $0.15/GB, Hetzner Charges $0.01/GB', text: 'A 15× markup. The viral Cara case hit a $95K Vercel bill overnight after a growth surge. Self-hosting on Hetzner = same bandwidth, 1/15 the cost.' },
      { h3: 'Vendor Lock-In: Migrating Off Supabase Is a Multi-Week Project', text: 'Managed BaaS providers tie your runtime to their stack. Exporting data is one thing; rewriting auth, real-time, storage glue is another.' },
      { h3: 'Compliance Friction: GDPR + NIS2 + Data Residency on Foreign Clouds', text: 'CLOUD Act vs GDPR conflict is real. EU AI Act compliance pushes data sovereignty harder every quarter.' },
      { h3: 'Surprise Bills: $20/month Plans That Become $700 Overnight', text: 'Heroku entered "sustaining engineering mode" in February 2026. Railway, Vercel, and Render price hikes keep coming. Owning the bill = owning the predictability.' },
    ],
  },

  howItWorks: {
    h2: 'From Empty VPS to Production Backend in 10 Minutes',
    description: 'One bootstrap command. Single VPS. Live HTTPS in minutes.',
    steps: [
      { title: 'Get any Ubuntu 24.04 VPS', text: '$5–10/month at Hetzner, Contabo, DigitalOcean, Vultr — your choice.' },
      { title: 'Run the bootstrap-light.sh', text: 'One command. We handle Nginx, SSL, database, auth, storage, default landing.' },
      { title: 'Point your domain', text: 'Add a DNS record. HTTPS auto-issued via Let’s Encrypt.' },
      { title: 'Ship your product', text: 'Edit the default landing or build your SaaS on top of the auth/DB/storage you now own.' },
    ],
  },

  pricing: {
    h2: 'Deploy Self-Hosted Backend: Free Forever, Open Source',
    description: 'Pay only for your VPS. No per-seat fees, no bandwidth surprises, no vendor anchoring your runtime.',
    cardTitle: 'Fractera Light — Free Open-Source Backend Stack',
    cardSub: 'Self-hosted on your own VPS, free forever.',
    features: [
      'Authentication (Google OAuth + Email magic link)',
      'Database (SQLite WAL or Postgres)',
      'File storage on your VPS',
      'Custom domain + HTTPS automation',
      'Editable default landing page',
      'Open source — GPL/MIT, no vendor lock-in',
    ],
    cta: 'Get started — free',
  },

  vpsProviders: {
    h3: 'Validated Ubuntu 24.04 VPS Providers',
    description: 'Any Ubuntu 24.04 VPS with 2+ cores and 2+ GB RAM works. Recommended budget choices below.',
  },

  comparison: {
    h2: 'Fractera Light vs Vercel + Supabase + Coolify + PocketBase',
    description: 'How Fractera Light stacks up against managed clouds and other self-hosted tools.',
    note: 'Detailed comparison table coming in the next iteration (step 66).',
  },

  faq: {
    h2: 'Fractera Light Frequently Asked Questions',
    items: [
      { q: 'Why "No AI" Is a Feature, Not a Limitation', a: 'Managed AI backends ship telemetry, LLM tracking, and unpredictable cost surfaces. Fractera Light is for teams that want predictability, simplicity, and zero anti-features. You can still add AI on top — it is just not bundled.' },
      { q: 'How Is Fractera Light Different From Coolify or Dokploy?', a: 'Coolify and Dokploy give you a PaaS panel — you still deploy auth, DB, storage, and landing yourself. Fractera Light ships a brand-ready full stack out of the box: one command, ten minutes, production-ready.' },
      { q: 'Is It Really Free?', a: 'Yes. Open source under a permissive license. You pay only for your VPS ($5–10/month at most providers). No per-seat fees, no bandwidth surprises.' },
      { q: 'Does It Work for EU NIS2 / GDPR Compliance?', a: 'Self-hosting on an EU VPS gives you data sovereignty by default. Fractera Light defaults are configured for NIS2/GDPR-friendly logging and data residency — no extra hardening required.' },
    ],
  },

  ctaFooter: {
    h2: 'Exit the Cloud in 10 Minutes — Free Open-Source Forever',
    description: 'Leave Vercel. Leave Supabase. Own your backend. Deploy now.',
    cta: 'Deploy Fractera Light',
  },
}
