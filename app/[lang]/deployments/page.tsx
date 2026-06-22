// Thin router page for /deployments — renders the hub index from _components and
// nothing else. The deployment-target list is auto-discovered (see
// _components/index.tsx + lib/parser-fs). Standard route shape: page.tsx thin +
// _components + the generated list (router canon, Режим C — no _data folder).
import Index, { generateMetadata } from './_components'

export { generateMetadata }
export default Index
