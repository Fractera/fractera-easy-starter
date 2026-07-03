import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'only-the-architect-changes-your-workspace',
  date: '2026-07-03',
  readingMinutes: 5,
  tags: [
    'Agentic Engineering Platform',
    'Security',
    'Access Control',
    'Architect Role',
    'Secure Mode',
    'Self-Hosted',
  ],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Published without a dedicated illustration — brand logo as the OG placeholder,
  // to be replaced with a real screenshot later (per the news standard).
  ogImage: '/fractera-logo.jpg',
}
