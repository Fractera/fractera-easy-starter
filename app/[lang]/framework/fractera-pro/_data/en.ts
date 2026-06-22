import type { FrameworkBase } from '../../_lib/post'

// English base document for /framework/fractera-pro — the "Next.js Aircraft Carrier".
// Standard co-located content (the carrier prose lives HERE as blocks, not pulled
// from the global i18n locale). The animated parallel-routing demo and the founder
// manifesto card are injected as sections by _components. Mandatory root anchor
// "Agentic Engineering Infrastructure" → /en is woven into the lead.
export const en: FrameworkBase = {
  title: 'The Agentic Aircraft Carrier: Next.js Parallel Routing Architecture',
  seoTitle: 'Fractera Pro — The Next.js Aircraft Carrier (Parallel Routing Starter)',
  subtitle:
    'The 50,000-line Next.js reference starter that ships the moment you deploy: 13 parallel-routing slots, full static generation, near-zero token overhead.',
  description:
    'Fractera Pro is the Next.js Aircraft Carrier — a pre-built, immutable-pattern starter with parallel routing that scales one self-hosted app to thousands of pages at near-zero token cost. It lands on your server in one click.',
  keywords:
    'agentic architecture routing, immutable agent code patterns, prevent context window inflation, production ready nextjs starter, parallel routing, fractera pro, agentic engineering infrastructure',
  listTitle: 'Fractera Pro',
  listDescription:
    'Our reference project: the 50,000-line Next.js "Aircraft Carrier" with parallel routing — the default one-click deployment.',
  founderQuote:
    'Recently I heard a phrase from young people — a “plus person”, someone who is more often than not in the black. The equivalents: “he’ll always earn his bread and butter”, “he’ll go far if no one stops him”, “safe as houses”, “throw him naked into Africa and in a year he’ll be greeting you at the door of his own hotel in an oasis”.',
  blocks: [
    {
      kind: 'callout',
      title: '99% Pre-Built, Immutable Patterns',
      text:
        'This is what the one-click robot installer actually delivers — the framework lands on your server the moment deployment finishes; there is nothing extra to buy. Parallel routing is a next-generation Next.js capability: inside a single URL the AI composes many dynamic slots — fixed panels, side drawers, centre modals — that change without a page reload and without losing state.',
    },
    {
      kind: 'p',
      text:
        'Fractera Pro is the default project of the Fractera [Agentic Engineering Infrastructure](/en) — the reference starter the one-click deploy lands in your app slot. It is the structural rail that lets one production-ready application scale to thousands of pages while an AI builds it.',
    },

    { kind: 'h2', text: 'Parallel Routing: One URL, Many Live Slots' },
    {
      kind: 'p',
      text:
        'Each slot is rendered and cached on its own, so the AI adds or rearranges whole sections by selecting them — not by regenerating code. If one slot ever errors, the rest keep working. This is how a self-hosted Next.js app scales to thousands of pages with near-zero token overhead. Toggle the slots in the demo above to watch the layout rebuild in real time — no code, no reload.',
    },

    { kind: 'h2', text: 'Why a 50,000-Line Starter Is a Shield for Your Token Budget' },
    {
      kind: 'p',
      text:
        'The most expensive part of AI development is boilerplate the model has to re-derive every session. A pre-built carrier removes it: auth, database, media, routing and the parallel-routing slots are already there, immutable. The AI does not reinvent them — it composes them. That is the difference between a starter that costs tokens and one that saves them. To go deeper into the economics, read the [token economics](/en/token-economics) breakdown.',
    },
  ],
  faq: [
    {
      q: 'What exactly is Fractera Pro?',
      a: 'Our reference project: a ~50,000-line Next.js starter with 13 parallel-routing slots, full static generation, built-in auth/database/media. It is the default app the one-click deploy lands on your server.',
    },
    {
      q: 'Does it work without JavaScript?',
      a: 'Yes. The slots synchronize in full static generation, so the pages render and work even with JavaScript disabled — JS-driven tools degrade gracefully, everything else stays usable.',
    },
    {
      q: 'How does it reduce token spend?',
      a: 'The AI selects and composes pre-built, immutable patterns instead of regenerating boilerplate every session. Combined with LightRAG memory, that keeps token overhead near zero as the app scales to thousands of pages.',
    },
  ],
}
