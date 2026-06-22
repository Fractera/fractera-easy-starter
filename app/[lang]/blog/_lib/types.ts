// Blog-private data shapes, co-located with the blog route (delete the blog
// folder and nothing is left behind). Content blocks come from the neutral,
// cross-tab catalog `lib/content/blocks/types` (the shared content engine, not a
// per-tab library); `BlogBlock` is just the catalog `Block` under a blog-local
// name. The blog-only shapes (`BlogAuthor`, `BlogPost`) live here.

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

// Shape of the Blog tab's UI chrome (index labels). The strings themselves are
// DATA in ../_data/{en,ru}.ts; this is just the contract.
export type BlogUi = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  indexTitle: string
  indexIntro: string
  breadcrumbBlog: string
  featured: string
  minRead: string
  read: string
  backToBlog: string
  titleSuffix: string
}
