import type { LightContent } from '@/lib/i18n/types'

export function LightAudience({ content }: { content: LightContent }) {
  const { audience } = content
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{audience.h2}</h2>
        <p className="text-base text-slate-600 max-w-3xl">{audience.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-emerald-300 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-base font-bold text-emerald-700">{audience.fitsLabel}</h3>
          <ul className="flex flex-col gap-2">
            {audience.fits.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                <span className="shrink-0 text-emerald-600 mt-0.5 font-bold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-500">{audience.notFitsLabel}</h3>
          <ul className="flex flex-col gap-2">
            {audience.notFits.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                <span className="shrink-0 text-slate-400 mt-0.5 font-bold">×</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
