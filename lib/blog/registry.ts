// Explicit static-import registry — one line per post. Next/webpack needs
// statically resolvable import paths, so this is a manual list, not an fs scan.
// Adding a new post = add its folder (`entries/<slug>/{meta,en}.ts`) + one entry
// here. The blog is intentionally English-only today (see lib/blog/types.ts);
// the folder shape is ready to take a `ru.ts` override later with no rework.

import type { BlogPost } from './types'

import { meta as endOfPromptEngineeringMeta } from './entries/the-end-of-prompt-engineering/meta'
import { en as endOfPromptEngineeringEn } from './entries/the-end-of-prompt-engineering/en'

export const POSTS: BlogPost[] = [
  {
    ...endOfPromptEngineeringMeta,
    ...endOfPromptEngineeringEn,
  },
]
