// Documentation-private data shapes, co-located with the documentation route
// (delete the folder and nothing is left behind). Content blocks come from the
// neutral, cross-tab catalog lib/content/blocks/types (the shared content engine,
// not a per-tab library); DocBlock is the catalog Block under a doc-local name.
import type { Block, FaqPair } from '@/lib/content/blocks/types'

export type DocBlock = Block

export type DocEntry = {
  slug: string
  title: string
  description: string // SEO meta description
  summary: string // one-line summary shown in the flat index list
  date: string // ISO publish date
  readingMinutes: number
  tags: string[]
  blocks: DocBlock[]
  // Optional hero diagram, rendered responsively (mobile portrait / web landscape).
  // `web` doubles as the page's og:image (social/SEO snippet).
  image?: { mobile: string; web: string; alt: string }
  // Optional FAQ rendered at the bottom of the page + emitted as FAQPage JSON-LD.
  faq?: FaqPair[]
}

// Shape of the Documentation tab's UI chrome (index labels). The strings
// themselves are DATA in ../_data/{en,ru}.ts; this is just the contract.
export type DocUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumbDoc: string
  minRead: string
  backToDoc: string
  titleSuffix: string
}
