import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'
import type { NewsData } from '../../_lib/post'

// This post's _data — meta (non-translatable) + en base + ru override (full Russian
// version). The post is the single source of truth; _components and the /news _list
// both read it.
export const data: NewsData = { meta, en, overrides: { ru } }
