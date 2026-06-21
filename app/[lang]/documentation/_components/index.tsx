import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { BRAND } from '@/lib/brand'
import { docList } from '@/lib/documentation/post'
import { POSTS } from '../_list.generated'

// Entry for the /documentation router page. Standard router shape: page.tsx is
// thin and re-exports this. The doc list is auto-discovered: POSTS comes from
// _list.generated.ts (built by lib/parser-fs from the co-located doc folders).

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return {
    title: 'Documentation | Fractera',
    description:
      'Fractera documentation — concise, readable guides to the platform’s features: the AI consultant, MCP tools, agentic UX and the self-hosted AI workspace. For depth, query the LightRAG memory via the Hermes admin flow.',
    alternates: buildAlternates(lang, '/documentation'),
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

export default async function DocumentationIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const docs = docList(POSTS)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND.name, item: `${BRAND.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Documentation', item: `${BRAND.siteUrl}/${lang}/documentation` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20 md:py-14">
          <header className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-violet-400/70">Fractera documentation</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-3xl">Documentation</h1>
            <p className="max-w-2xl text-base text-white/50">
              Concise, readable guides to the platform’s features. Each page introduces the basic ideas; for the
              full architecture, query the LightRAG memory through the Hermes admin flow.
            </p>
          </header>

          {/* Flat vertical list — date + title + summary, no images, no columns. */}
          <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {docs.map(doc => (
              <li key={doc.slug}>
                <a
                  href={`/${lang}/documentation/${doc.slug}`}
                  className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <time dateTime={doc.date}>{formatDate(doc.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{doc.readingMinutes} min read</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug text-white group-hover:text-violet-300">
                    {doc.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/50">{doc.summary}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
