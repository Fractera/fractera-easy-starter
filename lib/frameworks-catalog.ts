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
// TEMPORARY (pivot day): `fractera-pro` is wired to the SAME handler as the empty
// Next starter until the reference project becomes a real pluggable repo. The
// marketing pitch stays honest — the default button is named after the product.

export type RuntimeContract = 'A' | 'B'

export type FrameworkId =
  | 'fractera-pro' // our reference project (default) — temporarily = empty Next handler
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

// Order = dropdown order. `fractera-pro` is the wide default button, shown above
// the dropdown in the form; the rest populate the "choose your framework" list.
export const FRAMEWORKS: FrameworkEntry[] = [
  { id: 'fractera-pro', contract: 'B', label: 'Fractera-Pro', ready: true },
  { id: 'next',  contract: 'B', repo: 'https://github.com/Fractera/fractera-next-starter.git', label: 'Next.js', ready: true },
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
//   own-repo → the user-supplied URL · preset → its catalog `repo` · else → '' (no
// clone, keep the default reference app, e.g. temporary fractera-pro).
export function resolveSlotRepoUrl(id: FrameworkId, ownRepoUrl?: string): string {
  if (id === 'own-repo') return (ownRepoUrl ?? '').trim()
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
