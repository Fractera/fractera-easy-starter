import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { BRAND } from '@/lib/brand'
import { getAllPosts } from '@/lib/blog'

// Entry for the /blog router page. Standard router shape: page.tsx is thin and
// re-exports this. NOTE: blog posts are not co-located yet (still on the legacy
// lib/blog registry + [slug] route), so this index reads getAllPosts for now.
// When blog posts move to co-located folders, add 'blog' to lib/parser-fs's
// COLLECTIONS and switch this to POSTS from _list.generated.ts like news/docs.

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return {
    title: 'Blog | Fractera',
    description:
      'Field notes on agentic AI development, loop engineering and autonomous coding agents — from the team building an open-source, self-hosted AI workspace.',
    alternates: buildAlternates(lang, '/blog'),
  }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function BlogIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND.name, item: `${BRAND.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BRAND.siteUrl}/${lang}/blog` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-20 md:py-14">
          <header className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-violet-400/70">Fractera blog</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-3xl">Building in loops</h1>
            <p className="max-w-2xl text-base text-white/50">
              Field notes on agentic AI development, loop engineering and autonomous coding agents — from the team
              building an open-source, self-hosted AI workspace.
            </p>
          </header>

          {featured && (
            <a
              href={`/${lang}/blog/${featured.slug}`}
              className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 transition-colors hover:border-violet-500/40 md:grid-cols-2"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900 md:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.ogImage}
                  alt={featured.title}
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <span className="absolute left-4 top-4 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                  Featured
                </span>
              </div>
              <div className="flex flex-col gap-4 p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  {featured.tags.slice(0, 2).map(t => (
                    <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/50">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-xl">
                  {featured.title}
                </h2>
                <p className="text-base leading-relaxed text-white/55">{featured.excerpt}</p>
                <div className="mt-auto flex items-center gap-3 pt-2 text-sm text-white/40">
                  <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{featured.readingMinutes} min read</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 font-medium text-violet-400 group-hover:text-violet-300">
                    Read
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </div>
            </a>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map(post => (
                <a
                  key={post.slug}
                  href={`/${lang}/blog/${post.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 p-6 transition-colors hover:border-violet-500/40"
                >
                  <h3 className="text-lg font-semibold leading-snug text-white">{post.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-white/40">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{post.readingMinutes} min read</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
