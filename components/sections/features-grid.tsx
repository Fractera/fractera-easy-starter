'use client'

import { Mic, ShieldCheck, Database, GitBranch, Zap, ShoppingBag, Globe, Crosshair, Bot } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

const ICONS = [Mic, ShieldCheck, Database, GitBranch, Zap, ShoppingBag, Globe, Crosshair, Bot]

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
        {content.featureList.map(({ title, description }, i) => {
          const Icon = ICONS[i]
          return (
            <li key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon className="w-[22px] h-[22px] shrink-0 text-violet-400" />
                <h3 className="text-lg font-medium leading-tight tracking-tight text-white">{title}</h3>
              </div>
              <p className="text-sm leading-snug text-white/50">{description}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
