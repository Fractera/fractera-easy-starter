import { getContent } from '@/lib/i18n/content'

import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return { alternates: buildAlternates(lang, '/skills') }
}

export default async function SkillsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { lang } = await params
  const { id } = await searchParams
  const c = getContent(lang).marketplace
  const m = c.skills

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: m.h1, item: `https://www.fractera.ai/${lang}/skills` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight">{m.h1}</h1>
            <p className="max-w-2xl text-base text-white/50">{m.intro}</p>
            {id && <p className="text-xs text-white/30">{c.linkedNote}</p>}
          </div>

          <div className="border border-white/10 rounded-2xl p-12 text-center flex flex-col gap-3">
            <p className="text-white/40 text-base">{m.comingSoon}</p>
            <p className="text-white/20 text-sm">{m.comingSoonNote}</p>
          </div>
        </div>
      </main>
    </>
  )
}
