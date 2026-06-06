import { db } from '@/lib/db'
import { EmbedFlow } from '@/components/embed-flow'

export const dynamic = 'force-dynamic'

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang: langParam } = await params
  const { ref } = await searchParams
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  let partnerSlug: string | null = null
  let providerName: string | null = null
  let affiliateUrl: string | null = null
  let domainProviderName: string | null = null
  let domainAffiliateUrl: string | null = null

  if (ref) {
    const partner = await db.partner.findUnique({
      where: { slug: ref },
      select: {
        slug: true,
        status: true,
        // Default widget link of each kind (default is scoped per kind).
        links: { where: { isDefault: true, forWidget: true }, select: { providerName: true, affiliateUrl: true, kind: true } },
      },
    })
    if (partner && partner.status === 'active') {
      partnerSlug = partner.slug
      const serverLink = partner.links.find(l => l.kind !== 'domain') ?? null
      const domainLink = partner.links.find(l => l.kind === 'domain') ?? null
      providerName = serverLink?.providerName ?? null
      affiliateUrl = serverLink?.affiliateUrl ?? null
      domainProviderName = domainLink?.providerName ?? null
      domainAffiliateUrl = domainLink?.affiliateUrl ?? null
    }
  }

  return (
    <EmbedFlow
      lang={lang}
      partnerSlug={partnerSlug}
      providerName={providerName}
      affiliateUrl={affiliateUrl}
      domainProviderName={domainProviderName}
      domainAffiliateUrl={domainAffiliateUrl}
    />
  )
}
