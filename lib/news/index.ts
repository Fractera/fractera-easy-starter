// Public API for news content — unchanged names, unchanged consumer contract.
// Replaces the old single-file `articles.ts`; content now lives one
// document per folder under `entries/`. See `registry.ts` for the article list
// and `types.ts` for the per-document file contract.

import { resolveEntry } from '@/lib/content/resolve'
import { ARTICLES } from './registry'
import type { NewsArticle } from './types'

export type { NewsArticle, NewsArticleBase, NewsArticleMeta, NewsArticleOverride } from './types'

const NEWS_FIELDS = ['title', 'seoTitle', 'subtitle', 'description', 'summary', 'keywords'] as const

export function resolveArticle(article: NewsArticle, lang: string) {
  const resolved = resolveEntry(article.base, article.overrides, lang, NEWS_FIELDS)
  return {
    ...resolved,
    seoTitle: resolved.seoTitle ?? resolved.title,
  }
}

export function getAllArticles(): NewsArticle[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticle(slug: string): NewsArticle | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getArticleSlugs(): string[] {
  return ARTICLES.map(a => a.slug)
}
