// Block types moved to the neutral catalog home `lib/content/blocks/types.ts`
// (shared by news, blog, documentation and StandardContentPage). This file stays
// as a back-compat shim: `BlogBlock` is the catalog `Block`, and the existing
// import path `@/lib/blog/types` keeps working unchanged. Blog-only shapes
// (`BlogAuthor`, `BlogPost`) continue to live here.

import type { Block, FaqPair } from '@/lib/content/blocks/types'

export type { FaqPair }
export type BlogBlock = Block

export type BlogAuthor = { name: string; role: string; avatar?: string }

export type BlogPost = {
  slug: string
  title: string
  subtitle: string
  description: string
  excerpt: string
  date: string
  readingMinutes: number
  tags: string[]
  author: BlogAuthor
  heroVideo: string
  heroPoster?: string
  heroAspect?: string
  /** Optional caption rendered under the video hero. */
  heroCaption?: string
  ogImage: string
  blocks: BlogBlock[]
  faq?: FaqPair[]
}
