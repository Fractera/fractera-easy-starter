// Thin route file (standard route shape — see
// /code/CONTENT-I18N-ARCHITECTURE-STANDARD.md §7.8 and FNS
// CRUD-DOCS/workspace-standards/shell-component-architecture.md): page.tsx
// renders the entry from _components and nothing else. Composition + data wiring
// live in _components/index.tsx; page content data lives in _data/.
import Entry, { generateMetadata } from './_components'

export { generateMetadata }
export default Entry
