import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildAlternates } from '@/lib/seo/alternates'
import { getAllArticles, getArticle } from '@/lib/news/articles'
import { PostBody } from '../../blog/_components/post-body'

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
  const ogImageUrl = article.ogImage.startsWith('/')
    ? `https://www.fractera.ai${article.ogImage}`
    : article.ogImage
  return {
    title: `${article.title} | Fractera News`,
    description: article.description,
    alternates: buildAlternates(lang, `/news/${slug}`),
    robots: { index: true, follow: true },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://www.fractera.ai/${lang}/news/${slug}`,
      type: 'article',
      publishedTime: article.date,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
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

  const url = `https://www.fractera.ai/${lang}/news/${slug}`
  const ogImageUrl = article.ogImage.startsWith('/')
    ? `https://www.fractera.ai${article.ogImage}`
    : article.ogImage

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      dateModified: article.date,
      inLanguage: 'en',
      author: {
        '@type': 'Organization',
        name: article.author?.name ?? 'Fractera, Inc.',
        url: 'https://www.fractera.ai',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fractera, Inc.',
        url: 'https://www.fractera.ai',
        logo: { '@type': 'ImageObject', url: 'https://www.fractera.ai/fractera-logo.jpg' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: article.tags.join(', '),
      image: ogImageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
        { '@type': 'ListItem', position: 2, name: 'News', item: `https://www.fractera.ai/${lang}/news` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
    ...(article.faq && article.faq.length > 0
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faq.map(f => ({
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
              <li><a href={`/${lang}/news`} className="hover:text-white">News</a></li>
              <li aria-hidden className="text-white/25">/</li>
              <li aria-current="page" className="truncate text-white/60">{article.title}</li>
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
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[26px]">{article.title}</h1>
            {article.subtitle && (
              <p className="text-lg leading-relaxed text-white/55 md:text-base">{article.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span aria-hidden>·</span>
              <span>{article.readingMinutes} min read</span>
              {article.author && (
                <>
                  <span aria-hidden>·</span>
                  <span>{article.author.name}</span>
                </>
              )}
            </div>
          </header>

          {/* Hero image — rendered only when asset is available */}
          {article.heroImage && (
            <figure className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.heroImage}
                alt={article.title}
                loading="eager"
                className="w-full rounded-2xl border border-white/10"
              />
            </figure>
          )}

          {/* Body */}
          <PostBody blocks={article.blocks} />

          {/* FAQ */}
          {article.faq && article.faq.length > 0 && (
            <section aria-labelledby="faq-heading" className="mt-12 border-t border-white/10 pt-10">
              <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
              <dl className="mt-6 flex flex-col gap-4">
                {article.faq.map((f, i) => (
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
              Back to all news
            </a>
          </div>
        </article>
      </main>
    </>
  )
}
