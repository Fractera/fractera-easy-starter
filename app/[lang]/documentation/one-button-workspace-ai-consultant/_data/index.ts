import { meta } from './meta'
import { en } from './en'
import type { DocData } from '../../_lib/post'

// This doc's _data — meta (non-translatable) + en (EN-only). Combined into a
// DocEntry; the post is the single source of truth for the page and the index.
export const data: DocData = { ...meta, ...en }
