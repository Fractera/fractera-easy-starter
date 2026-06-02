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
    { title: 'Hermes AI Agents',      description: 'Fully configured agents with self-learning memory. The most powerful AI technology available in seconds — not hours of setup.',           badge: 'For all users' },
    { title: 'Voice AI Commands',     description: 'Issue coding commands and navigate content hands-free via microphone. Agents respond to natural voice input in real time.',             badge: 'For all users' },
    { title: 'Auth Stack Built-in',   description: 'Google OAuth, magic-link via Resend, and Credentials — all pre-configured with role management and enterprise sessions.',                 badge: 'For all users' },
    { title: 'Database & Storage',    description: 'SQLite with WAL mode, object file storage, and media service included. Scales with your project without extra subscriptions.',             badge: 'For all users' },
    { title: 'Backups & Restore',     description: "Snapshot your database and object storage at any moment, then upload the archive to restore your project or clone it into a new one.",      badge: 'For all users' },
    { title: 'GitHub & Dev Workflow', description: 'GitHub sync, production coding and local development unified. Push, pull, and deploy directly from the admin panel in one click.',         badge: 'For all users' },
    { title: 'Platforms in 50ms',     description: 'All five coding platforms preconfigured and ready to use. LightRAG global memory initialized on first start. Zero setup time.',           badge: 'For all users' },
    { title: 'Skills Marketplace',    description: 'Discover, buy, and sell automation workflows in the community library. Share free skills or monetise your own recipes.',                badge: 'For all users' },
    { title: 'SEO, PWA & i18n',       description: 'Production-grade SEO, Progressive Web App support, and multi-language routing — all configured before your first user arrives.',          badge: 'For VIP sponsors', vip: true },
    { title: 'Element Highlighting',  description: 'Click any UI element to capture its exact identifier. Communicate precise changes to the AI — fewer tokens, faster iterations.',           badge: 'For VIP sponsors', vip: true },
    { title: 'Parallel Routing',      description: "Up to 11 parallel routing slots with static SEO: tabs within one window update each other's state with no page reload at all.",            badge: 'For VIP sponsors', vip: true },
    { title: 'Ready-made Sections',   description: 'Prebuilt page blocks cut token spend many times over: header, footer, AI, tools, advanced SEO architecture and a design platform.',         badge: 'For VIP sponsors', vip: true },
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
