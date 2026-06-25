import type { DocMeta } from '../../_lib/types'

// Non-translatable fields shared by every language of this doc. `image.web` is both the
// responsive hero and the social snippet (og:image) per the page-image rule.
export const meta: DocMeta = {
  slug: 'hermes-brain-setup-and-recovery',
  date: '2026-06-24',
  readingMinutes: 7,
  tags: ['Hermes', 'AI orchestrator', 'Agentic engineering', 'Agent setup', 'Recovery', 'Self-hosted'],
  image: {
    mobile: '/docs/hermes-brain-setup-and-recovery-screenshot-2026-06-25.png',
    web: '/docs/hermes-brain-setup-and-recovery-screenshot-2026-06-25.png',
    alt: 'Hermes, the orchestrating brain of the agentic engineering workspace — the Hermes Agent admin interface that delegates to the coding agents and runs the environment around the code.',
  },
}
