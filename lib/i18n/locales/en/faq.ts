import type { FaqItem } from '../../types'

export const faqItems: FaqItem[] = [
  {
    q: 'The same AI platforms — yet Fractera ships faster with fewer tokens. Why?',
    a: [
      'Regular vibe coding puts all the heavy lifting on the AI: design the architecture, write boilerplate, locate the right component, recall what was decided last session. Every token spent on that overhead is a token not spent on your actual feature.',
      'Fractera eliminates that overhead at every layer:',
    ],
    bullets: [
      'Production-ready starters — Auth, database, file storage, and advanced routing ship fully pre-configured. The AI skips months of scaffolding and goes straight to your feature from day one.',
      'Component highlighting — Click any element on your live site to jump directly to its source. No tokens wasted asking "where is the navbar?".',
      'LightRAG, your company brain — A persistent vector store that remembers your entire codebase, every architectural decision, and domain knowledge. Every AI message arrives with full context.',
      'AI-optimized skills & instructions — Pre-built prompts and workflows designed for non-professional developers. The right approach on the first try.',
      "Cross-platform orchestration — LightRAG coordinates all five coding platforms so they share context. Switching from Claude Code to Gemini CLI doesn't mean losing the thread.",
    ],
    trail: [
      'The result: tasks that take 10–20 back-and-forth messages in a vanilla AI chat typically resolve in 2–3 focused exchanges inside Fractera.',
      "This is Fractera Pro. And once you've tried it, there's no going back to plain vibe coding.",
    ],
  },
  {
    q: 'How does Fractera keep your business stable?',
    a: [
      'Modern web development has a tempting formula: combine a handful of "free" services — Clerk for auth, Supabase for your database, a dozen other cloud APIs. It looks great on day one.',
      'The problems surface when your prototype becomes a real business. Each service quietly updates its pricing. What starts as free becomes a paid tier that scales with traffic.',
      "Worse: ten billing cycles to track. Miss one and your project goes dark. No warning, no grace period. Partners who switched to Fractera often share this story: a live project lost because one service expired. By the time they figured it out, the reputation damage was done.",
      'Fractera is built around a different principle: everything your business needs — authentication, databases, media storage — lives on your server, not spread across a dozen cloud dashboards.',
    ],
    bullets: [
      'One subscription, one server — cost does not scale with your users.',
      "If you pause your business, your data does not disappear. Back it up and restore when you're ready.",
      'Your application code lives on GitHub — recovery is always possible, even if dependencies have aged.',
      'Built-in AI systems can help rebuild the project even when some packages are outdated.',
    ],
    trail: ['One server. One bill. Maximum resilience — whether you are running one project or ten.'],
  },
  {
    q: 'What server specs do I need?',
    a: [
      'For full AI-coding workloads, the recommended minimum is 6 cores and 8 GB RAM. Storage depends on your project — 75 GB is a solid baseline.',
      'Once active AI development wraps up, you can downgrade to 2 cores / 4 GB RAM — typically €1–2 per month.',
    ],
  },
  {
    q: 'Step by step — what does the full path from buying a server to monetizing my product look like?',
    a: [
      'The complete cycle: from an empty VPS to a live product on the marketplace. Under 30 minutes to launch, everything after that runs at your development pace.',
    ],
    steps: [
      'Buy a VPS from Contabo (our recommended provider). Receive your IP address, login, and password.',
      'On the "Your Server" tab, enter those credentials and launch the deployment. Watch real-time events for a few minutes. Two emails arrive: one when installation starts, another when it completes.',
      'Your dashboard sits in the top-right corner — click your name after signing in. Inside you will find direct links to your live site and admin panel. The same links arrive in your completion email.',
      'Sign up in the admin panel with a real email and password (save them carefully). The first user becomes the administrator — only admins can change settings. You can promote more admins later.',
      'Have your own domain? Open "Settings", enter the domain name, copy the A-record. Set it at your DNS provider — and it works immediately.',
      'Authorize one or more coding platforms (Claude Code, Codex, Gemini CLI, Qwen Code, Kimi Code). Codex is recommended as the channel for working through Hermes. Authorization is standard browser-based, just like in a local CLI. One-time setup.',
      'Open Hermes and configure it your way. Add a messenger channel, or use the chat directly in the admin panel.',
      'Tell Hermes what to change or what to generate. For example: "Let Claude do this and Codex do that" — both run in parallel through Hermes orchestration.',
      'Upload documents (requirements, business description, any reference material) to your Company Brain — powered by LightRAG — manually, or ask Hermes to automate your data ingestion.',
      'Want to accelerate? Ask Hermes to find a ready-made solution from the Fractera skills marketplace.',
      'Your domain is live from minute one. After every development cycle, the site updates automatically — no manual deploy step.',
      'Finished a project? Ask Hermes to turn it into a skill and publish it on the marketplace. Set a price, sell it, earn.',
    ],
    trail: [
      'This loop repeats as many times as you want. Every product stays yours — on your server, under your domain, your code, your data, your subscriptions.',
    ],
  },
  {
    q: 'Roadmap & vision: where is Fractera headed?',
    a: [
      'When you start a business for the first time, almost everything around you is unfamiliar. Registering the company, opening a bank account, standing up a website and social profiles, streamlining production, finding traffic, balancing the unit economics, and finally scaling. An AI agent helps at every step — but it is not a single "do it all" button: it is a road you cannot walk in a day, or even a month.',
      'Along that road the AI keeps proposing solutions. Some turn out right, some wrong; some save you money, some waste it, and once in a while income appears out of nowhere. Until now, this priceless zero-to-product experience lived only in your head. Now it can be digitized.',
      'And this is nothing like reading a book or running through a checklist. The AI that solved every task alongside you, listened to your conversations, prepared your presentations — can assemble not a step-by-step manual but a living knowledge base. Not yes/no, but the complex conditional logic of decisions that modern AI can analyze and carry over — even to a different region, with different inputs and a different outcome.',
      "So whoever is lucky enough to buy your digitized experience walks the same road faster and with far fewer mistakes. Admit it — you would want to be in their place too: to save years of your life and not pay for someone else's mistakes with your own money.",
    ],
    bullets: [
      'More than a book — a book gives one route; the loop remembers the forks.',
      'More than a checklist — a checklist answers yes/no; the loop reasons in context.',
      'More than a course — a course teaches in general; the loop knows your exact path.',
    ],
    trail: [
      'This is what we call the product loop — and it is the product we want to build in the near future.',
      'Already have experience, or a company of your own? Want to digitize your current business — or your next one? Become a project sponsor: you join a private Telegram group where you can talk to the founder directly and be first to shape what our core service becomes — the product loop and its skill marketplace.',
      'Stay with us — we will build it together.',
    ],
    cta: { label: 'Become a project sponsor', href: '#sponsorship' },
  },
  // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: вопрос о переходе с платного плана скрыт
  /* {
    q: 'Can I switch from the paid plan to free self-hosting later?',
    a: ["Yes — at any time. Here's the recommended migration path:"],
    steps: [
      'Keep your code continuously synced to GitHub throughout your subscription.',
      'Export your database and file storage to an external drive.',
      'Provision a new server and deploy a mirror of your project.',
      'Import your database and file storage, then verify the app works end-to-end.',
      'Point your custom domain to the new server, then cancel your subscription.',
    ],
  }, */
  {
    q: 'Can I bring my existing project into Fractera and continue AI-assisted development?',
    a: ["Yes. Connect your existing GitHub repository to your Fractera workspace and start coding with AI immediately. Depending on your project's complexity, some initial migration steps may be needed — Fractera's built-in AI assistants can guide you through."],
  },
  {
    q: 'Can I deploy a finished project to Vercel instead of keeping it on my own server?',
    a: [
      'Yes — once a project is complete and no longer needs active AI-assisted development, you can export it to Vercel.',
      "Important: moving to Vercel means leaving the Fractera environment behind. The AI coding workspace, terminal access, LightRAG memory, and all five development platforms only run on your own server.",
      'Also keep in mind that Vercel and cloud storage pricing can escalate quickly under real-world traffic. Migrating back to a self-hosted Fractera server is straightforward — your code is already on GitHub.',
    ],
  },
  // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: раздел о платных тарифах скрыт
  /* {
    q: 'Pricing and plans — details',
    a: [
      'Fractera is open-source — you can self-host and run it entirely on your own infrastructure at no cost.',
      'Deploying with our tools gives you Fractera Light, which covers roughly 90% of everything you need to build and ship a professional application.',
      'Need the fastest path to a live environment? Our hosted plan includes the server, full Fractera Pro, and everything pre-configured — $25/month or $199/year.',
    ],
  }, */
  {
    q: 'Can I deploy a regular project without AI?',
    a: [
      'Yes — you can deploy a plain server with no AI at all. It is a common, deliberate choice, especially among experienced developers who want to offload the work of managing cloud resources and avoid DevOps overhead.',
      'A server like this can be used at any time, synced with your home or work IDE (for example, Visual Studio Code), or simply to host and run your existing projects on infrastructure you control.',
    ],
    bullets: [
      'Optional authentication — turn it on whenever you need it.',
      'Local database and object storage (for example, media) — included, with no cloud subscriptions.',
      'Freedom from cloud lock-in — meet regulatory or internal-policy requirements and avoid surprise bills.',
    ],
    trail: [
      'A plain server like this needs only a lighter, more economical VPS. During deployment, switch to custom mode and tell us which services you want.',
      "Don't worry if you turn off something you might need later — you can always add any recommended or custom AI tool through the terminal built into your admin panel.",
    ],
  },
  {
    q: 'Can I combine local development with the Fractera production platform?',
    a: [
      'Yes — and for developers with an existing local setup, this is often the most natural workflow.',
      "If you prefer working with hot reload in your IDE, you don't have to change your habits:",
    ],
    steps: [
      'After setting up your Fractera project, connect it to a GitHub repository and push the initial codebase.',
      'Pull the code to your local machine. Develop the way you always have — your IDE, hot reload.',
      'When ready to ship, push your changes to GitHub.',
      'Return to your Fractera workspace, pull from GitHub, and hit Deploy.',
    ],
    trail: [
      'Your changes go live in production in minutes. In effect, your own server becomes a self-hosted alternative to Vercel: GitHub is the bridge between your local environment and production.',
      'Your local environment will continue to use the database and file storage that live on your server — no cloud subscriptions required.',
    ],
  },
  // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: вопрос о White Label ($100) скрыт
  /* {
    q: 'Can I remove the "Powered by Fractera" branding from my site?',
    a: ['Yes — White Label is a one-time $100 purchase per server. After payment, the Fractera branding is removed automatically and permanently.'],
    bullets: [
      'Instant: branding disappears as soon as the payment is processed.',
      'Permanent: if you ever rebuild your server, white label status is remembered and reapplied automatically.',
      'Per server: each server requires a separate purchase.',
    ],
    trail: [
      'To purchase, open your Dashboard, select the server, and click "Remove Fractera branding".',
      'Tip: after removal, open your site in an incognito window to confirm the footer is gone — your main browser may show a cached version.',
    ],
  }, */
  {
    q: 'Do you have a referral program?',
    a: [
      'Yes — the Fractera Partner Program. The model is simple and provider-agnostic: you recommend Fractera deployment, your readers buy a VPS from any host with an affiliate program, the host pays you directly.',
      "Fractera doesn't pick the provider for you and doesn't restrict your choice. You decide who to work with: Hetzner, DigitalOcean, Vultr, Hostinger, RuVDS, Timeweb, Contabo — dozens of hosts run affiliate programs. Direct programs (RuVDS, Timeweb, Hostinger) approve in a day and pay up to 30–40% of the customer's first payment. Affiliate-network programs (Contabo via CJ.com, others via Admitad) pay a fixed amount per new customer but take a few days to approve.",
      'The Fractera cabinet works with any affiliate link — we provide the infrastructure (mirror page, embed widget, MCP, cabinet), the host pays the commission.',
    ],
    trail: [
      'For questions: admin@fractera.ai',
    ],
    cta: { label: 'Open the Partners page', href: '/partners' },
  },
  {
    q: 'How do I earn with Fractera?',
    a: [
      'Your income from partnership is closer and simpler than you might imagine. One approval at any hosting provider, then passive payouts for as long as your content keeps bringing readers.',
    ],
    steps: [
      'Pick a host with an affiliate program. Direct programs are faster: apply on the provider\'s own site (Hetzner, RuVDS, Timeweb, Hostinger and others each have their own affiliate cabinet). Affiliate networks (CJ.com for Contabo, Admitad for several providers) are slower but unlock a catalogue of 3000+ brands through a single registration.',
      'Get your affiliate link once approved by the provider.',
      'Open the Fractera partners page, create your partner cabinet, add your affiliate link (or multiple links from different providers — the cabinet supports several at once).',
      'Receive your personal Fractera landing mirror, an embed widget for your blog, and a single MCP link for AI agents. Your links replace the defaults in the "Where to buy a VPS" block.',
      'Recommend Fractera in your blog, YouTube channel, social posts — wherever developers and entrepreneurs gather.',
      'Any visitor who follows your link and buys a server from a partner host triggers a payout. Amount depends on the provider: direct programs pay up to 30-40% of the first payment, networks pay a fixed amount (Contabo: 20-55 € depending on configuration). The host pays you directly — Fractera is never in the middle.',
    ],
    trail: [
      'The math is simple: one approval at one provider, then passive payouts for as long as your article, post, or video keeps bringing traffic. Hosts compete hard for new customers — and you get rewarded for every one you bring in.',
    ],
    cta: { label: 'Open the Partners page', href: '/partners' },
  },
  // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ: вопрос об удалении сервера упоминает платную подписку и White Label
  /* {
    q: 'What happens when I delete my server?',
    a: ['Deleting a server from your dashboard stops all Fractera services, removes the installation from the VPS, and releases your subdomain. The VPS itself is not deleted.'],
    bullets: [
      'Your paid subscription is preserved — it is not cancelled when you delete the server.',
      'White Label status is tied to the server — it does not carry over automatically to a new deployment.',
      'Your free (self-hosted) subscription is cancelled automatically when the server is deleted.',
    ],
    trail: ['If you deleted your server by mistake and need to restore White Label without paying again, contact admin@fractera.ai'],
  }, */
]
