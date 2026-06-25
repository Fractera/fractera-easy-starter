import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'open-code-license-agentic-engineering',
  date: '2026-06-25',
  readingMinutes: 6,
  tags: ['Open Code', 'License', 'PolyForm', 'Agentic Engineering', 'Source-available', 'Self-replicating agents'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Published without an illustration on purpose (the founder has no image idea yet);
  // an OG image is still required for social cards, so we fall back to the brand logo.
  // A custom hero/OG can be added later without touching the article body.
  ogImage: '/fractera-logo.jpg',
}
