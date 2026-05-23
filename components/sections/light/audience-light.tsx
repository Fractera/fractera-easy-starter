import { CheckCircle2, XCircle } from 'lucide-react'
import type { LightContent } from '@/lib/i18n/types'

export function LightAudience({ content }: { content: LightContent }) {
  const { audience } = content
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{audience.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
          {audience.h2}
        </h2>
        <p className="max-w-xl text-base text-slate-600">{audience.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-emerald-300 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-base font-bold text-emerald-700">{audience.fitsLabel}</h3>
          </div>
          <div className="h-px w-10 bg-emerald-500" />
          <ul className="flex flex-col gap-2 mt-1">
            {audience.fits.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                <span className="shrink-0 text-emerald-600 mt-0.5 font-bold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <h3 className="text-base font-bold text-slate-500">{audience.notFitsLabel}</h3>
          </div>
          <div className="h-px w-10 bg-slate-300" />
          <ul className="flex flex-col gap-2 mt-1">
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
