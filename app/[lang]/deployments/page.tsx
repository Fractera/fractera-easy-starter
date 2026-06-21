import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { BRAND } from '@/lib/brand'
import { getDeploymentsUi } from '@/lib/deployments/ui'
import { deploymentList } from '@/lib/deployments/post'
import { POSTS } from './_list.generated'

// Deployments hub — the index where a visitor picks a deployment target. The list
// is auto-discovered: POSTS comes from _list.generated.ts (built by lib/parser-fs
// from the co-located target folders under this directory); deploymentList
// localizes + orders it. Adding a target folder adds a row here automatically;
// there is no hand-maintained list (which is what dropped the dead Fractera Pro
// row — there is no folder for it).

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const ui = getDeploymentsUi(lang)
  return {
    title: ui.metaTitle,
    description: ui.metaDescription,
    alternates: buildAlternates(lang, '/deployments'),
  }
}

export default async function DeploymentsHubPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const ui = getDeploymentsUi(lang)
  const targets = deploymentList(POSTS, lang)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND.name, item: `${BRAND.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: ui.breadcrumb, item: `${BRAND.siteUrl}/${lang}/deployments` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20 md:py-14">
          <header className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-violet-400/70">{ui.eyebrow}</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-3xl">{ui.indexTitle}</h1>
            <p className="max-w-2xl text-base text-white/50">{ui.indexIntro}</p>
          </header>

          {/* Flat vertical list of deployment targets — same architecture as the
              news index. Every listed target is a live, co-located page. */}
          <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {targets.map(t => (
              <li key={t.slug}>
                <a
                  href={`/${lang}${t.href}`}
                  className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-white/[0.02]"
                >
                  <h2 className="text-lg font-semibold leading-snug text-white group-hover:text-violet-300">
                    {t.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/50">{t.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
