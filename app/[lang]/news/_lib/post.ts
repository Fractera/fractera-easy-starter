// Co-located news helpers. Each news post lives in its own static route folder
// (app/[lang]/news/<slug>/ with page.tsx + _components + _data) — the post IS the
// single source of truth. These helpers turn a post's _data (meta + en + <lang>
// overrides) into the normalized ContentPost the factory renders, and into the
// compact list item the /news index lists. No central registry; the index reads
// the auto-generated _list.generated.ts (parser-fs scans the co-located post
// folders), so a deleted post folder drops out everywhere on its own. These
// helpers are co-located in the news route's own _lib — delete the news folder
// and nothing is left behind.

import { resolveEntry } from '@/lib/content/resolve'
import type { NewsArticleBase, NewsArticleMeta, NewsArticleOverride } from './types'
import type { ContentPost } from '@/lib/content/create-content-post'

const FIELDS = ['title', 'seoTitle', 'subtitle', 'description', 'summary', 'keywords'] as const

/** A post folder's _data, assembled in its _data/index.ts. */
export type NewsData = {
  meta: NewsArticleMeta
  en: NewsArticleBase
  overrides?: Record<string, NewsArticleOverride>
}

function resolve(data: NewsData, lang: string) {
  return resolveEntry(data.en, data.overrides, lang, FIELDS)
}

/** Map a news post to the normalized ContentPost the factory renders. */
export function newsPost(data: NewsData, lang: string): ContentPost {
  const r = resolve(data, lang)
  return {
    title: r.title,
    seoTitle: r.seoTitle,
    subtitle: r.subtitle,
    description: r.description,
    keywords: r.keywords,
    tags: data.meta.tags,
    date: data.meta.date,
    readingMinutes: data.meta.readingMinutes,
    authorName: data.meta.author?.name,
    blocks: r.blocks,
    faq: r.faq,
    ogImage: data.meta.ogImage,
    inLanguage: lang,
    heroImage: data.meta.heroImage,
  }
}

/** Compact, localized item for the /news index list. */
export function newsListItem(data: NewsData, lang: string) {
  const r = resolve(data, lang)
  return {
    slug: data.meta.slug,
    date: data.meta.date,
    readingMinutes: data.meta.readingMinutes,
    title: r.title,
    summary: r.summary,
  }
}

/** Build the localized, date-sorted index list from the auto-discovered POSTS
 *  array (lib/parser-fs generates the array; this aggregates + sorts it). */
export function newsList(posts: NewsData[], lang: string) {
  return posts.map(d => newsListItem(d, lang)).sort((x, y) => (x.date < y.date ? 1 : -1))
}
