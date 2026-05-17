export type FaqItem = {
  q: string
  a: string[]
  steps?: string[]
  bullets?: string[]
  trail?: string[]
}

export type HeroContent = {
  description: string
  featureItems: { title: string; text: string }[]
  dpHeader: { label: string; h2: string; description: string }
  dpLeft: { imageSrc: string; title: string; description: string }
  dpRight: { imageSrc: string; title: string; description: string }
  platformsHeader: { label: string; h2: string; description: string }
  platformCards: { title: string; subtitle: string; company: string }[]
  problemHeader: { label: string; h2: string; description: string }
  problemLabel: string
  solutionLabel: string
  problemItems: { id: string; title: string; problem: string; solution: string }[]
  pricingHeader: { label: string; h2: string; description: string }
  planLabels: {
    pricingPlan: string
    freeForever: string
    recommended: string
    ownServer: string
    freeInstall: string
    signInPrompt: string
    unavailableTitle: string
    unavailableDesc: string
    signInButton: string
    monthlySubLabel: string
    annualSubLabel: string
    popularBadge: string
    bestValueBadge: string
    planFeatures: string[]
    freeFeatures: string[]
    subscribeButton: string
    subscribeButtonWait: string
  }
  mcpSection: { label: string; h2: string; description: string }
  domainSection: { label: string; h2: string; description: string }
  installForm: {
    title: string
    ipPlaceholder: string
    loginPlaceholder: string
    passwordPlaceholder: string
    checking: string
    alreadyInstalled: string
    yourDomains: string
    removeWhiteLabel: string
    renewingSsl: string
    renewSsl: string
    removing: string
    deleteReinstall: string
    cantReach: string
    updatesTo: string
    emailConfirmCheck: string
    emailConfirmNote: string
    launchButton: string
    credentials: string
    installFailed: string
    preparing: string
    tryAgain: string
    silentWarning: string
    errorDetails: string
    progressToast: {
      title: string
      dashboardNote: string
      checkboxLabel: string
      hideButton: string
    }
    successToast: {
      title: string
      siteLabel: string
      adminLabel: string
      dashboardNote: string
      checkboxLabel: string
      closeButton: string
    }
  }
  featuresHeader: { label: string; h2: string; description: string }
  featureList: { title: string; description: string; badge: string }[]
  promoSection: { h2: string; description: string; githubButton: string }
  faqHeader: { label: string; h2: string; description: string }
  faqItems: FaqItem[]
  testimonial: { blogButton: string; casesButton: string; marketplaceButton: string }
}

// ─── English ──────────────────────────────────────────────────────────────────

