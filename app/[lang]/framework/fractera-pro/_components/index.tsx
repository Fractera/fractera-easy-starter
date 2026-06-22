import { createFrameworkPage } from '../../_lib/template'
import { AircraftCarrier } from '@/components/sections/aircraft-carrier'

// Entry for /framework/fractera-pro. Same shared factory as every framework page,
// but Fractera Pro additionally carries the "Next.js Aircraft Carrier" deep-dive —
// the multi-section block moved here off the homepage (it describes precisely what
// the Fractera Pro / Next.js starter is). It renders at the top of the sections slot
// (above the deploy form), wrapped by the factory in a ContentProvider so the
// hero-content client section works.
const page = createFrameworkPage('fractera-pro', {
  topSection: () => <AircraftCarrier />,
})

export const generateMetadata = page.generateMetadata
export default page.Page
