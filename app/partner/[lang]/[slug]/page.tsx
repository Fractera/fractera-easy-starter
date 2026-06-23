import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
    // Partner mirrors are per-partner landing pages, not indexable site content
    // (mirrored by robots.ts disallow /partner). Treated like the admin zone.
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.fractera.ai/partner/${lang}/${slug}` },
  }
}

export default async function PartnerSlugPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: langParam, slug } = await params
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

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
        select: { id: true, providerName: true, affiliateUrl: true, isDefault: true, kind: true },
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
