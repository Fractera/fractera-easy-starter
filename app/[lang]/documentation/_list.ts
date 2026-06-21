import { data as a } from './one-button-workspace-ai-consultant/_data'
import { data as b } from './authentication-roles-and-providers/_data'
import { data as c } from './static-first-rendering-economics/_data'
import { docListItem, type DocData } from '@/lib/documentation/post'

// Static manifest for the /documentation index (the router page where a visitor
// picks a doc). Imports each doc's _data — the doc is the single source of truth;
// titles/summaries are never hand-copied. Adding a doc = create its folder + add
// one import line; deleting a doc = delete its folder + remove its line.
const DOCS: DocData[] = [a, b, c]

export function getDocList() {
  return DOCS.map(docListItem).sort((x, y) => (x.date < y.date ? 1 : -1))
}

export function docSlugs(): string[] {
  return DOCS.map(d => d.slug)
}
