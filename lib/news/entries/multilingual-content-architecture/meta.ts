import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../types'

export const meta: NewsArticleMeta = {
  slug: 'multilingual-content-architecture',
  date: '2026-06-20',
  readingMinutes: 6,
  tags: ['Agentic Engineering Platform', 'Multilingual', 'Content Architecture', 'AI SEO', 'Agent Skills'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // No bespoke asset yet — author will add screenshots later (NEWS-ARTICLE-STANDARD §3).
  // ogImage temporarily points to an existing brand frame.
  ogImage: 'https://www.fractera.ai/Fractera-Web-Architect.jpg',
}
