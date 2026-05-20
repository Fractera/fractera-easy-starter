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

  if (ref) {
    const partner = await db.partner.findUnique({
      where: { slug: ref },
      select: {
        slug: true,
        status: true,
        links: { where: { isDefault: true }, select: { providerName: true, affiliateUrl: true }, take: 1 },
      },
    })
    if (partner && partner.status === 'active') {
      partnerSlug = partner.slug
      providerName = partner.links[0]?.providerName ?? null
      affiliateUrl = partner.links[0]?.affiliateUrl ?? null
    }
  }

  return (
    <EmbedFlow
      lang={lang}
      partnerSlug={partnerSlug}
      providerName={providerName}
      affiliateUrl={affiliateUrl}
    />
  )
}
