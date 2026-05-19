import type { SiteContent } from '../../types'

type PricingPart = Pick<SiteContent, 'pricingHeader' | 'planLabels' | 'serverSection'>

export const pricing: PricingPart = {
  pricingHeader: {
    label: 'Get Started',
    h2: 'Deploy Private AI Infrastructure: Choose Your Stack',
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
      'Hermes — AI orchestration agent',
      '4 cores · 6 GB RAM · 150 GB disk',
      '5 coding platforms — Claude Code · Codex · Gemini CLI · Qwen Code · Kimi Code',
      'LightRAG — the company brain',
      'Database, file storage & auth — built in',
    ],
    freeFeatures: [
      'Hermes — AI orchestration agent',
      '5 coding platforms',
      'LightRAG — the company brain',
      'Database, file storage & auth — built in',
      'Open source — self-hosted forever',
    ],
    subscribeButton: 'Subscribe · {price} →',
    subscribeButtonWait: 'Subscribe · {price} (ready in ~60 min) →',
    disclaimer: '* Regardless of the chosen plan — immediately after installation is complete, you must change the password for access to your server. Remember: Fractera does not gain control over your code, and access to your servers is not available to us. This is your own software on your own servers, which Fractera helps install — and nothing more.',
    trustItems: ['Your server', 'Your domain', 'Your AI'],
  },

  serverSection: {
    label: 'Where to buy',
    h2: 'Validated Ubuntu 24.04 VPS Providers for AI Workloads',
    description: 'Fractera installs on any Ubuntu 24.04 VPS with 4 cores and 6 GB RAM. These providers are tested and trusted — pick whichever suits your region and budget.',
    providers: [
      { name: 'Contabo',      tagline: 'High-resource VPS at unbeatable prices. Popular for AI workloads.', url: 'https://contabo.com' },
      { name: 'Netcup',       tagline: 'German-quality hosting with generous specs and fair pricing.',        url: 'https://www.netcup.com' },
      { name: 'Hetzner',      tagline: 'Best price-to-performance in Europe. Fast NVMe storage included.',   url: 'https://www.hetzner.com' },
      { name: 'DigitalOcean', tagline: 'Developer-friendly cloud. Simple setup, global data centers.',       url: 'https://www.digitalocean.com' },
    ],
  },
}
