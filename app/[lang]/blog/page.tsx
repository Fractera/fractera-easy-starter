// Thin router page for /blog — renders the index entry from _components and
// nothing else. (Blog posts are not co-located yet; the index reads the legacy
// lib/blog registry for now — see _components/index.tsx.)
import Index, { generateMetadata } from './_components'

export { generateMetadata }
export default Index
