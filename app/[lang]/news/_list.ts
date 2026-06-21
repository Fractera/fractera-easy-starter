import { data as a } from './multilingual-content-architecture/_data'
import { data as b } from './architecture-to-development-steps-materializer/_data'
import { data as c } from './ai-draft-settings-evolutionary-pipeline/_data'
import { newsListItem, type NewsData } from '@/lib/news/post'

// Static manifest for the /news index (the router page where a visitor picks a
// post). It IMPORTS each post's _data — the post stays the single source of
// truth, so titles/summaries here are never hand-copied, they come from the post.
// Adding a post = create its folder + add one import line; deleting a post =
// delete its folder + remove its line, and it drops out of the index everywhere.
const POSTS: NewsData[] = [a, b, c]

export function getNewsList(lang: string) {
  return POSTS.map(d => newsListItem(d, lang)).sort((x, y) => (x.date < y.date ? 1 : -1))
}

export function newsSlugs(): string[] {
  return POSTS.map(d => d.meta.slug)
}
