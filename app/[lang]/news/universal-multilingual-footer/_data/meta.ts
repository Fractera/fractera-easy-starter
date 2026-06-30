import { AUTHOR } from '@/lib/author'
import type { NewsArticleMeta } from '../../_lib/types'

export const meta: NewsArticleMeta = {
  slug: 'universal-multilingual-footer',
  date: '2026-06-30',
  readingMinutes: 6,
  tags: ['Agentic Engineering Platform', 'Footer', 'Multilingual', 'No-Code', 'Agent Skills'],
  author: { name: AUTHOR.name, role: AUTHOR.role },
  // The universal footer on the home page: the footer-page links, the SITE CONTENTS
  // home-section navigation, the company name + address pulled from app config, the
  // social icons, the theme toggle, and the language switcher with its searchable,
  // region-grouped dropdown open. Used as the hero and the OG/social card.
  heroImage: '/news/fractera-footer/fractera-footer-screenshot-2026-06-30.png',
  ogImage: '/news/fractera-footer/fractera-footer-screenshot-2026-06-30.png',
}
