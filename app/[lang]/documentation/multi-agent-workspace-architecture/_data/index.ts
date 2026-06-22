import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'
import type { DocData } from '../../_lib/post'

// This doc's _data — meta (non-translatable) + en base + ru override. Bilingual
// replica of the /ai-workspace-architect page; that page now canonical-links here.
export const data: DocData = { meta, en, overrides: { ru } }
