'use client'

import { useHeroContent } from '@/lib/i18n/context'

export function ElonTrillion() {
  const content = useHeroContent()
  const t = content.elonTrillion

  return (
    <div id="elon-trillion" className="w-full max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">

      {/* Top — badge + h2 + description */}
      <div className="flex flex-col gap-4 items-start text-left md:items-center md:text-center">
        <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest border border-violet-500/40 bg-violet-500/[0.06] px-3 py-1 rounded-full">
          {t.label}
        </span>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {t.h2}
        </h2>
        <p className="max-w-2xl text-base md:text-lg text-white/75 leading-relaxed">
          {t.quote}
        </p>
      </div>

      {/* 16:9 image — YouTube screenshot placeholder */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-neutral-900 to-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/elon-trillion-thumb.jpg"
          alt={`${t.author} — ${t.source}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom — citation form (photo + author + source + watch button) */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/elon-musk.jpg" alt={`${t.author} photo`} width={30} height={30} className="mr-2.5 rounded-full" />
          <span className="text-lg font-light leading-tight tracking-tight text-gray-400 lg:text-base md:text-sm">
            {t.author}
            <cite className="ml-1.5 not-italic text-gray-500 before:mr-1.5 before:inline-flex before:h-px before:w-4 before:bg-gray-500 before:align-middle">
              {t.source}
            </cite>
          </span>
        </div>

        <a
          href={t.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-violet-500/40 bg-violet-500/[0.06] text-sm font-medium text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60 transition-colors"
        >
          {t.watchButton} →
        </a>
      </div>

    </div>
  )
}
