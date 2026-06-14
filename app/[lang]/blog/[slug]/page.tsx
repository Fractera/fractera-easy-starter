import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildAlternates } from '@/lib/seo/alternates'
import { getAllPosts, getPost } from '@/lib/blog/posts'
import { PostBody } from '../_components/post-body'

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | Fractera Blog`,
    description: post.description,
    alternates: buildAlternates(lang, `/blog/${slug}`),
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.fractera.ai/${lang}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: post.ogImage, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.ogImage],
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `https://www.fractera.ai/${lang}/blog/${slug}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: post.ogImage,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'en',
      author: { '@type': 'Organization', name: 'Fractera, Inc.', url: 'https://www.fractera.ai' },
      publisher: { '@type': 'Organization', name: 'Fractera, Inc.', url: 'https://www.fractera.ai' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: post.tags.join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://www.fractera.ai/${lang}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-black text-white">
        <article className="mx-auto w-full max-w-3xl px-6 py-16 md:py-12">
          {/* Breadcrumb / back */}
          <a href={`/${lang}/blog`} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            All articles
          </a>

          {/* Header */}
          <header className="mt-6 flex flex-col gap-5 border-b border-white/10 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map(t => (
                <span key={t} className="rounded-full border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 text-xs font-medium text-violet-300">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[26px]">{post.title}</h1>
            <p className="text-lg leading-relaxed text-white/55 md:text-base">{post.subtitle}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40">
              <span className="font-medium text-white/60">{post.author.name}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </header>

          {/* Hero video — illustration 1 */}
          <figure className="my-8 flex flex-col gap-3">
            <div
              className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_60px_-15px_rgba(167,139,250,0.35)]"
              style={post.heroAspect ? { aspectRatio: post.heroAspect } : undefined}
            >
              <video
                src={post.heroVideo}
                poster={post.heroPoster}
                controls
                playsInline
                preload="none"
                className="h-full w-full bg-black object-cover"
              />
            </div>
            <figcaption className="text-center text-sm text-white/40">
              The LinkedIn post that set this off — Boris Cherny on writing loops, not prompts.
            </figcaption>
          </figure>

          {/* Body */}
          <PostBody blocks={post.blocks} />

          {/* Footer CTA back to blog */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <a href={`/${lang}/blog`} className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to all articles
            </a>
          </div>
        </article>
      </main>
    </>
  )
}
