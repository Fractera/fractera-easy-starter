import type { Metadata } from 'next'
import { getRegionalPartners } from '@/lib/i18n/regional-partners'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const t = getRegionalPartners(lang)
  return {
    title: `${t.title} — Fractera`,
    description: t.intro,
    alternates: {
      canonical: `https://www.fractera.ai/${lang}/regional-partners`,
      languages: {
        en: 'https://www.fractera.ai/en/regional-partners',
        ru: 'https://www.fractera.ai/ru/regional-partners',
        'x-default': 'https://www.fractera.ai/en/regional-partners',
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function RegionalPartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = getRegionalPartners(lang)
  const mailto = `mailto:${t.applyEmail}?subject=${encodeURIComponent(t.emailSubject)}`

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-10">

        <header className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold">{t.badge}</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-base text-white/70 leading-relaxed">{t.intro}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.requirementsTitle}</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-base text-white/70 leading-relaxed">
            {t.requirements.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.offerTitle}</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-base text-white/70 leading-relaxed">
            {t.offer.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.dutiesTitle}</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-base text-white/70 leading-relaxed">
            {t.duties.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t.regionTitle}</h2>
          <p className="text-base text-white/70 leading-relaxed">{t.region}</p>
        </section>

        <section className="flex flex-col gap-4 border-t border-white/15 pt-8">
          <h2 className="text-lg font-semibold">{t.applyTitle}</h2>
          <p className="text-base text-white/70 leading-relaxed">{t.apply}</p>
          <p className="text-base text-white/90 font-medium">{t.applySubject}</p>
          <a
            href={mailto}
            className="self-start inline-flex items-center gap-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/40 hover:border-white/60 px-6 py-3 text-base font-bold transition-colors"
          >
            {t.ctaButton} — {t.applyEmail}
          </a>
        </section>

      </div>
    </main>
  )
}
