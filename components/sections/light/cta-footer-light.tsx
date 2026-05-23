import type { LightContent } from '@/lib/i18n/types'

export function LightCtaFooter({ content }: { content: LightContent }) {
  const { ctaFooter } = content
  return (
    <section className="bg-sky-600 text-white rounded-2xl p-8 md:p-12 flex flex-col gap-4 items-start">
      <p className="text-xs font-mono font-bold text-sky-100 uppercase tracking-widest">{ctaFooter.label}</p>
      <h2 className="font-serif font-bold text-2xl md:text-3xl lg:text-4xl leading-tight max-w-3xl">{ctaFooter.h2}</h2>
      <p className="text-base text-sky-50 max-w-2xl">{ctaFooter.description}</p>
      <a
        href="#deploy"
        className="mt-2 inline-flex items-center gap-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg"
      >
        {ctaFooter.cta}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </section>
  )
}
