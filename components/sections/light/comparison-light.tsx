import type { LightContent } from '@/lib/i18n/types'

export function LightComparison({ content }: { content: LightContent }) {
  const { comparison } = content
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{comparison.h2}</h2>
      <p className="text-base text-slate-600 max-w-3xl">{comparison.description}</p>
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-5">
        <p className="text-sm text-slate-500 italic">{comparison.note}</p>
      </div>
    </section>
  )
}
