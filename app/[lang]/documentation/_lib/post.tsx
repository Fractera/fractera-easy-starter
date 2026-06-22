// Co-located documentation helpers. Each doc lives in its own static route folder
// (app/[lang]/documentation/<slug>/ with page.tsx + _components + _data). Docs are
// bilingual by construction (news-pattern): _data is meta.ts + en.ts (+ optional
// <lang>.ts override) assembled into a DocData; resolveEntry merges per key with EN
// fallback, so a doc that ships only `en` renders EN everywhere. These helpers map a
// doc to the normalized ContentPost the factory renders (TechArticle preset) and to
// the /documentation index list item. No central registry; the index reads the
// auto-generated _list.generated.ts (parser-fs scans the co-located doc folders).
// These helpers are co-located in the documentation route's own _lib — delete the
// documentation folder and nothing is left behind.

import { resolveEntry } from '@/lib/content/resolve'
import type { DocMeta, DocBase, DocOverride } from './types'
import type { ContentPost } from '@/lib/content/create-content-post'

const FIELDS = ['title', 'description', 'summary', 'keywords'] as const

/** A doc folder's _data, assembled in its _data/index.ts as { meta, en, overrides }. */
export type DocData = {
  meta: DocMeta
  en: DocBase
  overrides?: Record<string, DocOverride>
}

function resolve(data: DocData, lang: string) {
  return resolveEntry(data.en, data.overrides, lang, FIELDS)
}

/** Map a doc to the normalized ContentPost the factory renders. */
export function docPost(data: DocData, lang: string): ContentPost {
  const r = resolve(data, lang)
  const { meta } = data
  return {
    title: r.title,
    subtitle: r.description,
    description: r.description,
    keywords: r.keywords,
    tags: meta.tags,
    date: meta.date,
    readingMinutes: meta.readingMinutes,
    blocks: r.blocks,
    faq: r.faq,
    ogImage: meta.image?.web,
    inLanguage: lang,
    // Responsive hero: portrait on mobile, landscape on web (web doubles as og:image).
    hero: meta.image ? (
      <figure className="my-8">
        <picture>
          <source media="(min-width: 768px)" srcSet={meta.image.web} />
          <img
            src={meta.image.mobile}
            alt={meta.image.alt}
            loading="eager"
            className="w-full rounded-2xl border border-white/10 bg-white"
          />
        </picture>
      </figure>
    ) : undefined,
  }
}

/** Compact, localized item for the /documentation index list. */
export function docListItem(data: DocData, lang: string) {
  const r = resolve(data, lang)
  return {
    slug: data.meta.slug,
    date: data.meta.date,
    readingMinutes: data.meta.readingMinutes,
    title: r.title,
    summary: r.summary,
  }
}

/** Build the localized, date-sorted index list from the auto-discovered POSTS array
 *  (lib/parser-fs generates the array; this aggregates + sorts it). */
export function docList(posts: DocData[], lang: string) {
  return posts.map(d => docListItem(d, lang)).sort((x, y) => (x.date < y.date ? 1 : -1))
}
