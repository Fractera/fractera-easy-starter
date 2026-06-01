import type { SiteContent } from '../../types'

type MarketplacePart = Pick<SiteContent, 'marketplace'>

export const marketplace: MarketplacePart = {
  marketplace: {
    linkedNote: 'Opened from your Fractera workspace.',
    skills: {
      h1: 'Fractera Skills',
      intro:
        'A marketplace for reusable AI workflows — discover proven recipes, or package and sell your own.',
      comingSoon: 'Coming soon',
      comingSoonNote: 'The skills marketplace is on our roadmap. Stay with us.',
    },
    productLoop: {
      h1: 'Product Loop',
      intro:
        'More than a skill: the digitized end-to-end entrepreneurial journey — from registering a company to traffic, unit economics and scaling — as the decision logic another founder can buy.',
      comingSoon: 'Coming soon',
      comingSoonNote: 'The product loop is our long-term goal. Stay with us — we will build it together.',
    },
  },
}
