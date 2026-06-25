import type { DocMeta } from '../../_lib/types'

// Non-translatable fields shared by every language of this doc. `image.web` is both the
// responsive hero and the social snippet (og:image) per the page-image rule.
export const meta: DocMeta = {
  slug: 'build-time-env-and-redeploy',
  date: '2026-06-25',
  readingMinutes: 8,
  tags: ['Environment variables', 'Production redeploy', 'Build-time config', 'Next.js', 'Agentic engineering', 'Reliability'],
  image: {
    mobile: '/docs/build-time-env-and-redeploy-screenshot-2026-06-25.png',
    web: '/docs/build-time-env-and-redeploy-screenshot-2026-06-25.png',
    alt: 'Build-time environment variables and production redeploy: an AI agent saves a value to the app slot’s .env.local and the slot-scoped build bakes it correctly on redeploy — languages, Stripe keys and custom variables surviving every rebuild.',
  },
}
