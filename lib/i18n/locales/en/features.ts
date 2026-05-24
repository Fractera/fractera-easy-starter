import type { SiteContent } from '../../types'

type FeaturesPart = Pick<SiteContent,
  | 'featuresHeader' | 'featureList'
  | 'promoSection'
  | 'faqHeader' | 'testimonial'
>

export const features: FeaturesPart = {
  featuresHeader: {
    label: "What's included",
    h2: 'Production-Ready Full-Stack Engineering Features',
    description: 'Fractera Light covers 90% of what a professional application needs. Fractera Pro unlocks the remaining 10%.',
  },

  featureList: [
    { title: 'Voice AI Commands',     description: 'Issue coding commands and navigate content hands-free via microphone. AI agents respond to natural voice input in real time.',             badge: 'Light' },
    { title: 'Auth Stack Built-in',   description: 'Google OAuth, magic-link via Resend, and Credentials — all pre-configured with role management and enterprise sessions.',                 badge: 'Light' },
    { title: 'Database & Storage',    description: 'SQLite with WAL mode, object file storage, and media service included. Scales with your project without extra subscriptions.',             badge: 'Light' },
    { title: 'GitHub & Dev Workflow', description: 'GitHub sync, production coding and local development unified. Push, pull, and deploy directly from the admin panel in one click.',         badge: 'Light' },
    { title: 'Platforms in 50ms',     description: 'All five coding platforms preconfigured and ready to use. LightRAG global memory initialized on first start. Zero setup time.',           badge: 'Light' },
    { title: 'Skills Marketplace',    description: 'Discover, buy, and sell AI workflows in the community library. Share free skills or monetise your own automation recipes.',                badge: 'Light' },
    { title: 'SEO, PWA & i18n',       description: 'Production-grade SEO, Progressive Web App support, and multi-language routing — all configured before your first user arrives.',          badge: 'Pro'  },
    { title: 'Element Highlighting',  description: 'Click any UI element to capture its exact identifier. Communicate precise changes to the AI — fewer tokens, faster iterations.',           badge: 'Pro'  },
    { title: 'Hermes AI Agents',      description: 'Fully configured agents with self-learning memory. The most powerful AI technology available in seconds — not hours of setup.',           badge: 'Pro'  },
  ],

  promoSection: {
    h2: 'Fork and Build a Custom White-Label AI Platform',
    description:
      'Fractera is fully open source. Anyone can fork the GitHub repository, self-host their own instance, and build products with AI development tools — at minimum for themselves, at maximum to launch a business: deploy servers for clients and provide consulting services.',
    githubButton: 'View on GitHub',
  },

  faqHeader: {
    label: 'FAQ',
    h2: 'Fractera Technical Architecture FAQ',
    description: 'Everything you need to know before getting started.',
  },

  testimonial: {
    blogButton: 'Blog',
    casesButton: 'Student Cases',
    marketplaceButton: 'Fractera Marketplace',
  },
}
