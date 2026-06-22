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
  // ── Roadmap presets (NOT ready — "coming soon", disabled in the dropdown). ──
  // WEBSITE-BUILDING tools only: web frameworks, meta-frameworks, static-site
  // generators. NO bare languages, NO ORMs/query builders. The deploy pipeline
  // still wires only the ready contract-B family above; these resolve to no repo
  // until their starter lands.
  | 'sveltekit'    // SvelteKit (node → B)
  | 'nuxt'         // Nuxt (node → B)
  | 'remix'        // Remix (node → B)
  | 'gatsby'       // Gatsby (static → A)
  | 'solid-start'  // SolidStart (node → B)
  | 'qwik'         // Qwik (node → B)
  | 'react-router' // React Router (framework mode → B)
  | 'tanstack-start' // TanStack Start (node → B)
  | 'hugo'         // Hugo (static SSG → A)
  | 'jekyll'       // Jekyll (static SSG → A)
  | 'eleventy'     // Eleventy / 11ty (static SSG → A)
  | 'vite'         // Vite (static → A)
  | 'ember'        // Ember (static → A)
  | 'redwood'      // RedwoodJS (node → B)
  | 'express'      // Express (node → B)
  | 'nestjs'       // NestJS (node → B)
  | 'fastify'      // Fastify (node → B)
  | 'hono'         // Hono (node → B)
  | 'django'       // Django (Python → B)
  | 'flask'        // Flask (Python → B)
  | 'fastapi'      // FastAPI (Python → B)
  | 'reflex'       // Reflex (Python web → B)
  | 'laravel'      // Laravel (PHP → B)
  | 'symfony'      // Symfony (PHP → B)
  | 'rails'        // Ruby on Rails (B)
  | 'phoenix'      // Phoenix / Elixir (B)
  | 'spring'       // Spring (Java → B)
  | 'dotnet'       // .NET / ASP.NET (B)

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
  // ── Roadmap presets — ready omitted (= not ready). Shown "coming soon"
  //    in the dropdown (disabled) and as placeholder cards in the marketing
  //    "Connect your framework" grid. Contract is the EXPECTED runtime once
  //    wired; resolveSlotRepoUrl returns '' for them (no repo yet) — the ready
  //    contract-B family is untouched. ──
  { id: 'sveltekit', contract: 'B', label: 'SvelteKit' },
  { id: 'nuxt', contract: 'B', label: 'Nuxt' },
  { id: 'remix', contract: 'B', label: 'Remix' },
  { id: 'gatsby', contract: 'A', label: 'Gatsby' },
  { id: 'solid-start', contract: 'B', label: 'SolidStart' },
  { id: 'qwik', contract: 'B', label: 'Qwik' },
  { id: 'react-router', contract: 'B', label: 'React Router' },
  { id: 'tanstack-start', contract: 'B', label: 'TanStack Start' },
  { id: 'hugo', contract: 'A', label: 'Hugo' },
  { id: 'jekyll', contract: 'A', label: 'Jekyll' },
  { id: 'eleventy', contract: 'A', label: 'Eleventy' },
  { id: 'vite', contract: 'A', label: 'Vite' },
  { id: 'ember', contract: 'A', label: 'Ember' },
  { id: 'redwood', contract: 'B', label: 'Redwood' },
  { id: 'express', contract: 'B', label: 'Express' },
  { id: 'nestjs', contract: 'B', label: 'NestJS' },
  { id: 'fastify', contract: 'B', label: 'Fastify' },
  { id: 'hono', contract: 'B', label: 'Hono' },
  { id: 'django', contract: 'B', label: 'Django' },
  { id: 'flask', contract: 'B', label: 'Flask' },
  { id: 'fastapi', contract: 'B', label: 'FastAPI' },
  { id: 'reflex', contract: 'B', label: 'Reflex' },
  { id: 'laravel', contract: 'B', label: 'Laravel' },
  { id: 'symfony', contract: 'B', label: 'Symfony' },
  { id: 'rails', contract: 'B', label: 'Rails' },
  { id: 'phoenix', contract: 'B', label: 'Phoenix' },
  { id: 'spring', contract: 'B', label: 'Spring' },
  { id: 'dotnet', contract: 'B', label: '.NET' },
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
  // TEMPORARY: every framework deploys the Next.js starter (FNS) for now. The
  // dropdown lets the user pick any framework (no "coming soon" gating), but until
  // each preset's real starter repo lands the slot always clones FNS. Restore the
  // per-preset repo + '' fallback (no clone for contract-A presets) once they exist.
  return getFramework(id).repo ?? FNS_REPO
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
