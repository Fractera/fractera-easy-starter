import { createFrameworkPage } from '../../_lib/template'

// Entry for /framework/sveltekit — the shared factory builds the whole page (form +
// feedback card + founder + chrome) with this framework's name substituted in.
const page = createFrameworkPage('sveltekit')

export const generateMetadata = page.generateMetadata
export default page.Page
