import type { LightContent } from '@/lib/i18n/types'

export function LightHowItWorks({ content }: { content: LightContent }) {
  const { howItWorks } = content
  return (
    <section id="how-it-works" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{howItWorks.h2}</h2>
        <p className="text-base text-slate-600 max-w-3xl">{howItWorks.description}</p>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {howItWorks.steps.map((s, i) => (
          <li key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
            <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm">
              {i + 1}
            </span>
            <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
