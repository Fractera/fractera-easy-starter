import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { BRAND } from '@/lib/brand'
import { getFrameworkUi } from '../_data'
import { frameworkList } from '../_lib/post'
import { POSTS } from '../_list.generated'

// Entry for the /framework router page (the catalog where a visitor picks a
// framework). Standard router shape: page.tsx is thin and re-exports this. The
// framework list is auto-discovered — POSTS comes from _list.generated.ts (built by
// lib/parser-fs from the co-located framework folders under this directory);
// frameworkList localizes + orders it. Adding a framework folder adds a row here
// automatically; there is no hand-maintained list. Per the router canon (Режим C)
// the catalog's data is this generated list; the localized chrome strings are data →
// they live in ./_data (en.ts + ru.ts + index.ts getFrameworkUi, rule 4а), while
// functions/logic live in ./_lib. Everything the /framework subtree needs lives
// under the subtree (_lib = functions, _data = data, _components = view) — delete the
// folder and nothing is orphaned in the project root. Mirror of /deployments.

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const ui = getFrameworkUi(lang)
  return {
    title: ui.metaTitle,
    description: ui.metaDescription,
    alternates: buildAlternates(lang, '/framework'),
  }
}

export default async function FrameworkCatalogIndex({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const ui = getFrameworkUi(lang)
  const frameworks = frameworkList(POSTS, lang)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND.name, item: `${BRAND.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: ui.breadcrumb, item: `${BRAND.siteUrl}/${lang}/framework` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20 md:py-14">
          <header className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-violet-400/70">{ui.eyebrow}</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-3xl">{ui.indexTitle}</h1>
            <p className="max-w-2xl text-base text-white/50">{ui.indexIntro}</p>
          </header>

          {/* Flat vertical list of frameworks — same architecture as the deployments
              hub / news index. Every listed framework is a live, co-located page. Each
              row carries the framework's brand icon on the left, rendered large (~2×
              the header/grid mark) to suit the big catalog card. Icon resolution
              mirrors the header: Fractera Pro → favicon, a known mark → its svg,
              otherwise a letter chip (Hono, Reflex). */}
          <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {frameworks.map(f => (
              <li key={f.slug}>
                <a
                  href={`/${lang}${f.href}`}
                  className="group flex items-center gap-5 py-5 transition-colors hover:bg-white/[0.02]"
                >
                  <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center">
                    {f.name === 'Fractera Pro' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/favicon-32x32.png" alt="" width={56} height={56} loading="lazy" className="h-full w-full rounded-md object-contain" />
                    ) : f.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/framework-icons/${f.icon}.svg`} alt="" width={56} height={56} loading="lazy" className="h-full w-full object-contain" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-2xl font-bold text-violet-300">
                        {f.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-semibold leading-snug text-white group-hover:text-violet-300">
                      {f.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-white/50">{f.description}</p>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
