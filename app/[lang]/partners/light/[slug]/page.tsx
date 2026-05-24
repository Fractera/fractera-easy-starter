import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { LightPricingFlow } from '@/components/sections/light/pricing-flow-light'
import { PartnerPageFooter } from '@/components/partner-page-footer'
import { getLight } from '@/lib/i18n/locales'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  return {
    title: `Partner ${slug} — Fractera Light`,
    alternates: { canonical: `https://partners.fractera.ai/${lang}/light/${slug}` },
  }
}

// Light variant of the partner-hosted deploy page. Lives only on
// partners.fractera.ai/<lang>/light/<slug> — same host gate as the
// regular partner page, same whitelist-protected affiliate link
// surface (forPage=true links), Light deploy funnel.
export default async function PartnerLightSlugPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: langParam, slug } = await params
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  const headerStore = await headers()
  const host = (headerStore.get('host') ?? '').toLowerCase()
  if (!host.endsWith('partners.fractera.ai')) {
    notFound()
  }

  const partner = await db.partner.findUnique({
    where: { slug },
    select: {
      slug: true,
      status: true,
      companyName: true,
      companyEmail: true,
    },
  })

  if (!partner || partner.status !== 'active') {
    notFound()
  }

  const content = getLight(lang)

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900">
      <main className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <LightPricingFlow content={content} />
      </main>
      <PartnerPageFooter
        lang={lang}
        companyName={partner.companyName}
        companyEmail={partner.companyEmail}
      />
    </div>
  )
}
