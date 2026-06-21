import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { getDeploymentsUi } from '@/lib/deployments/ui'

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

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: ui.breadcrumb, item: `https://www.fractera.ai/${lang}/deployments` },
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
              news index. Only /deployments/local is live today; the others render
              as non-link "soon" rows until their pages ship in later sub-steps. */}
          <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {ui.options.map(opt =>
              opt.ready ? (
                <li key={opt.href}>
                  <a
                    href={`/${lang}${opt.href}`}
                    className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-white/[0.02]"
                  >
                    <h2 className="text-lg font-semibold leading-snug text-white group-hover:text-violet-300">
                      {opt.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-white/50">{opt.description}</p>
                  </a>
                </li>
              ) : (
                <li key={opt.href} className="flex flex-col gap-1.5 py-5 opacity-60">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold leading-snug text-white/70">{opt.title}</h2>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-300/70 border border-violet-500/30 rounded-full px-2 py-0.5">
                      {ui.soon}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/40">{opt.description}</p>
                </li>
              ),
            )}
          </ul>
        </div>
      </main>
    </>
  )
}
