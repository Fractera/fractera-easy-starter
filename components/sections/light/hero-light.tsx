import { Cpu, GitBranch, ShieldCheck, Database, Globe, LayoutDashboard } from 'lucide-react'
import type { LightContent } from '@/lib/i18n/types'

const BENEFIT_ICONS = [Cpu, GitBranch, ShieldCheck, Database, Globe, LayoutDashboard]

export function LightHero({ content }: { content: LightContent }) {
  const { hero, benefitsHeader, benefits } = content
  return (
    <section className="flex flex-col gap-14">
      <div className="flex flex-col gap-5 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-300 bg-sky-100 self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
          <span className="text-xs font-semibold text-sky-700 uppercase tracking-[0.15em]">{hero.badge}</span>
        </div>
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{hero.eyebrow}</p>
        <h1 className="font-serif font-bold leading-tight text-slate-900 text-3xl md:text-4xl lg:text-5xl">
          {hero.h1}
        </h1>
        <p className="text-base md:text-lg text-slate-700 leading-relaxed">{hero.description}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="#deploy"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-sky-500/30"
          >
            {hero.ctaPrimary}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold px-6 py-3.5 rounded-xl text-base transition-colors"
          >
            {hero.ctaSecondary}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{benefitsHeader.label}</p>
          <h2 className="font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl max-w-3xl">{benefitsHeader.h2}</h2>
          <p className="text-base text-slate-600 max-w-2xl">{benefitsHeader.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
          {benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i]
            return (
              <div key={i} className="flex flex-col gap-2 items-start text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5 shrink-0 text-sky-600" />
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{b.h3}</h3>
                </div>
                <div className="h-px w-12 bg-sky-500" />
                <p className="text-[14px] text-slate-600 leading-relaxed mt-2">{b.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
