// Thin route file (standard route shape): page.tsx renders the entry from
// _components and nothing else. Composition + data wiring live in
// _components/index.tsx; page content data lives in _data/.
import Entry, { generateMetadata } from './_components'

export { generateMetadata }
export default Entry
