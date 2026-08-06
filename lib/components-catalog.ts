// Single source of truth for the selectable Fractera components.
//
// Used by: the landing deploy form (custom-install switch + checkboxes), the
// /api/install route, and — by mirrored id — lib/deploy.ts ($8 arg) and
// bootstrap.sh (`should_install`). The deployed admin reads the resolved set
// back from /opt/fractera/installed-components.json (written by bootstrap).
//
// CORE services are never selectable (always installed): the Shell app, Auth,
// Admin, Data (DB + media) and the bridge process (which hosts the always-on
// system terminal). Unchecking every box here = "a plain server, no AI".
//
// Display labels/descriptions live in i18n locales (rule 4а) — this file holds
// only stable ids + grouping metadata, never user-facing copy.

// Step 500: nothing is optional any more. The five coding agents and Hermes
// ('brain') were removed from the product; LightRAG ('memory') followed them,
// because it had been installed to make Hermes smarter — its vector half now
// lives inside the data service (:3300) as CORE, alongside rows and objects.
// The selection UI therefore has nothing to offer, and every deploy installs
// exactly the same set.
export type ComponentId = never

export type ComponentGroup = 'agent' | 'service'

export const SELECTABLE_COMPONENTS: { id: ComponentId; group: ComponentGroup }[] = []

export const ALL_COMPONENT_IDS: ComponentId[] = SELECTABLE_COMPONENTS.map((c) => c.id)

export function isComponentId(x: unknown): x is ComponentId {
  return typeof x === 'string' && (ALL_COMPONENT_IDS as string[]).includes(x)
}

// Serialize the selection for the bootstrap $8 arg.
//   - 'all'  → install everything (also the value when no arg is passed at all —
//              this keeps the default deploy byte-identical to today)
//   - 'none' → CORE only (user unchecked every box → plain server, no AI)
//   - csv    → an explicit subset, e.g. "claude-code,memory"
// Never returns '' so it cannot be confused with "arg omitted".
export function serializeComponents(ids: ComponentId[]): 'all' | 'none' | string {
  const uniq = ALL_COMPONENT_IDS.filter((id) => ids.includes(id)) // canonical order, dedup
  if (uniq.length === 0) return 'none'
  if (uniq.length === ALL_COMPONENT_IDS.length) return 'all'
  return uniq.join(',')
}
