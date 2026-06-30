import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'add-any-language-to-an-existing-site',
  date: '2026-06-30',
  readingMinutes: 7,
  tags: ['Agentic Engineering Platform', 'Multilingual', 'hreflang', 'SEO', 'Internationalization', 'No-Code'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Ships without an illustration on purpose; the social card falls back to the brand logo.
  ogImage: '/fractera-logo.jpg',
}
