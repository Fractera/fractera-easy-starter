// Thin router page for /framework — renders the catalog index from _components and
// nothing else. The framework list is auto-discovered (see _components/index.tsx +
// lib/parser-fs). Standard route shape: page.tsx thin + _components + the generated
// list (router canon, Режим C — no _data folder beyond the localized chrome).
import Index, { generateMetadata } from './_components'

export { generateMetadata }
export default Index
