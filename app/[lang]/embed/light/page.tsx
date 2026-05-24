import { db } from '@/lib/db'
import { LightPricingFlow } from '@/components/sections/light/pricing-flow-light'
import { getLight } from '@/lib/i18n/locales'

export const dynamic = 'force-dynamic'

// Light variant of the partner-embeddable deploy iframe.
// Partners drop <iframe src="fractera.ai/<lang>/embed/light?ref=<slug>">
// on their blogs / sites. We look up the partner by ref for future
// referral attribution (not wired into /api/install/light yet — TODO).
export default async function EmbedLightPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang: langParam } = await params
  const { ref } = await searchParams
  const lang: 'en' | 'ru' = langParam === 'ru' ? 'ru' : 'en'

  if (ref) {
    await db.partner.findUnique({ where: { slug: ref }, select: { slug: true, status: true } })
  }

  const content = getLight(lang)

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-5xl mx-auto">
        <LightPricingFlow content={content} />
      </div>
    </div>
  )
}
