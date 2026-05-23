import type { LightContent } from '@/lib/i18n/types'

export function LightProblem({ content }: { content: LightContent }) {
  const { problem } = content
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{problem.h2}</h2>
        <p className="text-base text-slate-600 max-w-3xl">{problem.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problem.items.map((it, i) => (
          <div key={i} className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-2xl p-5 flex flex-col gap-2">
            <h3 className="text-base font-bold text-slate-900">{it.h3}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