const en: HeroContent = {
  description:
    'In seconds, you get a server with a live domain — ready to start building your project with AI right in the browser.',

  featureItems: [
    { title: 'Zero to Production',  text: 'Everything comes pre-configured out of the box: architecture, database, development agents, global memory, your own server and domain.' },
    { title: 'Build the Product',   text: "If you're a product manager or entrepreneur — you can build both the product and the code. Community skill libraries help you discover new approaches and ship faster." },
    { title: 'Beyond the Code',     text: "If you're a developer who wants to build products, not just write code — you'll expand your expertise into SEO, multi-language support, routing, and other product-level capabilities." },
    { title: 'Ship 10× Faster',     text: 'All of this lets you ship professional applications at a fraction of the time and cost of managing a project by hand.' },
  ],

  dpHeader: {
    label: 'Production AI Development',
    h2: 'Ship From Your Browser. Live in Seconds.',
    description:
      'Production AI Development is the next era of vibe coding — and it runs entirely in your browser from the very first second. No Visual Studio Code. No local environment to configure. No database to spin up. No domain to wire. No deployment pipeline to debug. You open a tab, your server is already live, your domain is already registered, your database is already running — and five AI coding platforms are waiting for your first voice command. This is not a tool for developers. This is the moment when anyone with an idea can build, ship, and scale a real product without ever leaving their browser.',
  },

  dpLeft: {
    imageSrc: '/ai-chat.png',
    title: 'AI Coding in Your Browser',
    description:
      'Open a tab, speak your intent, watch code appear. No IDE, no local setup. Five AI platforms work directly in your browser — terminals included.',
  },

  dpRight: {
    imageSrc: '/ai-web.png',
    title: 'Live in Production. Instantly.',
    description:
      'Your server launches in seconds. One click deploys your changes live. No CI pipeline, no hosting configuration — just ship.',
  },

  platformsHeader: {
    label: 'AI Platforms',
    h2: 'Five AI Platforms. One Environment.',
    description:
      'No API keys. No local setup. All five coding platforms run on your server with full terminal access and persistent memory.',
  },

  platformCards: [
    { title: 'Claude Code', subtitle: 'Writes, runs, and fixes code in your terminal. The gold standard for AI-assisted development.',   company: 'Anthropic' },
    { title: 'Codex',       subtitle: 'Browser-native coding agent. Full project context, no terminal required.',                         company: 'OpenAI'    },
    { title: 'Gemini CLI',  subtitle: 'Long-context AI coding. Understands your entire project structure at once.',                       company: 'Google'    },
    { title: 'Qwen Code',   subtitle: 'Open-source coding agent. No subscription lock-in, powerful and free.',                           company: 'Alibaba'   },
    { title: 'Kimi Code',   subtitle: 'Context-first AI for large codebases. Excellent for refactoring and architecture.',                company: 'Moonshot'  },
    { title: 'LightRAG',    subtitle: 'Your company brain. Persistent vector memory shared across all five AI platforms.',                company: 'Fractera'  },
  ],

  problemHeader: {
    label: 'Why it matters',
    h2: 'The problems Fractera was built to solve',
    description: 'Modern development stacks are fragile, expensive, and forgetful. Here is what that costs you in practice.',
  },

  problemLabel: 'The problem',
  solutionLabel: 'How Fractera solves it',

  problemItems: [
    {
      id: 'cloud-costs',
      title: 'Unpredictable Cloud Costs',
      problem: "Auth, storage, database, email — each service bills separately and scales with traffic. What starts as free becomes a paid tier, and that tier isn't a flat $20/month — it scales with your users and their load. Miss one payment and your live product goes dark. Partners who switched to Fractera share this exact story more often than you'd expect.",
      solution: "Fractera runs everything your business needs — authentication, databases, media storage — on one server. One subscription, one bill. Cost does not scale with your users. If you pause your business, your data does not disappear. Back it up, store it, and restore when you're ready.",
    },
    {
      id: 'ai-context',
      title: 'AI Loses Context Every Session',
      problem: "Without persistent memory, every AI session starts from scratch. Tokens spent on 'where is the navbar?', 'what was the architecture decision?', or 'remind me how auth works here' are tokens not spent on your actual feature. Tasks that should take 2 focused messages take 15 back-and-forth exchanges.",
      solution: "Fractera includes LightRAG — a persistent vector store that remembers your entire codebase, every architectural decision, and your project's domain knowledge. Every AI message arrives with full context. Switching between Claude Code, Gemini CLI, or Codex doesn't mean losing the thread of your project.",
    },
    {
      id: 'product-gap',
      title: 'Products Need More Than Code',
      problem: "SEO, routing, multi-language support, auth flows, media handling — these aren't optional extras. They're what separates a toy project from a shipped product. Most developers stop at the code. Most product managers stop before it. The gap between idea and live product stays wide, and every week it stays wide costs real money.",
      solution: "Fractera ships with production-ready starters that include auth, database, file storage, and advanced routing pre-configured. The AI skips months of scaffolding and goes straight to your feature from day one. Community skill libraries help non-technical founders discover new approaches and ship faster.",
    },
    {
      id: 'failure-points',
      title: 'Too Many Single Points of Failure',
      problem: "Ten services means ten billing cycles, ten dashboards, ten places something can go wrong. When one service quietly expires, you often don't know which one caused the white screen. By the time you figure it out, the reputation damage is done. Running multiple projects multiplies every one of these risks.",
      solution: "Everything your application needs lives on your server, not spread across a dozen cloud dashboards. Your code stays on GitHub — recovery is always possible, even if dependencies have aged. Built-in AI systems can help rebuild the project even when some packages are outdated.",
    },
    {
      id: 'hardware',
      title: "Your Hardware Shouldn't Be the Limit",
      problem: "Active AI development — global memory, autonomous agents, five coding platforms running in parallel — can push your machine hard. If you're doing anything else at the same time, performance drops fast. Not everyone can afford a dedicated high-spec computer just for AI workflows.",
      solution: "With Fractera, your device carries zero load. All computation runs on your server. You can scale it up whenever your project demands — more cores, more RAM, more throughput. Works on a laptop, tablet, or phone. No reason to upgrade your hardware until you actually need to.",
    },
  ],

  pricingHeader: {
    label: 'Get Started',
    h2: 'Choose How You Want to Build',
    description: 'One-click deployment with a server included, or install on your own VPS — both give you the full Fractera environment.',
  },

  planLabels: {
    pricingPlan: 'Pricing plan',
    freeForever: 'Free forever',
    recommended: 'RECOMMENDED',
    ownServer: 'YOUR OWN SERVER',
    freeInstall: 'Free — install on your VPS',
    signInPrompt: "You'll be asked to sign in first",
    unavailableTitle: '⚠ Instant deployment temporarily unavailable',
    unavailableDesc: 'You can still subscribe — server ready within <strong>60 minutes</strong>.',
    signInButton: 'Sign in to continue',
    monthlySubLabel: 'Monthly · Server included',
    annualSubLabel: 'Annual · Best value',
    popularBadge: 'POPULAR',
    bestValueBadge: 'BEST VALUE',
    planFeatures: [
      '4 cores · 6 GB RAM · 150 GB disk',
      '5 coding platforms — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code',
      'LightRAG — the company brain',
      'Database, file storage & auth — built in',
      'Hermes — AI orchestration agent',
      'Fractera Pro included',
    ],
    freeFeatures: [
      '5 coding platforms',
      'LightRAG — the company brain',
      'Database, file storage & auth — built in',
      'Open source — self-hosted forever',
      'Fractera Pro — 14-day free trial',
    ],
    subscribeButton: 'Subscribe · {price} →',
    subscribeButtonWait: 'Subscribe · {price} (ready in ~60 min) →',
  },

  mcpSection: {
    label: 'MCP · AI Agents',
    h2: 'Deploy and Manage Your Server with an AI Agent via MCP',
    description:
      'Building and managing a production server through an AI agent inside your chat has never been this seamless. Connect Claude, Codex, or Gemini to the Fractera MCP server — deploy infrastructure, monitor installation, and launch new environments without leaving your conversation. You can also use the MCP server to diagnose and resolve any deployment issues directly from your AI chat.',
  },

  domainSection: {
    label: 'Your current access',
    h2: 'Your personal workspace',
    description:
      'Use these links to open your project. Remember that you can always find all your active servers, subscriptions, and purchases in your Dashboard — available from the top-right corner after signing in.',
  },

  installForm: {
    title: 'Install Fractera on your server',
    ipPlaceholder: 'Server IP address (e.g. 109.199.105.213)',
    loginPlaceholder: 'Login (usually: root)',
    passwordPlaceholder: 'Password',
    checking: 'Checking server...',
    alreadyInstalled: 'Fractera is already installed on this server',
    yourDomains: 'Your domains',
    removeWhiteLabel: 'Remove Fractera branding — $100',
    renewingSsl: 'Renewing SSL…',
    renewSsl: 'Renew SSL certificates',
    removing: 'Removing…',
    deleteReinstall: 'Delete and reinstall fresh',
    cantReach: "Could not reach server. You can still try installing.",
    updatesTo: 'Installation updates will be sent to',
    emailConfirmCheck: 'I understand and have access to this email address',
    emailConfirmNote: "If you don't have access to this email, sign out and sign in with an account you can access, then try again.",
    launchButton: 'Launch my server →',
    credentials: 'Your credentials are used only for installation and are never stored on our servers.',
    installFailed: 'Installation failed',
    preparing: 'Preparing...',
    tryAgain: 'Try again',
    silentWarning: 'Server has been silent for {secs}s. The installation may still be running, or the server may be unreachable.',
    errorDetails: 'Error details:',
    progressToast: {
      title: 'Deployment in progress…',
      dashboardNote: 'You can track the deployment progress at any time in your Dashboard — available in the top-right corner of the page after signing in.',
      checkboxLabel: 'I understand',
      hideButton: 'Hide',
    },
    successToast: {
      title: 'Your server has been successfully deployed',
      siteLabel: 'Your site',
      adminLabel: 'Admin panel',
      dashboardNote: 'All your servers and subscription details are available in your Dashboard — accessible from the top-right corner of the page after signing in.',
      checkboxLabel: 'I understand',
      closeButton: 'Close',
    },
  },

  featuresHeader: {
    label: "What's included",
    h2: 'Everything You Need to Ship',
    description: 'Fractera Lite covers 90% of what a professional application needs. Fractera Pro unlocks the rest.',
  },

  featureList: [
    { title: 'Voice AI Commands',     description: 'Issue coding commands and navigate content hands-free via microphone. AI agents respond to natural voice input in real time.',              badge: 'Lite' },
    { title: 'Auth Stack Built-in',   description: 'Google OAuth, magic-link via Resend, and Credentials — all pre-configured with role management and enterprise sessions.',                  badge: 'Lite' },
    { title: 'Database & Storage',    description: 'SQLite with WAL mode, object file storage, and media service included. Scales with your project without extra subscriptions.',              badge: 'Lite' },
    { title: 'GitHub & Dev Workflow', description: 'GitHub sync, production coding and local development unified. Push, pull, and deploy directly from the admin panel in one click.',          badge: 'Lite' },
    { title: 'Platforms in 50ms',     description: 'All five coding platforms pre-configured and ready to use. LightRAG global memory initialised on first start. Zero setup time.',            badge: 'Lite' },
    { title: 'Skills Marketplace',    description: 'Discover, buy, and sell AI workflows in the community library. Share free skills or monetise your own automation recipes.',                 badge: 'Lite' },
    { title: 'SEO, PWA & i18n',       description: 'Production-grade SEO, Progressive Web App support, and multi-language routing — all configured before your first user arrives.',            badge: 'Pro'  },
    { title: 'Element Highlighting',  description: 'Click any UI element to capture its exact identifier. Communicate precise changes to the AI — fewer tokens, faster iterations.',             badge: 'Pro'  },
    { title: 'Hermes AI Agents',      description: 'Fully configured agents with self-learning memory. The most powerful AI technology available in seconds — not hours of setup.',             badge: 'Pro'  },
  ],

  promoSection: {
    h2: 'Open Source — Fork It, Build Your Own Platform',
    description:
      'Fractera is fully open source. Anyone can fork the GitHub repository, self-host their own instance, and build products with AI development tools — at minimum for themselves, at maximum to launch a business: deploy servers for clients and provide consulting services.',
    githubButton: 'View on GitHub',
  },

  faqHeader: {
    label: 'FAQ',
    h2: 'Common Questions',
    description: 'Everything you need to know before getting started.',
  },

  faqItems: [
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
      q: 'Can I switch from the paid plan to free self-hosting later?',
      a: ["Yes — at any time. Here's the recommended migration path:"],
      steps: [
        'Keep your code continuously synced to GitHub throughout your subscription.',
        'Export your database and file storage to an external drive.',
        'Provision a new server and deploy a mirror of your project.',
        'Import your database and file storage, then verify the app works end-to-end.',
        'Point your custom domain to the new server, then cancel your subscription.',
      ],
    },
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
    {
      q: 'Pricing and plans — details',
      a: [
        'Fractera is open-source — you can self-host and run it entirely on your own infrastructure at no cost.',
        'Deploying with our tools gives you Fractera Lite, which covers roughly 90% of everything you need to build and ship a professional application.',
        'Want more? Fractera Pro adds advanced capabilities on top of your own server for $20/month or $149/year.',
        'Need the fastest path to a live environment? Our hosted plan includes the server, full Fractera Pro, and everything pre-configured — $25/month or $199/year.',
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
    {
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
    },
    {
      q: 'Do you have a referral program?',
      a: [
        'Yes — we offer a referral program for content creators, bloggers, and anyone interested in building their own branded version of Fractera.',
        'Partners receive a complete white-label deployment of Fractera. Partners set their own pricing within our recommended range.',
      ],
      bullets: [
        'All subscription payments go directly to the partner — 100%.',
        'All White Label purchases also go entirely to the partner.',
        'Partners define their own pricing for both subscriptions and White Label.',
        'Partners are required to retain attribution to the Fractera brand on their landing page.',
      ],
      trail: [
        'To apply: publish a public post about Fractera, then email admin@fractera.ai with the link. Deployment is a one-time $500 fee. Availability is limited.',
        'We are also looking for regional distributors. For inquiries: admin@fractera.ai',
      ],
    },
    {
      q: 'What happens when I delete my server?',
      a: ['Deleting a server from your dashboard stops all Fractera services, removes the installation from the VPS, and releases your subdomain. The VPS itself is not deleted.'],
      bullets: [
        'Your paid subscription is preserved — it is not cancelled when you delete the server.',
        'White Label status is tied to the server — it does not carry over automatically to a new deployment.',
        'Your free (self-hosted) subscription is cancelled automatically when the server is deleted.',
      ],
      trail: ['If you deleted your server by mistake and need to restore White Label without paying again, contact support@fractera.ai'],
    },
  ],

  testimonial: {
    blogButton: 'Blog',
    casesButton: 'Student Cases',
    marketplaceButton: 'Fractera Marketplace',
  },
}

// ─── Russian ──────────────────────────────────────────────────────────────────

const ru: HeroContent = {
  description:
    'За секунды — сервер с живым доменом. Начните строить проект с AI прямо в браузере.',

  featureItems: [
    { title: 'С нуля в продакшн',    text: 'Архитектура, база данных, AI-агенты, глобальная память — всё преднастроено. Сервер и домен — сразу.' },
    { title: 'Стройте продукт',      text: 'Менеджер или предприниматель — создавайте продукт и код без команды разработчиков. Библиотека сообщества помогает находить подходы и запускаться быстрее.' },
    { title: 'За пределами кода',    text: 'Разработчик, который хочет строить продукты? Освойте SEO, i18n, роутинг и другие product-навыки.' },
    { title: 'В 10× быстрее',        text: 'Профессиональные приложения — за часть времени и бюджета.' },
  ],

  dpHeader: {
    label: 'Production AI Development',
    h2: 'Запуск из браузера. Live — за секунды.',
    description:
      'Production AI Development — следующий уровень разработки. Прямо в браузере, с первой секунды. Без VS Code. Без локальной среды. Без базы данных. Без домена. Без CI-pipeline. Вы открываете вкладку: сервер запущен, домен зарегистрирован, база работает, пять AI-платформ ждут первой команды. Это не инструмент для разработчиков. Это момент, когда любой человек с идеей может создать, запустить и масштабировать реальный продукт — не выходя из браузера.',
  },

  dpLeft: {
    imageSrc: '/ai-chat.png',
    title: 'AI-разработка в браузере',
    description: 'Откройте вкладку, скажите что нужно — код появится. Без IDE, без настроек. Пять AI-платформ с терминалом — прямо в браузере.',
  },

  dpRight: {
    imageSrc: '/ai-web.png',
    title: 'В продакшн. Мгновенно.',
    description: 'Сервер запускается за секунды. Один клик — изменения в продакшн. Без CI, без настройки хостинга.',
  },

  platformsHeader: {
    label: 'AI Платформы',
    h2: 'Пять AI Платформ. Одна среда.',
    description: 'Без API-ключей. Без настроек. Все пять платформ — на вашем сервере с терминалом и постоянной памятью.',
  },

  platformCards: [
    { title: 'Claude Code', subtitle: 'Пишет, запускает и исправляет код в терминале. Золотой стандарт AI-разработки.',      company: 'Anthropic' },
    { title: 'Codex',       subtitle: 'Браузерный AI-агент. Полный контекст проекта, без терминала.',                          company: 'OpenAI'    },
    { title: 'Gemini CLI',  subtitle: 'AI с длинным контекстом. Понимает всю структуру проекта сразу.',                        company: 'Google'    },
    { title: 'Qwen Code',   subtitle: 'Open-source агент. Без подписки — мощный и бесплатный.',                                company: 'Alibaba'   },
    { title: 'Kimi Code',   subtitle: 'AI для больших кодовых баз. Отлично для рефакторинга и архитектуры.',                   company: 'Moonshot'  },
    { title: 'LightRAG',    subtitle: 'Мозг компании. Постоянная векторная память для всех пяти AI-платформ.',                 company: 'Fractera'  },
  ],

  problemHeader: {
    label: 'Почему это важно',
    h2: 'Проблемы, которые решает Fractera',
    description: 'Современные стеки ненадёжны, дороги и не помнят контекст. Вот во что это обходится.',
  },

  problemLabel: 'Проблема',
  solutionLabel: 'Как решает Fractera',

  problemItems: [
    {
      id: 'cloud-costs',
      title: 'Непредсказуемые расходы',
      problem: 'Auth, хранилище, база данных, email — каждый сервис выставляет счёт отдельно и растёт с трафиком. Бесплатное превращается в платное. И это не фиксированные $20/мес — стоимость растёт с нагрузкой. Пропустите один платёж — продукт падает.',
      solution: 'Fractera запускает всё необходимое — аутентификацию, базы данных, медиа — на одном сервере. Одна подписка, один счёт. Стоимость не растёт с пользователями. Пауза в бизнесе — данные не исчезают.',
    },
    {
      id: 'ai-context',
      title: 'AI теряет контекст',
      problem: "Без постоянной памяти каждая сессия AI начинается с нуля. Токены тратятся на «где navbar?», «какая была архитектура?», «как работает auth?». Задачи на 2 сообщения превращаются в 15.",
      solution: 'Fractera включает LightRAG — постоянное векторное хранилище с памятью о кодовой базе, архитектурных решениях и доменных знаниях. Переключение между Claude Code, Gemini CLI или Codex не прерывает контекст.',
    },
    {
      id: 'product-gap',
      title: 'Продукт — больше, чем код',
      problem: 'SEO, роутинг, мультиязычность, auth, медиа — не опции, а обязательные компоненты. Большинство разработчиков останавливаются на коде. Большинство менеджеров не доходят до него. Пропасть между идеей и продуктом стоит реальных денег каждую неделю.',
      solution: 'Fractera поставляется со стартерами: auth, база данных, хранилище, роутинг — преднастроены. AI пропускает месяцы scaffolding и сразу переходит к фиче. Библиотека сообщества помогает нетехническим основателям запускаться быстрее.',
    },
    {
      id: 'failure-points',
      title: 'Слишком много точек отказа',
      problem: 'Десять сервисов — десять платёжных циклов, десять дашбордов, десять мест где что-то сломается. Один сервис тихо истекает — непонятно какой вызвал белый экран. Репутационный ущерб нанесён раньше, чем нашли причину.',
      solution: 'Всё, что нужно приложению — на вашем сервере, не в дюжине дашбордов. Код на GitHub — восстановление возможно всегда, даже если зависимости устарели.',
    },
    {
      id: 'hardware',
      title: 'Железо — не ограничение',
      problem: 'Активная AI-разработка — глобальная память, автономные агенты, пять платформ параллельно — нагружает машину. Делайте что-то ещё — производительность падает. Не у всех есть мощный компьютер для AI.',
      solution: 'С Fractera устройство не несёт нагрузки. Все вычисления — на сервере. Масштабируйте когда нужно. Работает на ноутбуке, планшете или телефоне.',
    },
  ],

  pricingHeader: {
    label: 'Начать',
    h2: 'Выберите свой путь',
    description: 'Деплой в один клик с включённым сервером или установка на собственный VPS — оба варианта дают полную среду Fractera.',
  },

  planLabels: {
    pricingPlan: 'Тарифный план',
    freeForever: 'Бесплатно навсегда',
    recommended: 'РЕКОМЕНДУЕМ',
    ownServer: 'ВАШ СЕРВЕР',
    freeInstall: 'Бесплатно — установка на VPS',
    signInPrompt: 'Сначала потребуется войти',
    unavailableTitle: '⚠ Мгновенный деплой временно недоступен',
    unavailableDesc: 'Вы всё равно можете подписаться — сервер будет готов в течение <strong>60 минут</strong>.',
    signInButton: 'Войти, чтобы продолжить',
    monthlySubLabel: 'Ежемесячно · Сервер включён',
    annualSubLabel: 'Ежегодно · Лучшая цена',
    popularBadge: 'ПОПУЛЯРНЫЙ',
    bestValueBadge: 'ВЫГОДНЕЕ',
    planFeatures: [
      '4 ядра · 6 ГБ RAM · 150 ГБ диск',
      '5 платформ — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code',
      'LightRAG — мозг компании',
      'База данных, файлы, auth — из коробки',
      'Hermes — AI-оркестратор агентов',
      'Fractera Pro включён',
    ],
    freeFeatures: [
      '5 платформ для кода',
      'LightRAG — мозг компании',
      'База данных, файлы, auth — из коробки',
      'Open source — навсегда на своём сервере',
      'Fractera Pro — 14 дней бесплатно',
    ],
    subscribeButton: 'Подписаться · {price} →',
    subscribeButtonWait: 'Подписаться · {price} (~60 мин) →',
  },

  mcpSection: {
    label: 'MCP · AI Агенты',
    h2: 'Управляйте сервером через AI Agent по MCP',
    description:
      'Деплой и управление продакшн-сервером через AI-агент в вашем чате — теперь это просто. Подключите Claude, Codex или Gemini к Fractera MCP — деплойте инфраструктуру, следите за установкой и запускайте среды, не выходя из чата. Вы также можете использовать MCP сервер для диагностики и решения проблем, связанных с вашим развёртыванием.',
  },

  domainSection: {
    label: 'Ваш текущий доступ',
    h2: 'Персональное пространство для вашей работы',
    description:
      'Используйте эти ссылки для того чтобы открыть свой проект. Помните что вы всегда можете найти все ваши текущие сервера, подписки и покупки на вашем Дашборде — он доступен в правом верхнем углу экрана после авторизации.',
  },

  installForm: {
    title: 'Установить Fractera на сервер',
    ipPlaceholder: 'IP-адрес сервера (например, 109.199.105.213)',
    loginPlaceholder: 'Логин (обычно: root)',
    passwordPlaceholder: 'Пароль',
    checking: 'Проверка сервера...',
    alreadyInstalled: 'Fractera уже установлена на этом сервере',
    yourDomains: 'Ваши домены',
    removeWhiteLabel: 'Убрать брендинг Fractera — $100',
    renewingSsl: 'Обновление SSL…',
    renewSsl: 'Обновить SSL-сертификаты',
    removing: 'Удаление…',
    deleteReinstall: 'Удалить и переустановить',
    cantReach: 'Сервер не отвечает. Можно попробовать установить.',
    updatesTo: 'Обновления об установке придут на',
    emailConfirmCheck: 'Я понимаю и имею доступ к этому адресу',
    emailConfirmNote: 'Если нет доступа к этому email — выйдите и войдите с другой учётной записью.',
    launchButton: 'Запустить сервер →',
    credentials: 'Данные используются только для установки и не сохраняются на наших серверах.',
    installFailed: 'Установка не удалась',
    preparing: 'Подготовка...',
    tryAgain: 'Повторить',
    silentWarning: 'Сервер не отвечает {secs}с. Установка может продолжаться.',
    errorDetails: 'Подробности ошибки:',
    progressToast: {
      title: 'Развёртывание запущено…',
      dashboardNote: 'Следить за прогрессом развёртывания вы сможете в любой момент через Дашборд — он доступен в правом верхнем углу страницы после авторизации.',
      checkboxLabel: 'Я понимаю',
      hideButton: 'Скрыть',
    },
    successToast: {
      title: 'Ваш сервер успешно развёрнут',
      siteLabel: 'Ваш сайт',
      adminLabel: 'Панель управления',
      dashboardNote: 'Все ваши серверы и информация о подписке доступны в Дашборде — он находится в правом верхнем углу страницы после авторизации.',
      checkboxLabel: 'Я понимаю',
      closeButton: 'Закрыть',
    },
  },

  featuresHeader: {
    label: 'Что включено',
    h2: 'Всё для запуска',
    description: 'Fractera Lite — 90% того, что нужно профессиональному приложению. Fractera Pro — всё остальное.',
  },

  featureList: [
    { title: 'Голосовые команды AI',     description: 'Отдавайте команды и навигируйте контент голосом. AI-агенты отвечают на естественный ввод в реальном времени.',       badge: 'Lite' },
    { title: 'Auth из коробки',          description: 'Google OAuth, magic-link и Credentials — с ролями и enterprise-сессиями. Ничего настраивать не нужно.',                badge: 'Lite' },
    { title: 'База данных и хранилище',  description: 'SQLite с WAL, файловое хранилище и медиа-сервис. Масштабируется без дополнительных подписок.',                        badge: 'Lite' },
    { title: 'GitHub и рабочий процесс', description: 'GitHub sync, продакшн и локальная разработка в единой панели. Push, pull, deploy — в один клик.',                    badge: 'Lite' },
    { title: 'Платформы за 50ms',        description: 'Все пять платформ готовы к работе. LightRAG инициализируется при первом запуске. Никакой настройки.',                 badge: 'Lite' },
    { title: 'Skills Marketplace',       description: 'Покупайте и продавайте AI-воркфлоу в библиотеке сообщества. Делитесь навыками или монетизируйте рецепты автоматизации.', badge: 'Lite' },
    { title: 'SEO, PWA и i18n',          description: 'Продакшн SEO, PWA и мультиязычный роутинг — готовы до первого пользователя.',                                         badge: 'Pro'  },
    { title: 'Подсветка элементов',      description: 'Кликните на элемент — получите точный идентификатор для AI. Меньше токенов, быстрее итерации.',                       badge: 'Pro'  },
    { title: 'Hermes AI Agents',         description: 'Готовые агенты с самообучающейся памятью. Мощнейшая AI-технология за секунды — не часы настройки.',                   badge: 'Pro'  },
  ],

  promoSection: {
    h2: 'Open Source — форкни и создай свою платформу',
    description:
      'Fractera полностью open source. Форкните репозиторий, разверните собственный инстанс и создавайте продукты с AI — для себя или как бизнес: деплой серверов для клиентов и консалтинговые услуги.',
    githubButton: 'Смотреть на GitHub',
  },

  faqHeader: {
    label: 'FAQ',
    h2: 'Частые вопросы',
    description: 'Всё, что нужно знать перед стартом.',
  },

  faqItems: [
    {
      q: 'Те же AI-платформы — но Fractera даёт результат быстрее и с меньшим числом токенов. Почему?',
      a: [
        'Regular vibe coding перекладывает всё на AI: проектировать архитектуру, писать boilerplate, находить компонент, вспоминать прошлые решения. Каждый такой токен — не потраченный на вашу фичу.',
        'Fractera устраняет этот overhead на каждом уровне:',
      ],
      bullets: [
        'Готовые стартеры — Auth, база данных, хранилище и роутинг преднастроены. AI пропускает месяцы scaffolding и сразу переходит к фиче.',
        'Подсветка компонентов — кликните на элемент живого сайта и прыгните в источник. Никаких токенов на «где navbar?».',
        'LightRAG, мозг компании — постоянное векторное хранилище. Полный контекст кодовой базы и архитектурных решений в каждом сообщении.',
        'Оптимизированные инструкции — готовые промпты для нетехнических разработчиков. Правильный подход с первой попытки.',
        'Кросс-платформенная оркестрация — LightRAG координирует все пять платформ. Переключение с Claude Code на Gemini CLI не обрывает контекст.',
      ],
      trail: [
        'Результат: задачи на 10–20 сообщений в обычном AI-чате решаются за 2–3 обмена в Fractera — AI уже знает вашу кодовую базу.',
        'Это Fractera Pro. Попробовав раз, к обычному vibe coding не возвращаются.',
      ],
    },
    {
      q: 'Как Fractera обеспечивает стабильность бизнеса?',
      a: [
        'Современная формула соблазнительна: несколько «бесплатных» сервисов вокруг Vercel — Clerk для auth, Supabase для базы данных, дюжина облачных API. Отлично выглядит в первый день.',
        'Проблемы начинаются, когда прототип становится реальным бизнесом. Каждый сервис тихо обновляет тарифы. Бесплатное превращается в платное — и растёт с трафиком.',
        'Хуже того: десять платёжных циклов. Пропустите один — проект падает. Без предупреждения. Партнёры, перешедшие на Fractera, рассказывают именно это: живой проект упал из-за одного истёкшего сервиса. Репутационный ущерб был нанесён раньше, чем нашли причину.',
        'Fractera построен на другом принципе: всё что нужно бизнесу — auth, базы данных, медиа — на вашем сервере, не в дюжине дашбордов.',
      ],
      bullets: [
        'Одна подписка, один сервер — стоимость не растёт с пользователями.',
        'Пауза в бизнесе — данные не исчезают. Сделайте backup и восстановите когда будете готовы.',
        'Код на GitHub — восстановление возможно всегда, даже если зависимости устарели.',
        'Встроенные AI-системы помогут пересобрать проект даже с устаревшими пакетами.',
      ],
      trail: ['Один сервер. Один счёт. Максимальная устойчивость — для одного проекта или десяти.'],
    },
    {
      q: 'Какие характеристики сервера нужны?',
      a: [
        'Для полной AI-разработки — минимум 6 ядер и 8 ГБ RAM. Хранилище зависит от проекта: 75 ГБ — хорошая база, больше — если планируете видео или медиафайлы.',
        'Когда активная разработка завершена — можно снизить до 2 ядер / 4 ГБ RAM. Такие серверы стоят €1–2 в месяц.',
      ],
    },
    {
      q: 'Можно ли перейти с платного плана на самостоятельный хостинг?',
      a: ['Да — в любое время. Рекомендуемый путь миграции:'],
      steps: [
        'Держите код синхронизированным с GitHub на протяжении всей подписки.',
        'Экспортируйте базу данных и файловое хранилище на внешний накопитель.',
        'Разверните новый сервер и задеплойте копию проекта.',
        'Импортируйте данные и проверьте приложение полностью.',
        'Перенаправьте домен на новый сервер, затем отмените подписку.',
      ],
    },
    {
      q: 'Можно ли перенести существующий проект в Fractera?',
      a: ['Да. Подключите существующий GitHub-репозиторий к рабочему пространству Fractera и сразу начните разработку с AI. В зависимости от сложности проекта могут потребоваться начальные шаги миграции — встроенные AI-ассистенты Fractera помогут.'],
    },
    {
      q: 'Можно ли задеплоить готовый проект на Vercel?',
      a: [
        'Да — когда проект готов и больше не нуждается в активной AI-разработке, можно экспортировать на Vercel.',
        'Важно: переход на Vercel означает выход из среды Fractera. AI-workspace, доступ к терминалу, LightRAG и все пять платформ работают только на вашем сервере.',
        'Учтите: тарифы Vercel и облачного хранилища могут быстро вырасти при реальном трафике. Вернуться на self-hosted Fractera несложно — код уже на GitHub.',
      ],
    },
    {
      q: 'Тарифные планы — подробнее',
      a: [
        'Fractera — open source. Полностью на своей инфраструктуре без каких-либо затрат.',
        'Деплой с нашими инструментами даёт Fractera Lite — покрывает ~90% всего необходимого для профессионального приложения.',
        'Хотите больше? Fractera Pro добавляет расширенные возможности: $20/мес или $149/год.',
        'Нужен быстрый старт? Hosted план включает сервер, Fractera Pro и всё преднастроенное: $25/мес или $199/год.',
      ],
    },
    {
      q: 'Можно ли совмещать локальную разработку с Fractera?',
      a: [
        'Да — для разработчиков с существующей локальной средой это часто самый естественный путь.',
        'Если вы предпочитаете hot reload в своей IDE — менять привычки не нужно:',
      ],
      steps: [
        'Подключите проект к GitHub-репозиторию и запушьте начальную кодовую базу.',
        'Скопируйте код локально. Разрабатывайте как всегда — ваша IDE, hot reload.',
        'Готово к деплою — запушьте изменения на GitHub.',
        'Вернитесь в Fractera workspace, сделайте pull и нажмите Deploy.',
      ],
      trail: [
        'Изменения выходят в продакшн за минуты. Ваш сервер — self-hosted альтернатива Vercel: GitHub — мост между локальной средой и продакшном.',
        'Локальная среда использует базу данных и хранилище на вашем сервере — без облачных подписок.',
      ],
    },
    {
      q: 'Можно ли убрать брендинг "Powered by Fractera"?',
      a: ['Да — White Label это единоразовая покупка за $100 за сервер. После оплаты брендинг Fractera удаляется автоматически и навсегда.'],
      bullets: [
        'Мгновенно: брендинг исчезает сразу после обработки платежа.',
        'Постоянно: при пересборке сервера White Label восстанавливается автоматически.',
        'За сервер: каждый сервер требует отдельной покупки.',
      ],
      trail: [
        'Для покупки: откройте Dashboard, выберите сервер и нажмите «Убрать брендинг Fractera».',
        'Совет: после удаления проверьте сайт в режиме инкогнито — основной браузер может показывать кешированную версию.',
      ],
    },
    {
      q: 'Есть ли реферальная программа?',
      a: [
        'Да — программа для создателей контента, блогеров и всех, кто хочет создать собственную брендированную версию Fractera.',
        'Партнёры получают полный white-label деплой Fractera с лендингом и инфраструктурой. Партнёры сами устанавливают цены.',
      ],
      bullets: [
        '100% платежей по подписке — партнёру.',
        '100% покупок White Label — партнёру.',
        'Партнёры сами определяют цены для подписок и White Label.',
        'Обязательно сохранить атрибуцию бренда Fractera на лендинге.',
      ],
      trail: [
        'Для заявки: опубликуйте статью о Fractera, отправьте письмо на admin@fractera.ai со ссылкой. Единоразовый деплой: $500. Доступность ограничена.',
        'Ищем региональных дистрибьюторов. По вопросам: admin@fractera.ai',
      ],
    },
    {
      q: 'Что происходит при удалении сервера?',
      a: ['Удаление сервера останавливает все сервисы Fractera, удаляет установку с VPS и освобождает субдомен. Сам VPS не удаляется — остаётся у хостинг-провайдера.'],
      bullets: [
        'Платная подписка сохраняется — не отменяется при удалении сервера.',
        'White Label привязан к серверу — при деплое нового автоматически не переносится.',
        'Бесплатная (self-hosted) подписка отменяется автоматически при удалении.',
      ],
      trail: ['Если удалили сервер случайно и нужно восстановить White Label без повторной оплаты — напишите на support@fractera.ai.'],
    },
  ],

  testimonial: {
    blogButton: 'Блог',
    casesButton: 'Кейсы студентов',
    marketplaceButton: 'Fractera Marketplace',
  },
}

// ─── Getter ───────────────────────────────────────────────────────────────────

const CONTENT: Record<string, HeroContent> = { en, ru }

export function getContent(lang: string): HeroContent {
  return CONTENT[lang] ?? CONTENT.en
}
