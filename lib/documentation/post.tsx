// Co-located documentation helpers. Each doc lives in its own static route folder
// (app/[lang]/documentation/<slug>/ with page.tsx + _components + _data). Docs are
// EN-only: _data is meta.ts + en.ts, combined into a DocEntry. These helpers map a
// doc to the normalized ContentPost the factory renders (TechArticle preset) and
// to the /documentation index list item. No central registry; the index _list.ts
// imports each doc's _data.

import type { DocEntry } from './types'
import type { ContentPost } from '@/lib/content/create-content-post'

/** A doc folder's _data, assembled in its _data/index.ts as { ...meta, ...en }. */
export type DocData = DocEntry

/** Map a doc to the normalized ContentPost the factory renders. */
export function docPost(doc: DocData): ContentPost {
  return {
    title: doc.title,
    subtitle: doc.description,
    description: doc.description,
    tags: doc.tags,
    date: doc.date,
    readingMinutes: doc.readingMinutes,
    blocks: doc.blocks,
    faq: doc.faq,
    ogImage: doc.image?.web,
    inLanguage: 'en',
    // Responsive hero: portrait on mobile, landscape on web (web doubles as og:image).
    hero: doc.image ? (
      <figure className="my-8">
        <picture>
          <source media="(min-width: 768px)" srcSet={doc.image.web} />
          <img
            src={doc.image.mobile}
            alt={doc.image.alt}
            loading="eager"
            className="w-full rounded-2xl border border-white/10 bg-white"
          />
        </picture>
      </figure>
    ) : undefined,
  }
}

/** Compact item for the /documentation index list. */
export function docListItem(doc: DocData) {
  return {
    slug: doc.slug,
    date: doc.date,
    readingMinutes: doc.readingMinutes,
    title: doc.title,
    summary: doc.summary,
  }
}

/** Build the date-sorted index list from the auto-discovered POSTS array
 *  (lib/parser-fs generates the array; this aggregates + sorts it). */
export function docList(posts: DocData[]) {
  return posts.map(docListItem).sort((x, y) => (x.date < y.date ? 1 : -1))
}
