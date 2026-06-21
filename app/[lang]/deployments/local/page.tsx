import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildAlternates } from '@/lib/seo/alternates'
import { getContent } from '@/lib/i18n/content'
import { ContentProvider } from '@/components/content-provider'
import { SponsorshipSection } from '@/components/sections/sponsorship-section'
import { LocalAgentEngineeringSection } from '@/components/sections/local-agent-engineering'
import { getDeploymentsLocal, deploymentsLocalMeta } from '@/lib/pages/deployments-local'
import { getDeploymentsUi } from '@/lib/deployments/ui'

const SUB_PATH = deploymentsLocalMeta.subPath // '/deployments/local'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const c = getDeploymentsLocal(lang)
  return {
    title: `${c.seoTitle ?? c.title} | Fractera`,
    description: c.description,
    keywords: c.keywords,
    alternates: buildAlternates(lang, SUB_PATH),
    openGraph: {
      type: 'website',
      url: `https://www.fractera.ai/${lang}${SUB_PATH}`,
      siteName: 'Fractera',
      title: c.seoTitle ?? c.title,
      description: c.description,
      images: [{ url: deploymentsLocalMeta.ogImage, width: 1200, height: 630, alt: c.imageAlt }],
    },
  }
}

export default async function DeploymentsLocalPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const c = getDeploymentsLocal(lang)
  const ui = getDeploymentsUi(lang)
  // The inquiry drawer is bilingual (en/ru); other languages fall back to its en
  // labels. Plain cast — no language comparison (rule 4а ESLint guard).
  const drawerLang = lang as 'en' | 'ru'

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
      { '@type': 'ListItem', position: 2, name: ui.breadcrumb, item: `https://www.fractera.ai/${lang}/deployments` },
      { '@type': 'ListItem', position: 3, name: c.title, item: `https://www.fractera.ai/${lang}${SUB_PATH}` },
    ],
  }

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: c.title,
    description: c.description,
    image: `https://www.fractera.ai${deploymentsLocalMeta.ogImage}`,
    brand: { '@type': 'Brand', name: 'Fractera' },
    category: 'Local Agent Engineering Appliance',
  }

  const faqSchema = c.faq && c.faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: c.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-16 px-6 py-20 md:py-14">
          {/* H1 — the keymap title; the section below opens with the value headline as H2 */}
          <header className="w-full max-w-4xl flex flex-col gap-3 items-start text-left md:items-center md:text-center">
            <p className="text-xs uppercase tracking-widest text-violet-400/70">{ui.eyebrow}</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-white">{c.title}</h1>
          </header>

          <ContentProvider value={getContent(lang)}>
            <Suspense fallback={null}>
              <LocalAgentEngineeringSection content={c} lang={drawerLang} />
            </Suspense>
            <Suspense fallback={null}>
              <SponsorshipSection />
            </Suspense>
          </ContentProvider>
        </div>
      </main>
    </>
  )
}
