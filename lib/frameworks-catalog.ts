// Single source of truth for the project the user lands in the app slot (:3000).
//
// The 2026-06-16 pivot turned the Shell slot into a SWAPPABLE slot for any repo:
// a fresh starter of any framework, our reference project (Fractera-Pro), or the
// user's own public repository. The install form, the `?framework=` URL param and
// (later) bootstrap.sh all read THIS registry — one source, default = fractera-pro.
//
// We do not support "frameworks" per se but two RUNTIME CONTRACTS on :3000:
//   - 'A' (static)  → build produces a folder (dist/build/out), served by a static
//                     server. Plain HTML/JS, React (CRA/Vite), Vue, Angular static,
//                     Astro static, Svelte adapter-static, Next `output: export`.
//   - 'B' (node)    → build produces a long-lived node process under PM2 (npm start).
//                     Next.js SSR, Nuxt, Remix, Angular Universal, Express/Nest.
// The detector keys off the adapter / output type, not the framework name. React
// Native is out of scope (mobile target); only its Expo-web export = contract A.
//
// Display labels live in i18n locales (rule 4а); this file holds stable ids +
// contract + build/run metadata only — never user-facing copy beyond a short label
// that is itself overridden by locales where present.
//
// TEMPORARY (pivot day): `fractera-pro` clones the SAME repo as the Next.js preset
// (FNS) until the standalone Fractera-Pro repo is built. The marketing pitch stays
// honest — the default button is named after the product. Both the default and the
// explicit Next.js choice therefore deploy FNS into the slot.

export type RuntimeContract = 'A' | 'B'

export type FrameworkId =
  | 'fractera-pro' // our reference project (default) — temporarily clones FNS (repo not built yet)
  | 'next'         // empty Next.js starter
  | 'react'        // Vite + React (static)
  | 'vue'          // Vite + Vue (static)
  | 'angular'      // ng build (static)
  | 'astro'        // Astro static
  | 'svelte'       // SvelteKit adapter-static
  | 'own-repo'     // user-provided public repository (detected A/B on the fly)

export type FrameworkEntry = {
  id: FrameworkId
  contract: RuntimeContract
  // Curated presets are normalized Fractera repos cloned at deploy time — the SAME
  // path as own-repo (uniform / dogfood). `repo` is the public git URL of the preset
  // starter; bootstrap clones it into the slot. `own-repo` has no fixed repo (the
  // user supplies the URL); `fractera-pro` has none yet (temporary: keeps the cloned
  // reference app until its own repo is wired).
  repo?: string
  // Legacy field (unused now that presets are repos, kept for reference).
  templateDir?: string
  // Default fallback label (locales override). Kept short.
  label: string
  // Whether this entry reveals the repo-URL field (advanced). Only 'own-repo'.
  needsRepoUrl?: boolean
  // Whether the deploy pipeline actually supports it yet. FIRST CUT wires only the
  // CONTRACT-B family (Next-like Node apps that build+start exactly like Next):
  // fractera-pro, empty Next, and an own-repo that is itself a Node project. The
  // CONTRACT-A static family (React/Vue/Angular/Astro/Svelte) is shown but disabled
  // ("coming soon") until the static-folder server lands — see next-step Ф3.2.
  ready?: boolean
}

// Single source of truth for the FNS repo URL. TEMPORARY: until the standalone
// Fractera-Pro repo exists and the static-folder (contract A) / own-repo paths are
// wired, EVERY ready B-path resolves here (fractera-pro default, Next.js preset, and
// — temporarily — own-repo). One const so the future un-revert is a single edit.
export const FNS_REPO = 'https://github.com/Fractera/fractera-next-starter.git'

// Order = dropdown order. `fractera-pro` is the wide default button, shown above
// the dropdown in the form; the rest populate the "choose your framework" list.
export const FRAMEWORKS: FrameworkEntry[] = [
  // TEMPORARY: the standalone Fractera-Pro repo does not exist yet, so the default
  // button clones FNS (same repo as the Next.js preset). This guarantees the DEFAULT
  // path always lands a real external repo in the slot — never the (now-empty) bundled
  // substrate app, which would fail the build. Point this at the real Fractera-Pro repo
  // once it is built.
  { id: 'fractera-pro', contract: 'B', repo: FNS_REPO, label: 'Fractera-Pro', ready: true },
  { id: 'next',  contract: 'B', repo: FNS_REPO, label: 'Next.js', ready: true },
  { id: 'own-repo', contract: 'B', label: 'Your repository', needsRepoUrl: true, ready: true },
  { id: 'react', contract: 'A', label: 'React' },
  { id: 'vue',   contract: 'A', label: 'Vue' },
  { id: 'angular', contract: 'A', label: 'Angular' },
  { id: 'astro', contract: 'A', label: 'Astro' },
  { id: 'svelte', contract: 'A', label: 'Svelte' },
]

export function isFrameworkReady(id: FrameworkId): boolean {
  return getFramework(id).ready === true
}

// Resolve the repo URL to clone into the slot for a chosen framework.
//   own-repo → TEMPORARILY ignores the user URL and clones FNS (the own-repo path is
//     not wired yet; cloning an arbitrary user repo is deferred). Restore by returning
//     `(ownRepoUrl ?? '').trim()` once arbitrary repos are supported.
//   preset (incl. fractera-pro) → its catalog `repo` (= FNS for now)
//   contract-A preset (no repo, currently disabled) → '' (no clone).
//   Every READY framework now resolves to a real external repo — no bundled-app fallback.
export function resolveSlotRepoUrl(id: FrameworkId, ownRepoUrl?: string): string {
  if (id === 'own-repo') return FNS_REPO // TEMPORARY: ignore user URL, deploy FNS
  return getFramework(id).repo ?? ''
}

export const DEFAULT_FRAMEWORK: FrameworkId = 'fractera-pro'

export const ALL_FRAMEWORK_IDS: FrameworkId[] = FRAMEWORKS.map((f) => f.id)

export function isFrameworkId(x: unknown): x is FrameworkId {
  return typeof x === 'string' && (ALL_FRAMEWORK_IDS as string[]).includes(x)
}

export function getFramework(id: FrameworkId): FrameworkEntry {
  return FRAMEWORKS.find((f) => f.id === id) ?? FRAMEWORKS[0]
}

// Normalize a `?framework=` query value to a known id (default when unknown/absent).
export function resolveFrameworkParam(raw: unknown): FrameworkId {
  return isFrameworkId(raw) ? raw : DEFAULT_FRAMEWORK
}

// Accept only public http(s) git URLs for the own-repo path (MVP = public only).
export function isPublicRepoUrl(x: unknown): x is string {
  if (typeof x !== 'string') return false
  const s = x.trim()
  return /^https?:\/\/[^\s]+$/i.test(s) && !s.includes('@') // no inline credentials
}
