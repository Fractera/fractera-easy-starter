import type { DocMeta } from '../../_lib/types'

// Non-translatable fields shared by every language of this doc. `image.web` is both
// the responsive hero and the social snippet (og:image) per the page-image rule.
export const meta: DocMeta = {
  slug: 'content-engine-architecture',
  date: '2026-06-22',
  readingMinutes: 9,
  tags: ['Content engine', 'Co-location', 'Token economy', 'Design system', 'Architecture', 'Next.js'],
  image: {
    mobile: '/docs/Content-Engine-Architecture.jpg',
    web: '/docs/Content-Engine-Architecture.jpg',
    alt: 'Content Engine architecture diagram: a post (POST-12345) is assembled from a POST TEMPLATE and its DATA; the shared Content Engine composes reusable Elements and Sections, fed by a Library of sections and a Typography set of elements — so one change to a block propagates to every post.',
  },
}
