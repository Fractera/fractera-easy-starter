import type { Block } from '@/lib/content/blocks/types'
import { getContent } from '@/lib/i18n/content'
import { createFrameworkPage } from '../../_lib/template'
import { AircraftCarrierDemo } from '@/components/sections/aircraft-carrier/demo'
import { AircraftCarrierManifesto } from '@/components/sections/aircraft-carrier/manifesto'

// Entry for /framework/fractera-pro. Same shared factory as every framework page,
// but Fractera Pro carries the disassembled "Next.js Aircraft Carrier" deep-dive that
// used to be one monolithic block on the homepage:
//   - its TEXT (badge + H2 + intro + primer) becomes the page's standard content feed
//     (blocks below — callout/h2/p, rendered by the standard template like any page);
//   - the animated parallel-routing demo becomes its own section directly ABOVE the
//     deploy form (topSection);
//   - the founder manifesto card ("Есть мнение…") becomes its own section directly
//     BELOW the Roma Armstrong founder quote, in the same shimmer design
//     (belowFounderSection).
// The old "Полная история Авианосца" button is dropped entirely.
//
// The carrier text is reused verbatim from the existing localized strings
// (getContent(lang).aircraftCarrier) — remembered, not re-authored — so EN + RU stay
// in sync with one source.
function aircraftCarrierBlocks(lang: string): Block[] {
  const ac = getContent(lang).aircraftCarrier
  return [
    { kind: 'callout', title: ac.badge, text: ac.intro },
    { kind: 'h2', text: ac.h2 },
    { kind: 'p', text: ac.primer },
  ]
}

const page = createFrameworkPage('fractera-pro', {
  blocks: aircraftCarrierBlocks,
  topSection: () => <AircraftCarrierDemo />,
  belowFounderSection: () => <AircraftCarrierManifesto />,
})

export const generateMetadata = page.generateMetadata
export default page.Page
