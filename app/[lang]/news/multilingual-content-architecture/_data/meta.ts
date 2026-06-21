import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '@/lib/news/types'

export const meta: NewsArticleMeta = {
  slug: 'multilingual-content-architecture',
  date: '2026-06-20',
  readingMinutes: 6,
  tags: ['Agentic Engineering Platform', 'Multilingual', 'Content Architecture', 'AI SEO', 'Agent Skills'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Diagram: per-language file-system fields (EN/ES/DE for title/description/
  // paragraphs/FAQ) → AI generation → /en|/es|/de localized pages. Used as the
  // hero and the OG/social image (relative path; the [slug] page absolutizes it).
  heroImage: '/news/fractera-multilanguage/fractera-multilanguage.jpg',
  ogImage: '/news/fractera-multilanguage/fractera-multilanguage.jpg',
}
