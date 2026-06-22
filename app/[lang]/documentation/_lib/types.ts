// Documentation-private data shapes, co-located with the documentation route
// (delete the folder and nothing is left behind). Content blocks come from the
// neutral, cross-tab catalog lib/content/blocks/types (the shared content engine,
// not a per-tab library); DocBlock is the catalog Block under a doc-local name.
// Docs are bilingual by construction (news-pattern): a full `en` base + optional
// per-language overrides, resolved per key with EN fallback by resolveEntry. A doc
// that ships only `en` simply falls back to EN everywhere.
import type { Block } from '@/lib/content/blocks/types'
import type { LocalizedBody, LocalizedBodyOverride } from '@/lib/content/types'

export type DocBlock = Block

// Non-translatable fields, shared by every language of a doc.
export type DocMeta = {
  slug: string
  date: string // ISO publish date
  readingMinutes: number
  tags: string[]
  // Optional hero diagram, rendered responsively (mobile portrait / web landscape).
  // `web` doubles as the page's og:image (social/SEO snippet).
  image?: { mobile: string; web: string; alt: string }
}

// The required base-language document (all translatable fields + body + FAQ).
export type DocBase = LocalizedBody & {
  title: string
  description: string // SEO meta description
  summary: string // one-line summary shown in the flat index list
  keywords?: string
}

// A partial per-language override: only the keys that differ from the base.
export type DocOverride = LocalizedBodyOverride & {
  title?: string
  description?: string
  summary?: string
  keywords?: string
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
