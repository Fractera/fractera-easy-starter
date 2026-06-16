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
  heroBenefitsHeader: { h2: string }
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
}
