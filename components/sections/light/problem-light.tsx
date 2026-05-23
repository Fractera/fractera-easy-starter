import { AlertCircle } from 'lucide-react'
import type { LightContent } from '@/lib/i18n/types'

export function LightProblem({ content }: { content: LightContent }) {
  const { problem } = content
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{problem.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
          {problem.h2}
        </h2>
        <p className="max-w-xl text-base text-slate-600">{problem.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problem.items.map((it, i) => (
          <div key={i} className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 leading-snug">{it.h3}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
