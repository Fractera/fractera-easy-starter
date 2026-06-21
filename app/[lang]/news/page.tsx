// Thin router page for /news — renders the index entry from _components and
// nothing else. The post list is auto-discovered (see _components/index.tsx +
// lib/parser-fs). Standard route shape: page.tsx thin + _components + posts.
import Index, { generateMetadata } from './_components'

export { generateMetadata }
export default Index
