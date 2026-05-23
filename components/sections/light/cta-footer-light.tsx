import type { LightContent } from '@/lib/i18n/types'

export function LightCtaFooter({ content }: { content: LightContent }) {
  const { ctaFooter } = content
  return (
    <section className="bg-sky-600 text-white rounded-2xl p-8 md:p-12 flex flex-col gap-4 items-start">
      <h2 className="font-serif font-bold text-2xl md:text-3xl">{ctaFooter.h2}</h2>
      <p className="text-base text-sky-50 max-w-2xl">{ctaFooter.description}</p>
      <a
        href="#how-it-works"
        className="mt-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-6 py-3 rounded-xl text-base transition-colors shadow-lg"
      >
        {ctaFooter.cta} →
      </a>
    </section>
  )
}
