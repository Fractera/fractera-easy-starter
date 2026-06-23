import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'multilingual-auth-forms',
  date: '2026-06-23',
  readingMinutes: 5,
  tags: ['Agentic Engineering Platform', 'Authentication', 'Multilingual', 'Localization', 'Static Forms'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Hero + OG/social image (relative path; the page absolutizes it for the snippet).
  heroImage: '/news/fractera-i18n-auth-form/fractera-i18n-auth-form.jpg',
  ogImage: '/news/fractera-i18n-auth-form/fractera-i18n-auth-form.jpg',
}
