// Thin route file (standard route shape): page.tsx renders the entry from
// _components and nothing else. Composition is the shared framework page factory;
// page data is generated from the framework registry (lib/frameworks-pages).
import Entry, { generateMetadata } from './_components'

export { generateMetadata }
export default Entry
