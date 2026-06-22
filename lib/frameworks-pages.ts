import type { FrameworkId } from './frameworks-catalog'

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the framework catalog PAGES (/[lang]/framework/<slug>).
// One row per framework: the route slug, the display name (substituted into ALL
// page copy + the install form + the feedback card), the deploy FrameworkId (every
// framework temporarily deploys the Next.js starter — resolveSlotRepoUrl → FNS), and
// the brand icon basename in /public/framework-icons (absent → Fractera-Pro favicon
// or a letter chip, mirroring the header/grid). Order = catalog + header order.
//
// Server-safe (no 'use client'): both server components (the /framework router, the
// page factory) and client components (header dropdown, homepage grid) import from
// here. ICON / FRAMEWORK_SLUG / frameworkPath are derived below so there is exactly
// one place to edit when a framework is added.
// ─────────────────────────────────────────────────────────────────────────────

export type FrameworkPage = {
  slug: string // route folder + /framework/<slug>
  name: string // display name, substituted into every dynamic container
  id: FrameworkId // install-form preselect (deploy target)
  icon?: string // /public/framework-icons/<icon>.svg — absent → favicon / letter chip
}

export const FRAMEWORK_PAGES: FrameworkPage[] = [
  { slug: 'fractera-pro',   name: 'Fractera Pro',   id: 'fractera-pro' },
  { slug: 'next-js',        name: 'Next.js',        id: 'next',           icon: 'next-js-dark' },
  { slug: 'react',          name: 'React',          id: 'react',          icon: 'react' },
  { slug: 'vue',            name: 'Vue',            id: 'vue',            icon: 'vue' },
  { slug: 'angular',        name: 'Angular',        id: 'angular',        icon: 'angular' },
  { slug: 'sveltekit',      name: 'SvelteKit',      id: 'sveltekit',      icon: 'svelte' },
  { slug: 'nuxt',           name: 'Nuxt',           id: 'nuxt',           icon: 'nuxt' },
  { slug: 'astro',          name: 'Astro',          id: 'astro',          icon: 'astro-dark' },
  { slug: 'remix',          name: 'Remix',          id: 'remix',          icon: 'remix' },
  { slug: 'gatsby',         name: 'Gatsby',         id: 'gatsby',         icon: 'gatsby' },
  { slug: 'solidstart',     name: 'SolidStart',     id: 'solid-start',    icon: 'solidstart' },
  { slug: 'qwik',           name: 'Qwik',           id: 'qwik',           icon: 'qwik' },
  { slug: 'react-router',   name: 'React Router',   id: 'react-router',   icon: 'react-router' },
  { slug: 'tanstack-start', name: 'TanStack Start', id: 'tanstack-start', icon: 'tanstack-dark' },
  { slug: 'hugo',           name: 'Hugo',           id: 'hugo',           icon: 'hugo' },
  { slug: 'jekyll',         name: 'Jekyll',         id: 'jekyll',         icon: 'jekyll' },
  { slug: 'eleventy',       name: 'Eleventy',       id: 'eleventy',       icon: 'eleventy' },
  { slug: 'vite',           name: 'Vite',           id: 'vite',           icon: 'vite' },
  { slug: 'ember',          name: 'Ember',          id: 'ember',          icon: 'ember' },
  { slug: 'redwood',        name: 'Redwood',        id: 'redwood',        icon: 'redwoodsdk' },
  { slug: 'express',        name: 'Express',        id: 'express',        icon: 'express-dark' },
  { slug: 'nestjs',         name: 'NestJS',         id: 'nestjs',         icon: 'nest-js' },
  { slug: 'fastify',        name: 'Fastify',        id: 'fastify',        icon: 'fastify' },
  { slug: 'hono',           name: 'Hono',           id: 'hono' },
  { slug: 'django',         name: 'Django',         id: 'django',         icon: 'django-dark' },
  { slug: 'flask',          name: 'Flask',          id: 'flask',          icon: 'flask' },
  { slug: 'fastapi',        name: 'FastAPI',        id: 'fastapi',        icon: 'fastapi' },
  { slug: 'reflex',         name: 'Reflex',         id: 'reflex' },
  { slug: 'laravel',        name: 'Laravel',        id: 'laravel',        icon: 'laravel-dark' },
  { slug: 'symfony',        name: 'Symfony',        id: 'symfony',        icon: 'symfony-dark' },
  { slug: 'rails',          name: 'Rails',          id: 'rails',          icon: 'rails-dark' },
  { slug: 'phoenix',        name: 'Phoenix',        id: 'phoenix',        icon: 'phoenix' },
  { slug: 'spring',         name: 'Spring',         id: 'spring',         icon: 'spring' },
  { slug: 'dotnet',         name: '.NET',           id: 'dotnet',         icon: 'dotnet' },
]

export function frameworkPageBySlug(slug: string): FrameworkPage | undefined {
  return FRAMEWORK_PAGES.find(f => f.slug === slug)
}

// Display-name → logo basename in /public/framework-icons (only entries with an svg).
export const ICON: Record<string, string> = Object.fromEntries(
  FRAMEWORK_PAGES.filter(f => f.icon).map(f => [f.name, f.icon!]),
)

// Display-name → route slug (used by the header dropdown + homepage grid).
export const FRAMEWORK_SLUG: Record<string, string> = Object.fromEntries(
  FRAMEWORK_PAGES.map(f => [f.name, f.slug]),
)

/** Localized href for a framework's catalog page. Falls back to the catalog index
 *  if the name is unknown (defensive — every header/grid name is in the map). */
export function frameworkPath(name: string, lang: string): string {
  const slug = FRAMEWORK_SLUG[name]
  return slug ? `/${lang}/framework/${slug}` : `/${lang}/framework`
}
