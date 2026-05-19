import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { HomeContent } from '@/components/home-content'
import { getContent } from '@/lib/i18n/content'

function buildFaqSchema(lang: string) {
  const content = getContent(lang)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: [
          ...item.a,
          ...(item.bullets ?? []),
          ...(item.steps ?? []),
          ...(item.trail ?? []),
        ].join(' '),
      },
    })),
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  const session = await auth()
  if (session?.user?.email === 'admin@fractera.ai') {
    redirect('/admin')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(lang)) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <HomeContent lang={lang} />
        </div>
      </main>
    </>
  )
}
