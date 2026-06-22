// Co-located blog helpers. Each blog post lives in its own static route folder
// (app/[lang]/blog/<slug>/ with page.tsx + _components + _data). Blog is EN-only:
// _data is meta.ts + en.ts, combined into a BlogPost. These helpers map a post to
// the normalized ContentPost the factory renders (BlogPosting preset, Organization
// author) and to the /blog index list item. The video hero (the one blog-specific
// piece) is built here. No central registry; the index reads the generated POSTS.

import type { BlogPost } from './types'
import type { ContentPost } from '@/lib/content/create-content-post'

/** A blog post folder's _data, assembled in its _data/index.ts as { ...meta, ...en }. */
export type BlogData = BlogPost

/** Map a blog post to the normalized ContentPost the factory renders. */
export function blogPost(data: BlogData): ContentPost {
  return {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    tags: data.tags,
    date: data.date,
    readingMinutes: data.readingMinutes,
    authorName: data.author.name,
    blocks: data.blocks,
    faq: data.faq,
    ogImage: data.ogImage,
    inLanguage: 'en',
    // Video hero (poster + optional aspect + optional caption).
    hero: (
      <figure className="my-8 flex flex-col gap-3">
        <div
          className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_60px_-15px_rgba(167,139,250,0.35)]"
          style={data.heroAspect ? { aspectRatio: data.heroAspect } : undefined}
        >
          <video
            src={data.heroVideo}
            poster={data.heroPoster}
            controls
            playsInline
            preload="none"
            className="h-full w-full bg-black object-cover"
          />
        </div>
        {data.heroCaption && (
          <figcaption className="text-center text-sm text-white/40">{data.heroCaption}</figcaption>
        )}
      </figure>
    ),
  }
}

/** Compact item for the /blog index list (featured card + grid). */
export function blogListItem(data: BlogData) {
  return {
    slug: data.slug,
    date: data.date,
    readingMinutes: data.readingMinutes,
    title: data.title,
    excerpt: data.excerpt,
    tags: data.tags,
    ogImage: data.ogImage,
  }
}

/** Build the date-sorted index list from the auto-discovered POSTS array. */
export function blogList(posts: BlogData[]) {
  return posts.map(blogListItem).sort((x, y) => (x.date < y.date ? 1 : -1))
}
