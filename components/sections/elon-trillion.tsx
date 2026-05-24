'use client'

import { useHeroContent } from '@/lib/i18n/context'

export function ElonTrillion() {
  const content = useHeroContent()
  const t = content.elonTrillion

  return (
    <div id="elon-trillion" className="w-full max-w-4xl mx-auto flex flex-col gap-10 scroll-mt-24">

      {/* Top — badge + h2 + description */}
      <div className="flex flex-col gap-4 items-start text-left md:items-center md:text-center">
        <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest border border-violet-500/40 bg-violet-500/[0.06] px-3 py-1 rounded-full">
          {t.label}
        </span>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {t.h2}
        </h2>
        <p className="max-w-2xl text-base md:text-lg text-white/75 leading-relaxed">
          {t.description}
        </p>
      </div>

      {/* 16:9 image — YouTube screenshot */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-neutral-900 to-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Ilon_mask.png"
          alt={`${t.author} — ${t.source}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Citation form — testimonial-style: quote SVG above + gradient quote + avatar-left/text-right */}
      <div className="w-full flex flex-col items-center">
        <div className="h-[68px] w-full relative flex items-center justify-center mb-10">
          <div className="absolute left-1/2 top-0 -ml-2.5 -mt-7 -translate-x-1/2">
            <div className="mb-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/blockquote-violet.svg" alt="Quote" width={96} height={96} className="w-24 h-24" />
            </div>
          </div>
        </div>

        <figure className="max-w-[840px] lg:max-w-[720px]">
          <blockquote className="text-center">
            <p
              className="text-center text-[24px] leading-snug tracking-tight lg:text-xl md:text-lg bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0.9) 25%, #a78bfa 50%, rgba(167,139,250,0.9) 75%, rgba(167,139,250,0.2) 100%)',
              }}
            >
              {t.quote}
            </p>
          </blockquote>

          <figcaption className="mt-6 flex flex-col items-center gap-5">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Ilon_mask_logo.jpg" alt={`${t.author} photo`} width={30} height={30} className="mr-2.5 rounded-full" />
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
          </figcaption>
        </figure>
      </div>

    </div>
  )
}
