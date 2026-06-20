import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildAlternates } from '@/lib/seo/alternates'
import { getAllDocs, getDoc } from '@/lib/documentation'
import { PostBody, headingId } from '../../blog/_components/post-body'

export function generateStaticParams() {
  return getAllDocs().map(d => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const doc = getDoc(slug)
  if (!doc) return {}
  const ogImage = doc.image ? `https://www.fractera.ai${doc.image.web}` : undefined
  return {
    title: `${doc.title} | Fractera Documentation`,
    description: doc.description,
    alternates: buildAlternates(lang, `/documentation/${slug}`),
    robots: { index: true, follow: true },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: `https://www.fractera.ai/${lang}/documentation/${slug}`,
      type: 'article',
      publishedTime: doc.date,
      ...(ogImage ? { images: [{ url: ogImage, alt: doc.image!.alt }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description,
      ...(ogImage ? { images: [ogImage] } : {}),
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

export default async function DocumentationDocPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  const url = `https://www.fractera.ai/${lang}/documentation/${slug}`
  // Table of contents — derived from the h2 headings (anchored via headingId).
  const toc = doc.blocks
    .filter((b): b is { kind: 'h2'; text: string } => b.kind === 'h2')
    .map(b => ({ id: headingId(b.text), text: b.text }))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: doc.title,
      description: doc.description,
      datePublished: doc.date,
      dateModified: doc.date,
      inLanguage: 'en',
      author: { '@type': 'Organization', name: 'Fractera, Inc.', url: 'https://www.fractera.ai' },
      publisher: { '@type': 'Organization', name: 'Fractera, Inc.', url: 'https://www.fractera.ai' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: doc.tags.join(', '),
      ...(doc.image ? { image: `https://www.fractera.ai${doc.image.web}` } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
        { '@type': 'ListItem', position: 2, name: 'Documentation', item: `https://www.fractera.ai/${lang}/documentation` },
        { '@type': 'ListItem', position: 3, name: doc.title, item: url },
      ],
    },
    ...(doc.faq && doc.faq.length > 0
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: doc.faq.map(f => ({
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
          {/* Breadcrumb — matches the BreadcrumbList JSON-LD above. */}
          <nav aria-label="Breadcrumb" className="text-sm text-white/40">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><a href={`/${lang}`} className="hover:text-white">Fractera</a></li>
              <li aria-hidden className="text-white/25">/</li>
              <li><a href={`/${lang}/documentation`} className="hover:text-white">Documentation</a></li>
              <li aria-hidden className="text-white/25">/</li>
              <li aria-current="page" className="truncate text-white/60">{doc.title}</li>
            </ol>
          </nav>

          {/* Header — tags + title + description */}
          <header className="mt-6 flex flex-col gap-5 border-b border-white/10 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              {doc.tags.map(t => (
                <span key={t} className="rounded-full border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 text-xs font-medium text-violet-300">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[26px]">{doc.title}</h1>
            <p className="text-lg leading-relaxed text-white/55 md:text-base">{doc.description}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40">
              <time dateTime={doc.date}>{formatDate(doc.date)}</time>
              <span aria-hidden>·</span>
              <span>{doc.readingMinutes} min read</span>
            </div>
          </header>

          {/* Hero diagram — responsive: portrait on mobile, landscape on web. The
              web image is also the og:image / TechArticle image. */}
          {doc.image && (
            <figure className="my-8">
              <picture>
                <source media="(min-width: 768px)" srcSet={doc.image.web} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.image.mobile}
                  alt={doc.image.alt}
                  loading="eager"
                  className="w-full rounded-2xl border border-white/10 bg-white"
                />
              </picture>
            </figure>
          )}

          {/* Table of contents */}
          {toc.length > 0 && (
            <nav aria-label="Table of contents" className="my-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">On this page</p>
              <ul className="flex flex-col gap-2">
                {toc.map(item => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-sm text-white/60 underline-offset-2 hover:text-violet-300 hover:underline">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Body */}
          <PostBody blocks={doc.blocks} />

          {/* FAQ — mirrors the FAQPage JSON-LD above (rich-result eligible). */}
          {doc.faq && doc.faq.length > 0 && (
            <section aria-labelledby="faq-heading" className="mt-12 border-t border-white/10 pt-10">
              <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
              <dl className="mt-6 flex flex-col gap-4">
                {doc.faq.map((f, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <dt className="text-base font-semibold text-white">{f.q}</dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-white/60">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Footer back link */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <a href={`/${lang}/documentation`} className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to all documentation
            </a>
          </div>
        </article>
      </main>
    </>
  )
}
