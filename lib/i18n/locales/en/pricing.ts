import type { SiteContent } from '../../types'

type PricingPart = Pick<SiteContent, 'pricingHeader' | 'planLabels' | 'serverSection'>

// Bake-in at build time via `next build`. Fallback = Cloud VPS 10 / Ubuntu 24.04 product page.
const CONTABO_URL = process.env.NEXT_PUBLIC_CONTABO_AFFILIATE_URL
  || 'https://contabo.com/en/vps/cloud-vps-10/?image=ubuntu.332&qty=1&contract=12&storage-type=cloud-vps-10-150-gb-ssd'

export const pricing: PricingPart = {
  pricingHeader: {
    label: 'Get Started',
    h2: 'Deploy Private AI Infrastructure on Your Own Server',
    // PAID_PLAN_HIDDEN — НЕ УДАЛЯТЬ: оригинал — 'One-click deployment with a server included, or install on your own VPS — both give you the full Fractera environment.'
    description: 'Install Fractera on your own VPS and get the full AI development environment — completely free and open source.',
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
    h2: 'Recommended Ubuntu 24.04 VPS Provider for AI Workloads',
    description: 'Fractera installs on any Ubuntu 24.04 VPS with 4 cores and 6 GB RAM. Contabo is our recommended choice — high-resource configurations at the lowest price point, popular among AI builders.',
    providers: [
      { name: 'Contabo', tagline: 'High-resource VPS at unbeatable prices. Popular for AI workloads.', url: CONTABO_URL },
    ],
  },
}
