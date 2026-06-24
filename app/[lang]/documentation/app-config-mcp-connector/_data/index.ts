import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'
import type { DocData } from '../../_lib/post'

// This doc's _data — meta (non-translatable) + en base + ru override (full Russian
// version). resolveEntry merges per key; the ru blocks fully replace en for Russian.
// The post is the single source of truth; _components and the /documentation _list
// both read it.
export const data: DocData = { meta, en, overrides: { ru } }
