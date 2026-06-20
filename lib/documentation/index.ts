// Public API for the Documentation service — unchanged names, unchanged
// consumer contract. Replaces the old single-file `docs.ts`; content now
// lives one document per folder under `entries/`. See `registry.ts`.

import { DOCS } from './registry'
import type { DocEntry } from './types'

export type { DocEntry } from './types'

export function getAllDocs(): DocEntry[] {
  return [...DOCS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find(d => d.slug === slug)
}

export function getDocSlugs(): string[] {
  return DOCS.map(d => d.slug)
}
