import type { LightContent } from '@/lib/i18n/types'

export function LightFaq({ content }: { content: LightContent }) {
  const { faq } = content
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{faq.h2}</h2>
      <div className="flex flex-col gap-3">
        {faq.items.map((it, i) => (
          <details
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-5 group"
          >
            <summary className="text-base font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between gap-3">
              <span>{it.q}</span>
              <span className="text-sky-600 text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
