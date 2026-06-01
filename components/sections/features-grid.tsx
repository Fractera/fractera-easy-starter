'use client'

import { Mic, ShieldCheck, Database, DatabaseBackup, GitBranch, Zap, ShoppingBag, Globe, Crosshair, Bot, Split, LayoutTemplate } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const ICONS = [Mic, ShieldCheck, Database, DatabaseBackup, GitBranch, Zap, ShoppingBag, Globe, Crosshair, Bot, Split, LayoutTemplate]

export function FeaturesGrid() {
  const content = useHeroContent()
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.featuresHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.featuresHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">{content.featuresHeader.description}</p>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-11">
        {content.featureList.map(({ title, description, badge, vip }, i) => {
          const Icon = ICONS[i]
          return (
            <li key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-[22px] h-[22px] shrink-0 ${vip ? 'text-yellow-400' : 'text-violet-400'}`} />
                <h3 className="text-lg font-medium leading-tight tracking-tight text-white">{title}</h3>
              </div>
              <span
                className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  vip
                    ? 'text-yellow-300 bg-yellow-500/15 border-yellow-500/40'
                    : 'text-violet-300 bg-violet-500/15 border-violet-500/30'
                }`}
              >
                {badge}
              </span>
              <p className="text-sm leading-snug text-white/50">{description}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
