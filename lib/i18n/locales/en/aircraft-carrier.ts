import type { SiteContent } from '../../types'

export const aircraftCarrier: SiteContent['aircraftCarrier'] = {
  badge: '99% PRE-BUILT IMMUTABLE PATTERNS',
  h2: 'The Next.js Aircraft Carrier — Parallel Routing on a Pre-Built Enterprise Boilerplate',
  intro:
    "Parallel routing is a next-generation Next.js capability: inside a single URL the AI composes many dynamic slots — fixed panels, side drawers, centre modals — that change without a page reload and without losing state. It is the structural rail that lets one production-ready starter scale to thousands of pages.",
  demoHint: 'Toggle the slots — the layout rebuilds in real time, no code, no reload.',
  primer:
    "Each slot is rendered and cached on its own, so the AI adds or rearranges whole sections by selecting them — not by regenerating code. If one slot ever errors, the rest keep working. This is how a self-hosted Next.js app scales to thousands of pages with near-zero token overhead.",
  linkLabel: 'Read the full Aircraft Carrier story →',
}
