import { createFrameworkPage } from '../../_lib/template'

// Entry for /framework/gatsby — the shared factory builds the whole page (form +
// feedback card + founder + chrome) with this framework's name substituted in.
const page = createFrameworkPage('gatsby')

export const generateMetadata = page.generateMetadata
export default page.Page
