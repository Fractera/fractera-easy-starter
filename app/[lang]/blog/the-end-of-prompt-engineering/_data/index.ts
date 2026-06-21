import { meta } from './meta'
import { en } from './en'
import type { BlogData } from '@/lib/blog/post'

// This post's _data — meta (non-translatable) + en (EN-only). Combined into a
// BlogPost; the post is the single source of truth for the page and the index.
export const data: BlogData = { ...meta, ...en }
