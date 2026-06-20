// Per-document file structure: every article lives in its own
// `entries/<slug>/` folder — `meta.ts` (non-translatable fields, shared by
// every language) + `en.ts` (the required base-language full document) +
// one `<lang>.ts` override file per additional language. A new language is a
// new file; it never requires touching an existing one.

import type { LocalizedBody, LocalizedBodyOverride } from '@/lib/content/types'

export type NewsArticleMeta = {
  slug: string
  date: string
  readingMinutes: number
  tags: string[]
  author?: { name: string; role: string }
  heroImage?: string
  ogImage: string
}

export type NewsArticleBase = LocalizedBody & {
  title: string
  seoTitle?: string
  subtitle?: string
  description: string
  summary: string
  keywords?: string
}

export type NewsArticleOverride = LocalizedBodyOverride & {
  title?: string
  seoTitle?: string
  subtitle?: string
  description?: string
  summary?: string
  keywords?: string
}

export type NewsArticle = NewsArticleMeta & {
  base: NewsArticleBase
  overrides?: Record<string, NewsArticleOverride>
}
