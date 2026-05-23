import { Server, Terminal, GitBranch, GitMerge, Sparkles, Settings, Search, Save } from 'lucide-react'
import type { LightContent } from '@/lib/i18n/types'

const STEP_ICONS = [Server, Terminal, GitBranch, GitMerge, Sparkles, Settings, Search, Save]

export function LightHowItWorks({ content }: { content: LightContent }) {
  const { howItWorks } = content
  return (
    <section id="how-it-works" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{howItWorks.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
          {howItWorks.h2}
        </h2>
        <p className="max-w-xl text-base text-slate-600">{howItWorks.description}</p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {howItWorks.steps.map((s, i) => {
          const Icon = STEP_ICONS[i] ?? Sparkles
          return (
            <li key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {i + 1}
                </span>
                <Icon className="w-5 h-5 text-sky-600 shrink-0" />
              </div>
              <div className="h-px w-10 bg-sky-500" />
              <h3 className="text-base font-bold text-slate-900 leading-snug">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
