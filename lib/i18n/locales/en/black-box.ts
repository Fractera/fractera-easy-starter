import type { SiteContent } from '../../types'

type BlackBoxPart = Pick<SiteContent, 'blackBox'>

export const blackBox: BlackBoxPart = {
  blackBox: {
    label: 'Fractera Black Box',
    h2: 'Private AI Studio as a Physical Appliance — Delivered, Tuned, and Supported by the Fractera Founder',
    subhead:
      'For B2B teams who want maximum AI automation behind their own firewall — built into Apple Silicon hardware, never in someone else\'s cloud.',
    imageAlt: 'Fractera Black Box — Mac mini AI appliance',
    intro:
      'Fractera Black Box is a turnkey private AI workspace shipped as a physical device — Mac mini or Mac Studio — with the full Fractera environment pre-installed, all five AI coding platforms wired and authenticated, and the LightRAG company-brain pre-configured. No cloud account. No data leaves your office. No DevOps team required to operate it.',
    pillarsTitle: 'What is included in the engagement',
    pillars: [
      {
        title: 'Founder-led process audit',
        text:
          'The Fractera architect and founder personally studies your workflows, identifies the highest-leverage automation points, and designs a tailor-made AI environment for your business — not a generic template.',
      },
      {
        title: 'Apple Silicon appliance',
        text:
          'A Mac mini or Mac Studio shipped to your office with Fractera, the five AI coding platforms, and your private LightRAG knowledge base already wired in. Power on and start working on day one.',
      },
      {
        title: 'Five AI platforms ready on day one',
        text:
          'Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code — all pre-authenticated against your existing subscriptions. No keys to wire, no SSH tunnels to build, no waiting on IT.',
      },
      {
        title: '12 months of post-delivery support',
        text:
          'Hands-on support, software updates, and continuous process refinement throughout the first year. Year two onward — by agreement, scoped to the needs that have surfaced during year one.',
      },
    ],
    pricingLabel: 'Pricing',
    pricingBody:
      'By agreement. Each Black Box engagement is scoped individually, because each business is different. The package always includes the founder consulting, the physical device (Mac mini or Mac Studio), and the 12-month first-year support window.',
    limitedLabel: 'Limited capacity',
    limitedBody:
      'Strictly limited program. We accept a small number of partner businesses per quarter — the depth of personal involvement is the value, and that requires bandwidth.',
    ctaTitle: 'Apply for a founder consultation',
    ctaBody:
      'Tell us about your business, your current AI stack, and what you want to automate. A short conversation with the Fractera founder is the first step — no commitment, no pitch deck, just a working session to see if Black Box is the right fit.',
    ctaButton: 'Email blackbox@fractera.ai',
  },
}
