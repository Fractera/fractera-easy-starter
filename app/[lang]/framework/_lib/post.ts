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
import { AUTHOR } from '@/lib/author'
import { FRAMEWORK_PAGES, frameworkPageBySlug } from '@/lib/frameworks-pages'

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

/** Compact, localized row for the /framework catalog list. Enriched with the
 *  framework's brand identity (name + icon) from the page registry so the catalog
 *  card can render the icon on the left. */
export function frameworkListItem(data: FrameworkData, lang: string) {
  const r = resolve(data, lang)
  const reg = frameworkPageBySlug(data.meta.slug)
  return {
    slug: data.meta.slug,
    href: data.meta.subPath,
    order: data.meta.order,
    title: r.listTitle,
    description: r.listDescription,
    name: reg?.name ?? r.listTitle, // canonical name (icon lookup / favicon check)
    icon: reg?.icon, // /framework-icons/<icon>.svg, or undefined → favicon / letter chip
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

// ─────────────────────────────────────────────────────────────────────────────
// buildFrameworkData — the SCAFFOLDING template. Every framework page is the same
// Next.js sample with its name substituted everywhere (title/breadcrumb/SEO + the
// dynamic containers: form H2, first feature item, feedback card/drawer). The body
// is intentionally empty (blocks: []); the per-framework content + SEO pass is a
// separate sub-step. Each framework folder's _data/index.ts is just
// `export const data = buildFrameworkData('<slug>')`, and the page registry
// (lib/frameworks-pages) is the single source of the name/order. The placeholder
// founder quote is shared across all frameworks for now.
// ─────────────────────────────────────────────────────────────────────────────

const FOUNDER_QUOTE_EN = 'Be so passionate that no one can tell whether you are a madman or a genius.'
const FOUNDER_QUOTE_RU = 'Быть увлечённым настолько, чтобы никто не мог догадаться — сумасшедший ты или гений.'

function enBase(name: string): FrameworkBase {
  return {
    title: `${name} on Agent Engineering Infrastructure`,
    subtitle: `Deploy an agent-optimized ${name} starter on your own server. Content and optimization land in a later step.`,
    description: `An agent-ready ${name} starter on the Fractera agent engineering infrastructure: auth, database, media, and routing wired in advance.`,
    keywords: `${name} agent engineering, self hosted ${name} starter, ${name} private database, ${name} mcp agent integration`,
    listTitle: name,
    listDescription: `The agent-optimized ${name} starter on the Fractera infrastructure.`,
    founderQuote: FOUNDER_QUOTE_EN,
    blocks: [],
  }
}

function ruOverride(name: string): DeploymentOverrideShape {
  return {
    title: `${name} на инфраструктуре инженерии агентов`,
    subtitle: `Разверните оптимизированный под агентов стартер ${name} на своём сервере. Контент и оптимизация — в отдельном шаге.`,
    description: `Готовый под агентов стартер ${name} на инфраструктуре инженерии агентов Fractera: авторизация, база данных, медиа и маршрутизация подключены заранее.`,
    keywords: `${name} инженерия агентов, self hosted ${name} starter, приватная база данных ${name}, ${name} mcp агент`,
    listTitle: name,
    listDescription: `Оптимизированный под агентов стартер ${name} на инфраструктуре Fractera.`,
    founderQuote: FOUNDER_QUOTE_RU,
  }
}

type DeploymentOverrideShape = FrameworkOverride

/** Build a framework page's _data from the registry — name substituted everywhere. */
export function buildFrameworkData(slug: string): FrameworkData {
  const fw = frameworkPageBySlug(slug)
  if (!fw) throw new Error(`buildFrameworkData: unknown framework slug "${slug}"`)
  const order = FRAMEWORK_PAGES.findIndex(f => f.slug === slug)
  const meta: FrameworkMeta = {
    slug: fw.slug,
    subPath: `/framework/${fw.slug}`,
    order,
    tags: [fw.name, 'Agentic Engineering'],
    author: { name: AUTHOR.name, role: AUTHOR.role, url: AUTHOR.url },
    ogImage: '/Fractera-ai-workspace-screenshot.png',
  }
  return { meta, en: enBase(fw.name), overrides: { ru: ruOverride(fw.name) } }
}
