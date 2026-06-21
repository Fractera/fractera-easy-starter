import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo/alternates'
import { AUTHOR, AUTHOR_SAME_AS } from '@/lib/author'
import { StandardContentPage } from '@/components/content-page/standard-content-page'
import { getDeploymentsLocal, deploymentsLocalMeta } from '@/lib/pages/deployments-local'
import { getDeploymentsUi } from '@/lib/deployments/ui'

const SUB_PATH = deploymentsLocalMeta.subPath // '/deployments/local'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const c = getDeploymentsLocal(lang)
  return {
    title: `${c.seoTitle} | Fractera`,
    description: c.description,
    keywords: c.keywords,
    alternates: buildAlternates(lang, SUB_PATH),
    openGraph: {
      type: 'article',
      url: `https://www.fractera.ai/${lang}${SUB_PATH}`,
      siteName: 'Fractera',
      title: c.seoTitle,
      description: c.description,
      images: [{ url: deploymentsLocalMeta.ogImage, width: 1200, height: 630, alt: c.title }],
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

  const url = `https://www.fractera.ai/${lang}${SUB_PATH}`
  const ogImageUrl = `https://www.fractera.ai${deploymentsLocalMeta.ogImage}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: c.title,
      description: c.description,
      inLanguage: lang,
      author: {
        '@type': 'Person',
        '@id': AUTHOR.id,
        name: AUTHOR.name,
        url: AUTHOR.url,
        sameAs: AUTHOR_SAME_AS,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fractera, Inc.',
        url: 'https://www.fractera.ai',
        logo: { '@type': 'ImageObject', url: 'https://www.fractera.ai/fractera-logo.jpg' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      keywords: c.keywords,
      image: ogImageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fractera', item: 'https://www.fractera.ai/' },
        { '@type': 'ListItem', position: 2, name: ui.breadcrumb, item: `https://www.fractera.ai/${lang}/deployments` },
        { '@type': 'ListItem', position: 3, name: c.title, item: url },
      ],
    },
    ...(c.faq && c.faq.length > 0
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: c.faq.map(f => ({
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
      <StandardContentPage
        lang={lang}
        breadcrumbs={[
          { label: 'Fractera', href: `/${lang}` },
          { label: ui.breadcrumb, href: `/${lang}/deployments` },
          { label: c.title },
        ]}
        tags={[...deploymentsLocalMeta.tags]}
        title={c.title}
        subtitle={c.subtitle}
        heroImage={deploymentsLocalMeta.heroImage}
        heroAlt={c.title}
        blocks={c.blocks}
        faq={c.faq}
        backHref={`/${lang}/deployments`}
        backLabel={ui.backToHub}
      />
    </>
  )
}
