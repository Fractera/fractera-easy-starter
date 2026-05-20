import type { SiteContent } from '../../types'

type LoopShowcasePart = Pick<SiteContent, 'loopShowcase'>

export const loopShowcase: LoopShowcasePart = {
  loopShowcase: {
    label: 'Step by step, how it works',
    h2: 'Full Stack Ownership: Your Server, Your Domain, Your Product',
    description:
      'Modern AI coding is easy — the hard part is owning the infrastructure. Fractera makes ownership effortless: a dedicated Ubuntu VPS, an automatic custom domain with SSL, and a production-ready product stack — all yours, forever.',
    // Slide images live in /public/slides/N.jpg — see /public/slides/README.md
    slides: [
      // ── Block 1: stack ownership (1–3) ────────────────────────────────────
      {
        imageSrc: '/slides/1.jpg',
        label: 'Your Own Server',
        sublabel: 'Dedicated VPS, never rented',
        title: 'A dedicated Ubuntu VPS, yours forever — not a platform you rent',
        description:
          'Vercel and Netlify deploy you in seconds — but your code, database, and users live on their infrastructure. Fractera deploys a real Ubuntu 24.04 VPS in 10 minutes. Your hardware. Your storage. Your terms. No platform repricing can take your product offline.',
      },
      {
        imageSrc: '/slides/2.jpg',
        label: 'Your Own Domain',
        sublabel: 'SSL + DNS + Nginx — automatic',
        title: 'Custom domain live in 10 minutes — zero DNS pain',
        description:
          'Custom domain provisioning, SSL certificate, Nginx routing — all automatic. The exact friction that pushes developers onto managed platforms is solved in one click. No certificate renewals to track. No DNS dashboards to learn.',
      },
      {
        imageSrc: '/slides/3.jpg',
        label: 'Your Own Product',
        sublabel: 'Code ownership, no lock-in',
        title: 'Build, own, ship — no platform lock-in, ever',
        description:
          'Modern AI coding is easy. Server setup is what pushes developers onto hosted platforms. Fractera makes the hard part simple — a self-hosted AI development stack on your own VPS. Code on your GitHub. Data on your server. Product yours forever.',
      },

      // ── Block 2: AI coding inside (4–6) — FAKE for testing ────────────────
      {
        imageSrc: '/slides/4.jpg',
        label: 'AI in your browser',
        sublabel: 'Five platforms, one server',
        title: 'Claude Code, Codex, Gemini, Qwen, Kimi — all on your VPS',
        description:
          'FAKE preview. Open a tab — five AI platforms are already preconfigured, waiting for commands. No API keys, no local IDE, no VS Code. Terminal, filesystem, and project — all in the browser.',
      },
      {
        imageSrc: '/slides/5.jpg',
        label: 'Project memory',
        sublabel: 'LightRAG: persistent context',
        title: 'A vector memory shared by all five platforms',
        description:
          'FAKE preview. LightRAG stores your code, architectural decisions, and every solved problem. Switch AI platform mid-task — context stays. A company brain that compounds with every iteration.',
      },
      {
        imageSrc: '/slides/6.jpg',
        label: 'Hermes orchestrator',
        sublabel: 'Multi-model agentic loops',
        title: 'Coordinated Claude + Codex + Gemini through shared context',
        description:
          'FAKE preview. Hermes Agent by Nous Research, deployed on your VPS. Flips to API mode for autonomous workflows — every loop refines the next. No third-party orchestrators in the path.',
      },

      // ── Block 3: production cycle (7–9) — FAKE for testing ────────────────
      {
        imageSrc: '/slides/7.jpg',
        label: 'One-click deploy',
        sublabel: 'No CI, no YAML, no pain',
        title: 'Changes live in production in seconds — straight from the browser',
        description:
          'FAKE preview. AI writes code → build → pm2 reload → your domain updates. No GitHub Actions, no pipeline stages. One endpoint, X-Deploy-Secret, done.',
      },
      {
        imageSrc: '/slides/8.jpg',
        label: 'Skills marketplace',
        sublabel: 'Monetize AI workflows',
        title: 'Package the workflows you solve into reusable Skills',
        description:
          'FAKE preview. Sell your workflows as AI Skills in the community marketplace. Or buy battle-tested recipes from others. Your AI infrastructure becomes a passive revenue stream.',
      },
      {
        imageSrc: '/slides/9.jpg',
        label: 'Backup & ownership',
        sublabel: 'VPS snapshots, data export',
        title: 'Full portability — take everything with you anytime',
        description:
          'FAKE preview. One tarball — the entire stack: SQLite, files, configs, secrets. Move it to another VPS and the product just runs. No lock-in, no proprietary formats. Open-source to the core.',
      },
    ],
  },
}
