import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import type { Block, FaqPair } from '@/lib/content/blocks/types'
import { buildAlternates } from '@/lib/seo/alternates'
import { AUTHOR, AUTHOR_SAME_AS } from '@/lib/author'
import { BRAND, brandLogoUrl } from '@/lib/brand'
import { StandardContentPage } from '@/components/content-page/standard-content-page'

// ─────────────────────────────────────────────────────────────────────────────
// createContentPost — the POST factory (sibling of createContentPage). One
// universal technology for publishing posts of every format: news, blog and
// documentation. The `format` parameter selects a preset that carries the
// type-specific differences (structured-data type + author kind); everything
// else (breadcrumbs, byline, hero, TOC, FAQ, back link) is shared and rendered
// through the SAME block, StandardContentPage. A post route becomes a thin file
// that maps its content module to this factory.
//
// i18n is orthogonal: `resolve(lang, slug)` is the per-format resolver — news
// returns a per-language article (resolveArticle), EN-only formats ignore `lang`.
// The factory never reads or changes a content file.
// ─────────────────────────────────────────────────────────────────────────────

export type PostFormat = 'news' | 'blog' | 'document'

// Format presets: the only things that genuinely differ between post types.
const JSONLD_TYPE: Record<PostFormat, 'NewsArticle' | 'BlogPosting' | 'TechArticle'> = {
  news: 'NewsArticle',
  blog: 'BlogPosting',
  document: 'TechArticle',
}
const AUTHOR_KIND: Record<PostFormat, 'person' | 'organization'> = {
  news: 'person',
  blog: 'organization',
  document: 'person',
}

/** Normalized post descriptor a route adapts its content module into. */
export type ContentPost = {
  title: string // H1 + JSON-LD headline
  seoTitle?: string // <title> / og:title (falls back to title)
  subtitle?: string
  description: string
  keywords?: string
  tags: string[]
  date: string // ISO
  readingMinutes: number
  /** Visible byline name; omit to show no author in the byline (e.g. docs). */
  authorName?: string
  blocks: Block[]
  faq?: FaqPair[]
  /** og:image / structured-data image — absolute or site-root-relative. */
  ogImage?: string
  /** Pre-rendered hero (image / video / responsive picture) built by the route. */
  hero?: ReactNode
  /** Content language for inLanguage; defaults to 'en'. */
  inLanguage?: string
}

export type ContentPostConfig = {
  format: PostFormat
  /** Route base, e.g. '/news'. The slug is appended. */
  basePath: string
  getAllSlugs: () => string[]
  resolve: (lang: string, slug: string) => ContentPost | undefined
  /** Localized chrome. */
  titleSuffix: (lang: string) => string
  breadcrumbLabel: (lang: string) => string
  backLabel: (lang: string) => string
  /** "min read" label; defaults to 'min read'. */
  minLabel?: (lang: string) => string
}

function abs(path: string): string {
  return /^https?:/.test(path) ? path : `${BRAND.siteUrl}${path}`
}

function formatDate(iso: string, lang: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function createContentPost(config: ContentPostConfig) {
  const { format, basePath, getAllSlugs, resolve, titleSuffix, breadcrumbLabel, backLabel } = config
  const minLabel = config.minLabel ?? (() => 'min read')

  function generateStaticParams() {
    return getAllSlugs().map(slug => ({ slug }))
  }

  async function generateMetadata({
    params,
  }: {
    params: Promise<{ lang: string; slug: string }>
  }): Promise<Metadata> {
    const { lang, slug } = await params
    const post = resolve(lang, slug)
    if (!post) return {}
    const seoTitle = post.seoTitle ?? post.title
    const ogImage = post.ogImage ? abs(post.ogImage) : undefined
    return {
      title: `${seoTitle} | ${titleSuffix(lang)}`,
      description: post.description,
      ...(post.keywords ? { keywords: post.keywords } : {}),
      alternates: buildAlternates(lang, `${basePath}/${slug}`),
      robots: { index: true, follow: true },
      openGraph: {
        title: seoTitle,
        description: post.description,
        url: `${BRAND.siteUrl}/${lang}${basePath}/${slug}`,
        type: 'article',
        publishedTime: post.date,
        ...(ogImage ? { images: [{ url: ogImage, alt: post.title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: post.description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    }
  }

  async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
    const { lang, slug } = await params
    const post = resolve(lang, slug)
    if (!post) notFound()

    const url = `${BRAND.siteUrl}/${lang}${basePath}/${slug}`
    const ogImage = post.ogImage ? abs(post.ogImage) : undefined
    const crumbLabel = breadcrumbLabel(lang)

    const authorNode =
      AUTHOR_KIND[format] === 'person'
        ? { '@type': 'Person', '@id': AUTHOR.id, name: AUTHOR.name, url: AUTHOR.url, sameAs: AUTHOR_SAME_AS }
        : { '@type': 'Organization', name: BRAND.legalName, url: BRAND.siteUrl }

    const jsonLd: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': JSONLD_TYPE[format],
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: post.inLanguage ?? 'en',
        author: authorNode,
        publisher: {
          '@type': 'Organization',
          name: BRAND.legalName,
          url: BRAND.siteUrl,
          logo: { '@type': 'ImageObject', url: brandLogoUrl },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: post.keywords ?? post.tags.join(', '),
        ...(ogImage ? { image: ogImage } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: BRAND.name, item: `${BRAND.siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: crumbLabel, item: `${BRAND.siteUrl}/${lang}${basePath}` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faq && post.faq.length > 0
        ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }]
        : []),
    ]

    const metaLine = (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40">
        {post.authorName && (
          <>
            <span className="font-medium text-white/60">{post.authorName}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} {minLabel(lang)}</span>
      </div>
    )

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <StandardContentPage
          lang={lang}
          breadcrumbs={[
            { label: BRAND.name, href: `/${lang}` },
            { label: crumbLabel, href: `/${lang}${basePath}` },
            { label: post.title },
          ]}
          tags={post.tags}
          title={post.title}
          subtitle={post.subtitle}
          metaLine={metaLine}
          hero={post.hero}
          blocks={post.blocks}
          faq={post.faq}
          backHref={`/${lang}${basePath}`}
          backLabel={backLabel(lang)}
        />
      </>
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}
