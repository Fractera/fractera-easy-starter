import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { PartnerPageFlow } from '@/components/partner-page-flow'
import { PartnerPageFooter } from '@/components/partner-page-footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  return {
    title: `Partner ${slug} — Fractera`,
    alternates: { canonical: `https://partners.fractera.ai/${lang}/${slug}` },
  }
}

export default async function PartnerSlugPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: langParam, slug } = await params
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  // Partner pages live on the partners.fractera.ai subdomain only.
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
      links: {
        where: { forPage: true },
        orderBy: [{ sortOrder: 'asc' }, { isDefault: 'desc' }, { createdAt: 'asc' }],
        select: { id: true, providerName: true, affiliateUrl: true, isDefault: true },
      },
    },
  })

  if (!partner || partner.status !== 'active') {
    notFound()
  }

  return (
    <>
      <PartnerPageFlow
        lang={lang}
        partner={{
          slug: partner.slug,
          companyName: partner.companyName,
          companyEmail: partner.companyEmail,
          links: partner.links,
        }}
      />
      <PartnerPageFooter
        lang={lang}
        companyName={partner.companyName}
        companyEmail={partner.companyEmail}
      />
    </>
  )
}
