import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'fractera-product-of-the-day-smol-rank',
  date: '2026-07-09',
  readingMinutes: 3,
  tags: ['Agentic Engineering Platform', 'Product of the Day', 'Smol Rank', 'Awards', 'Developer Tools', 'AI'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // Screenshot of the Smol Rank listing with the "Top 2 Daily Winner" badge.
  // Used as the article hero and the OG/social image (relative path; the page absolutizes it).
  heroImage: '/news/fractera-2-product-of-the-day/2-product-of-the-day-screenshot-2026-07-09.png',
  ogImage: '/news/fractera-2-product-of-the-day/2-product-of-the-day-screenshot-2026-07-09.png',
}
