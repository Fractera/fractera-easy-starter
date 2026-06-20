import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildAlternates } from '@/lib/seo/alternates'
import { getAllArticles, getArticle, resolveArticle } from '@/lib/news/articles'
import { getNewsUi } from '@/lib/news/ui'
import { AUTHOR, AUTHOR_SAME_AS } from '@/lib/author'
import { PostBody, headingId } from '../../blog/_components/post-body'

// Language-specific suffix for the <title> tag (the rest of the title is the
// per-language SEO title resolved from the article's i18n overrides).
function titleSuffix(lang: string): string {
  return lang === 'ru' ? 'Новости Fractera' : 'Fractera News'
}

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  const { seoTitle, description, keywords } = resolveArticle(article, lang)
  const ogImageUrl = article.ogImage.startsWith('/')
    ? `https://www.fractera.ai${article.ogImage}`
    : article.ogImage
  return {
    title: `${seoTitle} | ${titleSuffix(lang)}`,
    description,
    keywords,
    alternates: buildAlternates(lang, `/news/${slug}`),
    robots: { index: true, follow: true },
    openGraph: {
      title: seoTitle,
      description,
      url: `https://www.fractera.ai/${lang}/news/${slug}`,
      type: 'article',
      publishedTime: article.date,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: [ogImageUrl],
    },
  }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  // Resolve per-language title / subtitle / description / keywords / blocks / faq.
  const { title, subtitle, description, keywords, blocks, faq } = resolveArticle(article, lang)
  const ui = getNewsUi(lang)

  const url = `https://www.fractera.ai/${lang}/news/${slug}`
  const ogImageUrl = article.ogImage.startsWith('/')
    ? `https://www.fractera.ai${article.ogImage}`
    : article.ogImage

  // Table of contents — built from the article's H2 sections so a reader can see
  // the full scope of what this update covers at a glance (and how many parts it
  // has). Built from the localized blocks so labels AND anchors match PostBody.
  const toc = blocks
    .filter((b): b is { kind: 'h2'; text: string } => b.kind === 'h2')
    .map(b => ({ id: headingId(b.text), text: b.text.replace(/\*\*/g, '') }))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description,
      datePublished: article.date,
      dateModified: article.date,
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
        name: 'Fractera, Inc.',
        url: 'https://www.fractera.ai',
        logo: { '@type': 'ImageObject', url: 'https://www.fractera.ai/fractera-logo.jpg' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: keywords ?? article.tags.join(', '),
      image: ogImageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
        { '@type': 'ListItem', position: 2, name: ui.breadcrumbNews, item: `https://www.fractera.ai/${lang}/news` },
        { '@type': 'ListItem', position: 3, name: title, item: url },
      ],
    },
    ...(faq && faq.length > 0
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(f => ({
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
      <main className="min-h-screen bg-black text-white">
        <article className="mx-auto w-full max-w-3xl px-6 py-16 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-white/40">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><a href={`/${lang}`} className="hover:text-white">Fractera</a></li>
              <li aria-hidden className="text-white/25">/</li>
              <li><a href={`/${lang}/news`} className="hover:text-white">{ui.breadcrumbNews}</a></li>
              <li aria-hidden className="text-white/25">/</li>
              <li aria-current="page" className="truncate text-white/60">{title}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mt-6 flex flex-col gap-5 border-b border-white/10 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              {article.tags.map(t => (
                <span key={t} className="rounded-full border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 text-xs font-medium text-violet-300">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[26px]">{title}</h1>
            {subtitle && (
              <p className="text-lg leading-relaxed text-white/55 md:text-base">{subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span aria-hidden>·</span>
              <span>{article.readingMinutes} {ui.minRead}</span>
              <span aria-hidden>·</span>
              <a href={AUTHOR.url} rel="author" className="hover:text-white">{AUTHOR.name}</a>
              <span aria-hidden>·</span>
              <span>{AUTHOR.role}</span>
            </div>
          </header>

          {/* Hero image — rendered only when asset is available */}
          {article.heroImage && (
            <figure className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.heroImage}
                alt={title}
                loading="eager"
                className="w-full rounded-2xl border border-white/10"
              />
            </figure>
          )}

          {/* Table of contents — upfront, so the scope (and how many parts) is
              clear before reading. Anchor links jump to each H2 section. */}
          {toc.length > 0 && (
            <nav aria-label="Contents" className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/70">
                {ui.tocHeading} · {toc.length}
              </p>
              <ol className="mt-3 flex flex-col gap-2">
                {toc.map((item, i) => (
                  <li key={item.id} className="flex gap-3 text-[15px] leading-snug">
                    <span aria-hidden className="select-none font-mono text-sm text-white/30">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <a href={`#${item.id}`} className="text-white/65 transition-colors hover:text-violet-300">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Body */}
          <PostBody blocks={blocks} lang={lang} />

          {/* FAQ */}
          {faq && faq.length > 0 && (
            <section aria-labelledby="faq-heading" className="mt-12 border-t border-white/10 pt-10">
              <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">{ui.faqHeading}</h2>
              <dl className="mt-6 flex flex-col gap-4">
                {faq.map((f, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <dt className="text-base font-semibold text-white">{f.q}</dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-white/60">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Back link */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <a href={`/${lang}/news`} className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {ui.backToNews}
            </a>
          </div>
        </article>
      </main>
    </>
  )
}
