import type { DocBase } from '../../_lib/types'

// English base — a short stub for now; the FULL, final version ships in Russian (../_data/ru).
// The English version is authored later (owner's call). resolveEntry falls back to these keys
// for /en; /ru is fully overridden by ru.ts.
export const en: DocBase = {
  title: 'Anatomy of a Fractera Automation — the 13-Entity Ontology | Agentic Engineering',
  description:
    'How a Fractera automation is built from a fixed vocabulary of 13 typed entities and validation gates — which is what lets an AI author automations you can trust and inspect. The full version is available in Russian; the English version is coming.',
  summary:
    'An automation in Fractera is a grammar, not code: 13 typed entities plus rules, so an AI can build — from your words — an automation that is fully transparent and verifiable. Full Russian version live; English coming.',
  keywords:
    'agentic engineering, automation ontology, decomposition, inter-automation, subject, self-hosted AI workspace',
  faq: [
    {
      q: 'What is the automation ontology?',
      a: 'The fixed vocabulary — 13 typed entities — every Fractera automation is composed of, validated by the decomposition engine. The full explainer is currently available in Russian; the English version is coming.',
    },
  ],
  blocks: [
    {
      kind: 'p',
      text: 'Fractera is an [Agentic Engineering Infrastructure](/en). This document explains the automation ontology — the 13 typed entities every automation is built from. The full, final version is available in Russian; the English version is authored next.',
    },
  ],
}
