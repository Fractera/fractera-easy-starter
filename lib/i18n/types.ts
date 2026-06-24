export type FaqItem = {
  q: string
  a: string[]
  steps?: string[]
  bullets?: string[]
  trail?: string[]
  // Optional CTA-button at the bottom of the open FAQ item. Used to drive
  // readers from a question (e.g. "How do I earn with Fractera?") to the
  // relevant landing area (e.g. /[lang]/partners).
  cta?: { label: string; href: string }
}

export type SiteContent = {
  heroBadge: string
  heroTitle: string
  // Manifesto statement shown directly under the hero illustration — a powerful but
  // soft one-paragraph positioning of what Fractera is.
  heroManifesto?: string
  deployButton: string
  heroButtonCaption?: string
  // Label for the "learn the architecture" link under the hero benefits block.
  architectureCta?: string
  // Button label linking to the /ai-development-loop reference page, shown inside
  // the "Production AI Coding" section (internal linking / SEO).
  devLoopCta?: string
  // In-text reference links shown under the hero (internal linking / SEO) — all
  // three single-canonical reference pages.
  referenceLinks?: { intro: string; architecture: string; knowledgeBase: string; developmentLoop: string }
  description: string
  lightPitch: {
    label: string
    h2: string
    body: string
    cta: string
  }
  // Which narrative section renders in the hero slot (after the connect-framework
  // block). A data-driven discriminator instead of a `lang === 'ru'` component
  // swap in the page: each language picks its variant. 'none' renders no narrative
  // section (EN now uses 'none' — the Elon-Trillion block moved to the blog). The
  // variant → component map lives in lib/content/hero-narrative-registry.ts (a
  // Partial map: 'none' has no entry, so the page simply renders nothing).
  heroNarrativeVariant: 'elon-trillion' | 'import-substitution' | 'none'
  elonTrillion: {
    label: string
    h2: string
    description: string
    quote: string
    author: string
    source: string
    watchButton: string
    videoUrl: string
  }
  featureItems: { title: string; text: string }[]
  heroBenefitsHeader: { h2: string; cardLink: string }
  heroBenefits: { title: string; text: string }[]
  // First H2 after the hero — the "Ultimate Scale" hub: a near-zero-token scale
  // claim, a pricing CTA, a 3-column H3 teaser (each column links to a deeper page
  // or on-page section) and an amber footnote about the one-click classic mode.
  ultimateScale: {
    badge: string
    h2: string
    description: string
    columns: { title: string; text: string; linkLabel: string; href: string }[]
    footnote: string
  }
  loopShowcase: {
    label: string
    h2: string
    description: string
    slides: {
      label: string
      sublabel: string
      title: string
      description: string
      imageSrc?: string
    }[]
  }
  dpHeader: { label: string; h2: string; description: string }
  dpLeft: { imageSrc: string; title: string; description: string }
  dpRight: { imageSrc: string; title: string; description: string }
  platformsHeader: { label: string; h2: string; description: string; disclaimer: string }
  platformCards: { title: string; subtitle: string; company: string }[]
  // "Connect your framework" — marketing section directly under the pricing/deploy
  // block. Reframes the product from "we deploy a 50k-line Next app" to "deploy a
  // starter of ANY framework (or any public repository)". VISION-toned: today the
  // deploy pipeline wires only the Next starter (FNS); the framework cards are
  // placeholders (href="/#") leading to upcoming per-framework guides. `frameworks`
  // is the curated ordered list of card labels; `collapsedCount` is how many show
  // before "Show all". `showAll`/`hide` are the toggle button labels; `hint` is the
  // orange line below the grid.
  connectFramework: {
    badge: string
    h2: string
    description: string
    frameworks: string[]
    collapsedCount: number
    showAll: string
    hide: string
    hint: string
  }
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
    disclaimer: string
    trustItems: [string, string, string]
  }
  serverSection: {
    label: string
    h2: string
    description: string
    providers: { name: string; tagline: string; url: string; price?: string }[]
  }
  domainProviderSection: {
    label: string
    h2: string
    description: string
    providers: { name: string; tagline: string; url: string; price?: string }[]
  }
  mcpSection: {
    label: string
    h2: string
    description: string
    serverUrlLabel: string
    serverUrl: string
    copy: string
    copied: string
    helpHint: string
    sliderH3: string
    sliderCaption: string
    docLink: string
  }
  domainSection: { label: string; h2: string; description: string }
  installForm: {
    title: string
    ipPlaceholder: string
    loginPlaceholder: string
    passwordPlaceholder: string
    passwordHint: string
    security: { note: string; passwordAck: string }
    checking: string
    alreadyInstalled: string
    yourDomains: string
    removeWhiteLabel: string
    renewingSsl: string
    renewSsl: string
    removing: string
    deleteReinstall: string
    wipe: { clearButton: string; clearing: string; clearedToast: string; errorHint: string }
    cantReach: string
    updatesTo: string
    emailConfirmCheck: string
    emailConfirmNote: string
    componentSelect: {
      fullLabel: string
      customLabel: string
      customHint: string
      agentsTitle: string
      servicesTitle: string
      coreNote: string
      items: Record<
        'claude-code' | 'codex' | 'gemini-cli' | 'qwen-code' | 'kimi-code' | 'memory' | 'brain',
        { name: string; desc: string }
      >
    }
    frameworkSelect: {
      chooseLabel: string
      soon: string
      repoUrlLabel: string
      repoUrlPlaceholder: string
      repoUrlHint: string
    }
    launchButton: string
    credentials: string
    installFailed: string
    preparing: string
    tryAgain: string
    silentWarning: string
    errorDetails: string
    // Fallback line under a failed install: "<prefix><link> — <suffix>" where
    // <link> points to the partner/MCP page. Split into three keys so word order
    // stays translatable (the link sits mid-sentence).
    errorMcpPrefix: string
    errorMcpLink: string
    errorMcpSuffix: string
    progressToast: { title: string; dashboardNote: string; checkboxLabel: string; hideButton: string; domainTipTitle: string; domainTipBody: string; domainButton: string; dnsButton: string; dnsIntro: string; dnsCovers: string }
    successToast: { title: string; siteLabel: string; adminLabel: string; dashboardNote: string; checkboxLabel: string; closeButton: string }
  }
  featuresHeader: { label: string; h2: string; description: string }
  featureList: { title: string; description: string; badge: string; vip?: boolean }[]
  promoSection: { h2: string; description: string; githubButton: string }
  companyBrain: {
    label: string
    h2: string
    subhead: string
    imageAlt: string
    intro: string
    pillarsTitle: string
    pillars: { title: string; text: string }[]
    pricingLabel: string
    pricingBody: string
    limitedLabel: string
    limitedBody: string
    assuranceTitle: string
    assuranceBody: string
    ctaTitle: string
    ctaBody: string
    ctaButton: string
  }
  // "Next.js Aircraft Carrier" deep-dive section (#aircraft-carrier) — a short
  // intro + an interactive parallel-routing slot demo (ported from the admin
  // platform panel) + a primer + a footnote link to /next-aircraft-carrier.
  aircraftCarrier: {
    badge: string
    h2: string
    intro: string
    demoHint: string
    primer: string
    // Always-glowing founder's manifesto card below the primer. `mcpLine` carries an
    // inline link that scrolls to the on-page MCP section (#mcp-section).
    manifesto: {
      body: string[]
      mcpLine: { pre: string; link: string; post: string }
      signature: string
    }
    linkLabel: string
    linkDesc: string
  }
  faqHeader: { label: string; h2: string; description: string }
  faqItems: FaqItem[]
  testimonial: { blogButton: string; docsButton: string; casesButton: string; marketplaceButton: string }
  sponsorship: {
    label: string
    h2: string
    body: string[]
    tiers: { id: 's1' | 's5' | 's20'; amount: string; period: string; sublabel: string; badge?: string; perks: string[] }[]
    sponsorButton: string
    signInPrompt: string
    signInButton: string
    thankYouTitle: string
    thankYouBody: string
    ourSponsorsLabel: string
    ourSponsorsLink: string
  }
  marketplace: {
    linkedNote: string
    skills: { h1: string; intro: string; comingSoon: string; comingSoonNote: string }
    productLoop: { h1: string; intro: string; comingSoon: string; comingSoonNote: string }
  }
  // Framework-expert feedback (callback card + slide-over drawer on every
  // /framework/<slug> page). Universal copy: `{framework}` is replaced at render
  // with the page's framework name (e.g. "Next.js"), so one string set serves all
  // framework pages. Lives in the i18n shell (no hardcoded lang ternary in the
  // components — they consume this resolved object).
  frameworkFeedback: {
    card: { eyebrow: string; title: string; text: string; label: string }
    drawer: {
      eyebrow: string
      title: string
      subtitle: string
      nameLabel: string
      githubLabel: string
      githubPlaceholder: string
      aboutLabel: string
      aboutPlaceholder: string
      wishLabel: string
      wishPlaceholder: string
      emailLabel: string
      emailHint: string
      spamLabel: string
      submit: string
      submitting: string
      sendFailed: string
      successTitle: string
      successBody: string
      successClose: string
    }
  }
  // Подпись под каждой из 9 кнопок «Запустить в 1 клик». Своя на секцию, но все
  // несут идею «волшебно легко и супер эффективно». Опционально: языки, где не
  // задано, рендерят кнопку без подписи. EN+RU заданы.
  deployCaptions?: {
    afterHero: string
    afterUltimateScale: string
    afterAircraftCarrier: string
    afterLoop: string
    afterPresentation: string
    afterPlatforms: string
    afterProblem: string
    afterFeatures: string
    afterBrain: string
    afterSponsors: string
    afterFaq: string
  }
  // Блок «Импортозамещение» — заменяет Elon-секцию в RU-потоке (продакшн-периметр
  // под 152-ФЗ). Опционально: рендерится только когда задан (RU).
  importSubstitution?: {
    label: string
    h2: string
    description: string
    points: { title: string; text: string }[]
  }
  // Global site-header nav labels (shown on every page). Kept in the i18n shell
  // so the header follows the site language without a `lang === 'ru'` block.
  siteHeader: {
    deploy: string
    vpsDeploy: string
    mcpDeploy: string
    frameworks: string
    companyBrain: string
    docs: string
    blog: string
    news: string
    signIn: string
    servers: string
    purchases: string
    partnerCabinet: string
    signOut: string
  }
}

export type SiteMeta = {
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  organizationDescription: string
}

// Cookie consent banner. Kept in locale files (not hardcoded) so future
// per-country compliance text (GDPR/CCPA/...) can be expressed by adding
// a new locale entry without touching the component.
// `message` uses a literal {policy} placeholder which the banner replaces
// with a link whose visible text is `policyLinkLabel`.
export type CookieBannerContent = {
  message: string
  policyLinkLabel: string
  accept: string
  decline: string
}

// Strings for the authenticated dashboard (Servers tab, etc.). Add keys here
// and a translation in every locales/<lang>/dashboard.ts as the dashboard grows.
export type DashboardContent = {
  passwordNeverStored: string
  // Header label for the partner-cabinet view of the dashboard modal.
  partnerCabinetTitle: string
  // "Not registered as a partner yet" notice: "<pre><link><post>" where <link>
  // points to /<lang>/partners. Split into three keys so the link can sit
  // mid-sentence in any language.
  partnerNotRegisteredPre: string
  partnerNotRegisteredLink: string
  partnerNotRegisteredPost: string
}
