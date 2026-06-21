import type { Metadata } from 'next'
import type { Block, FaqPair } from '@/lib/content/blocks/types'
import { buildAlternates } from '@/lib/seo/alternates'
import { AUTHOR, AUTHOR_SAME_AS } from '@/lib/author'
import { BRAND, brandLogoUrl } from '@/lib/brand'
import { StandardContentPage, type Breadcrumb } from '@/components/content-page/standard-content-page'

// ─────────────────────────────────────────────────────────────────────────────
// createContentPage — the page factory. It turns a content descriptor into a
// complete, fully-static Block-3 page: `generateMetadata` (title/desc/keywords/
// hreflang/OpenGraph) + JSON-LD (Article/BreadcrumbList/FAQPage, author=Person)
// + the StandardContentPage chrome. A new route becomes a ~10-line file that
// supplies data only; all the boilerplate lives here.
//
// The i18n layer is untouched: `resolve(lang)` is the existing per-document
// resolver (e.g. getDeploymentsLocal, co-located in the route's ./_data folder)
// built on resolveEntry with EN-fallback. The factory never reads or changes any
// localized content file.
// ─────────────────────────────────────────────────────────────────────────────

// Brand-derived origin — sourced from env via lib/brand (white-label/portable).
const SITE = BRAND.siteUrl

/** Shape returned by a per-document resolver — the localized page descriptor. */
export type ContentPageContent = {
  title: string // H1
  seoTitle?: string
  subtitle?: string
  description: string
  keywords: string
  blocks: Block[]
  faq?: FaqPair[]
}

/** Page-specific, localized chrome (breadcrumb trail + back link). */
export type ContentPageChrome = {
  breadcrumbs: Breadcrumb[]
  backHref: string
  backLabel: string
}

export type ContentPageConfig<C extends ContentPageContent> = {
  /** Per-document, per-language resolver (resolveEntry-based). */
  resolve: (lang: string) => C
  /** Localized breadcrumb trail + back link for this page. */
  chrome: (lang: string, content: C) => ContentPageChrome
  /** Non-translatable per-page fields. */
  meta: {
    subPath: string
    ogImage: string
    heroImage?: string
    tags?: readonly string[]
  }
  /** Structured-data type for the primary entity. Defaults to 'Article'. */
  jsonLdType?: 'Article' | 'NewsArticle'
}

function abs(path: string): string {
  return /^https?:/.test(path) ? path : `${SITE}${path}`
}

export function createContentPage<C extends ContentPageContent>(config: ContentPageConfig<C>) {
  const { resolve, chrome, meta, jsonLdType = 'Article' } = config

  async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params
    const c = resolve(lang)
    const seoTitle = c.seoTitle ?? c.title
    return {
      title: `${seoTitle} | ${BRAND.name}`,
      description: c.description,
      keywords: c.keywords,
      alternates: buildAlternates(lang, meta.subPath),
      openGraph: {
        type: 'article',
        url: `${SITE}/${lang}${meta.subPath}`,
        siteName: BRAND.name,
        title: seoTitle,
        description: c.description,
        images: [{ url: meta.ogImage, width: 1200, height: 630, alt: c.title }],
      },
    }
  }

  async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const c = resolve(lang)
    const { breadcrumbs, backHref, backLabel } = chrome(lang, c)
    const url = `${SITE}/${lang}${meta.subPath}`
    const ogImageUrl = abs(meta.ogImage)

    const jsonLd: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': jsonLdType,
        headline: c.title,
        description: c.description,
        inLanguage: lang,
        author: {
          '@type': 'Person',
          '@id': AUTHOR.id,
          name: AUTHOR.name,
          url: AUTHOR.url,
          sameAs: AUTHOR_SAME_AS,
        },
        publisher: {
          '@type': 'Organization',
          name: BRAND.legalName,
          url: SITE,
          logo: { '@type': 'ImageObject', url: brandLogoUrl },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: c.keywords,
        image: ogImageUrl,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.label,
          item: i === breadcrumbs.length - 1 ? url : abs(b.href ?? meta.subPath),
        })),
      },
      ...(c.faq && c.faq.length > 0
        ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: c.faq.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }]
        : []),
    ]

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <StandardContentPage
          lang={lang}
          breadcrumbs={breadcrumbs}
          tags={meta.tags ? [...meta.tags] : undefined}
          title={c.title}
          subtitle={c.subtitle}
          heroImage={meta.heroImage}
          heroAlt={c.title}
          blocks={c.blocks}
          faq={c.faq}
          backHref={backHref}
          backLabel={backLabel}
        />
      </>
    )
  }

  return { generateMetadata, Page }
}
