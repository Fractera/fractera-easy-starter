import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { getAllArticles } from '@/lib/news/articles'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return {
    title: 'News | Fractera',
    description:
      'Fractera news — every update to the project in chronological order: new framework starters, AI-workspace features, agent skills and MCP tools. Each update is embedded into the LightRAG vector knowledge base the moment it ships, so the whole changelog is fully AI-searchable from inside your workspace.',
    alternates: buildAlternates(lang, '/news'),
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

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const news = getAllArticles()

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: 'News', item: `https://www.fractera.ai/${lang}/news` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20 md:py-14">
          <header className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-violet-400/70">Fractera news</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-3xl">News</h1>
            <p className="max-w-2xl text-base text-white/50">
              Every current update to the project, in chronological order — new framework starters,
              AI-workspace features, agent skills and MCP tools. Each update is saved into the
              vector knowledge base at the same time it ships, which means the whole history is
              fully searchable with AI from inside your workspace.
            </p>
          </header>

          {/* Flat vertical list — date + title + summary, no images, no columns.
              Same architecture as the documentation index. */}
          <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {news.map(item => (
              <li key={item.title}>
                <a
                  href={`/${lang}/news/${item.slug}`}
                  className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{item.readingMinutes} min read</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug text-white group-hover:text-violet-300">
                    {item.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/50">{item.summary}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
