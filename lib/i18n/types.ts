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
  heroTitle: string
  deployButton: string
  description: string
  featureItems: { title: string; text: string }[]
  heroBenefitsHeader: { h2: string }
  heroBenefits: { title: string; text: string }[]
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
  mcpSection: {
    label: string
    h2: string
    description: string
    serverUrlLabel: string
    serverUrl: string
    copy: string
    copied: string
    helpHint: string
  }
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
    progressToast: { title: string; dashboardNote: string; checkboxLabel: string; hideButton: string }
    successToast: { title: string; siteLabel: string; adminLabel: string; dashboardNote: string; checkboxLabel: string; closeButton: string }
  }
  featuresHeader: { label: string; h2: string; description: string }
  featureList: { title: string; description: string; badge: string }[]
  promoSection: { h2: string; description: string; githubButton: string }
  blackBox: {
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
    ctaTitle: string
    ctaBody: string
    ctaButton: string
  }
  faqHeader: { label: string; h2: string; description: string }
  faqItems: FaqItem[]
  testimonial: { blogButton: string; casesButton: string; marketplaceButton: string }
  sponsorship: {
    label: string
    h2: string
    body: string[]
    tiers: { id: 's1' | 's5' | 's20'; amount: string; period: string; sublabel: string; badge?: string }[]
    sponsorButton: string
    signInPrompt: string
    signInButton: string
    thankYouTitle: string
    thankYouBody: string
    perksTitle: string
    perks: string[]
    ourSponsorsLabel: string
    ourSponsorsLink: string
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

// Fractera Light — separate product. Private remote backend (auth+roles, DB,
// storage, Cloudflare SSL, landing+dashboard with role-based routing) that
// syncs to your local AI-powered dev machine via git. Traditional dev/prod
// workflow — only the prod side is now under your full control.
// Lives at /[lang]/light. See reports/research/light-seo-keymap-2026-05.md.
export type LightContent = {
  hero: {
    badge: string
    eyebrow: string
    h1: string
    description: string
    ctaPrimary: string
    ctaSecondary: string
  }
  benefitsHeader: { label: string; h2: string; description: string }
  benefits: { h3: string; text: string }[]
  howItWorks: {
    label: string
    h2: string
    description: string
    steps: { title: string; text: string }[]
  }
  extrasCta: {
    label: string
    h2: string
    description: string
    cta: string
    href: string
  }
  audience: {
    label: string
    h2: string
    description: string
    fits: string[]
    notFits: string[]
    fitsLabel: string
    notFitsLabel: string
  }
  problem: { label: string; h2: string; description: string; items: { h3: string; text: string }[] }
  comparison: {
    label: string
    h2: string
    description: string
    productLabel: string
    competitors: string[]
    rows: { feature: string; values: (boolean | string)[] }[]
  }
  deploy: {
    label: string
    h2: string
    description: string
    vpsHint: string
    cta: string
    ctaHint: string
  }
  faq: {
    label: string
    h2: string
    items: {
      q: string
      a: string[]
      steps?: string[]
      bullets?: string[]
      trail?: string[]
    }[]
  }
  ctaFooter: { label: string; h2: string; description: string; cta: string }
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
