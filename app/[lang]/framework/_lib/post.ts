// Co-located framework-page helpers. Each framework (/framework/<slug>) lives in its
// own static route folder (app/[lang]/framework/<slug>/ with page.tsx + _components +
// _data) — the page IS the single source of truth. These helpers turn a page's _data
// (meta + en + <lang> overrides) into the resolved descriptor the createContentPage
// factory renders, AND into the compact, localized row the /framework catalog lists.
// No central registry: the shared parser-fs generator scans these folders into
// _list.generated.ts, so adding/removing a folder adds/removes the catalog row
// automatically. These helpers are co-located in the framework route's own _lib —
// delete the framework folder and nothing is left behind. Same resolveEntry path +
// EN-fallback-per-key as the other tabs. Exact mirror of the Deployments tab.

import { resolveEntry } from '@/lib/content/resolve'
import type { LocalizedBody, LocalizedBodyOverride } from '@/lib/content/types'
import type { ContentPageContent } from '@/lib/content/create-content-page'

/** Non-translatable per-page fields (mirrors a deployment target's meta.ts). */
export type FrameworkMeta = {
  slug: string // catalog list key (folder name)
  subPath: string // e.g. '/framework/next-js' — used for the page route AND the catalog href
  order: number // catalog sort order (ascending)
  tags?: readonly string[]
  author?: { name: string; role: string; url: string }
  heroImage?: string
  ogImage: string // required — drives the social snippet (page-image-always-to-snippet)
}

/** Base-language document. Adds the catalog-row copy on top of the page body/SEO. */
export type FrameworkBase = LocalizedBody & {
  title: string // H1
  seoTitle?: string
  subtitle?: string
  description: string
  keywords: string
  listTitle: string // catalog row title (short)
  listDescription: string // catalog row description (short)
  founderQuote?: string // optional founder-quote block rendered in the page footer
}

/** Partial per-language override (all translatable fields optional). */
export type FrameworkOverride = LocalizedBodyOverride & {
  title?: string
  seoTitle?: string
  subtitle?: string
  description?: string
  keywords?: string
  listTitle?: string
  listDescription?: string
  founderQuote?: string
}

/** A page folder's _data, assembled in its _data/index.ts. */
export type FrameworkData = {
  meta: FrameworkMeta
  en: FrameworkBase
  overrides?: Record<string, FrameworkOverride>
}

const FIELDS = [
  'title',
  'seoTitle',
  'subtitle',
  'description',
  'keywords',
  'listTitle',
  'listDescription',
] as const

function resolve(data: FrameworkData, lang: string) {
  return resolveEntry(data.en, data.overrides, lang, FIELDS)
}

/** Resolve a page's _data into the descriptor createContentPage's `resolve` expects. */
export function frameworkContent(data: FrameworkData, lang: string): ContentPageContent {
  const r = resolve(data, lang)
  return {
    title: r.title,
    seoTitle: r.seoTitle ?? r.title,
    subtitle: r.subtitle,
    description: r.description,
    keywords: r.keywords,
    blocks: r.blocks,
    faq: r.faq,
  }
}

/** Compact, localized row for the /framework catalog list. */
export function frameworkListItem(data: FrameworkData, lang: string) {
  const r = resolve(data, lang)
  return {
    slug: data.meta.slug,
    href: data.meta.subPath,
    order: data.meta.order,
    title: r.listTitle,
    description: r.listDescription,
  }
}

/** Localized founder-quote text for a page's footer (EN-fallback per key), or
 *  undefined when the page has none. */
export function frameworkFounderQuote(data: FrameworkData, lang: string): string | undefined {
  return data.overrides?.[lang]?.founderQuote ?? data.en.founderQuote
}

/** Build the localized, order-sorted catalog list from the auto-discovered POSTS
 *  array (lib/parser-fs generates the array; this aggregates + sorts it). */
export function frameworkList(posts: FrameworkData[], lang: string) {
  return posts.map(d => frameworkListItem(d, lang)).sort((a, b) => a.order - b.order)
}
