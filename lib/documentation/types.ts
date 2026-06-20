import type { BlogBlock, FaqPair } from '@/lib/blog/types'

export type DocEntry = {
  slug: string
  title: string
  description: string // SEO meta description
  summary: string // one-line summary shown in the flat index list
  date: string // ISO publish date
  readingMinutes: number
  tags: string[]
  blocks: BlogBlock[]
  // Optional hero diagram, rendered responsively (mobile portrait / web landscape).
  // `web` doubles as the page's og:image (social/SEO snippet).
  image?: { mobile: string; web: string; alt: string }
  // Optional FAQ rendered at the bottom of the page + emitted as FAQPage JSON-LD.
  faq?: FaqPair[]
}
