// Public API for blog content — unchanged names, unchanged consumer contract.
// Replaces the old single-file `posts.ts`; content now lives one document per
// folder under `entries/`. See `registry.ts` for the post list.

import { POSTS } from './registry'
import type { BlogPost } from './types'

export type { BlogAuthor, BlogBlock, BlogPost, FaqPair } from './types'

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}

export function getPostSlugs(): string[] {
  return POSTS.map(p => p.slug)
}
