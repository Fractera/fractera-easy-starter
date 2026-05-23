import type { LightContent } from '@/lib/i18n/types'

export function LightHero({ content }: { content: LightContent }) {
  const { hero, benefitsHeader, benefits } = content
  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 text-left">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">Fractera Light</p>
        <h1 className="font-serif font-bold leading-tight text-slate-900 text-3xl md:text-4xl lg:text-5xl">
          {hero.h1}
        </h1>
        <p className="text-base md:text-lg text-slate-700 max-w-3xl">{hero.description}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="#deploy"
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors shadow-lg shadow-sky-500/30"
          >
            {hero.ctaPrimary} →
          </a>
          <a
            href="#deploy"
            className="border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-6 py-3 rounded-xl text-base transition-colors"
          >
            {hero.ctaSecondary}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-6 pt-8 border-t border-slate-200">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{benefitsHeader.h2}</h2>
          <p className="text-base text-slate-600">{benefitsHeader.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-2">
              <h3 className="text-base font-bold text-slate-900">{b.h3}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
