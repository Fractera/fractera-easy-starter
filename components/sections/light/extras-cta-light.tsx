import { ArrowUpRight, Bot } from 'lucide-react'
import type { LightContent } from '@/lib/i18n/types'

export function LightExtrasCta({ content }: { content: LightContent }) {
  const { extrasCta } = content
  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-mono font-bold text-violet-600 uppercase tracking-widest">{extrasCta.label}</p>
      <div className="bg-gradient-to-br from-violet-50 via-white to-sky-50 border border-violet-200 rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-serif font-bold text-slate-900 text-xl md:text-2xl leading-tight">{extrasCta.h2}</h2>
            <p className="text-sm text-slate-600 max-w-2xl">{extrasCta.description}</p>
          </div>
        </div>
        <a
          href={extrasCta.href}
          className="shrink-0 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/30"
        >
          {extrasCta.cta}
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  )
}
