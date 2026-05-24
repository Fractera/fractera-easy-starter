'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useHeroContent } from '@/lib/i18n/context'

export function LightPitch() {
  const content = useHeroContent()
  const pathname = usePathname() ?? ''
  const lang = pathname.split('/')[1] || 'en'
  const t = content.lightPitch

  return (
    <div id="light-pitch" className="w-full max-w-4xl flex flex-col gap-6 rounded-2xl border border-white/15 bg-white/[0.02] p-6 md:p-8 scroll-mt-24">
      <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest border border-violet-500/40 bg-violet-500/[0.06] px-3 py-1 rounded-full self-start">
        {t.label}
      </span>
      <h2 className="font-serif font-bold leading-tight text-white text-2xl md:text-3xl">
        {t.h2}
      </h2>
      <p className="text-sm md:text-base text-white/75 leading-relaxed max-w-3xl">
        {t.body}
      </p>
      <Link
        href={`/${lang}/light`}
        className="inline-flex items-center gap-2 self-start bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-violet-500/30"
      >
        {t.cta} →
      </Link>
    </div>
  )
}
