import { meta } from './meta'
import { en } from './en'
import type { DocData } from '../../_lib/post'

// This doc's _data — meta (non-translatable) + en base. EN-only: no overrides, so it
// renders English everywhere via the EN fallback. The post is the single source of
// truth; _components and the /documentation _list both read it.
export const data: DocData = { meta, en }
