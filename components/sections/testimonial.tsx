'use client'

import { useHeroContent } from '@/lib/i18n/context'

export function FractеraTestimonial() {
  const content = useHeroContent()
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <div className="h-[68px] w-full relative flex items-center justify-center mb-10">
        <div className="absolute left-1/2 top-0 -ml-2.5 -mt-7 -translate-x-1/2">
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/blockquote-violet.svg" alt="Quote" width={96} height={96} className="w-24 h-24" />
          </div>
        </div>
      </div>

      <figure className="max-w-[840px] lg:max-w-[620px]">
        <blockquote className="text-center">
          <p
            className="text-center text-[28px] leading-snug tracking-tighter lg:text-2xl md:text-xl bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0.9) 25%, #a78bfa 50%, rgba(167,139,250,0.9) 75%, rgba(167,139,250,0.2) 100%)',
            }}
          >
            Be so involved they can&apos;t tell if you&apos;re crazy or a genius.
          </p>
        </blockquote>

        <figcaption className="mt-5 flex flex-col items-center gap-6">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/roma_armstrong.jpg" alt="Roma Armstrong photo" width={30} height={30} className="mr-2.5 rounded-full" />
            <span className="text-lg font-light leading-tight tracking-tight text-gray-400 lg:text-base md:text-sm">
              Roma Armstrong
              <cite className="ml-1.5 not-italic text-gray-500 before:mr-1.5 before:inline-flex before:h-px before:w-4 before:bg-gray-500 before:align-middle">
                Founder at Fractera.ai
              </cite>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white/60 hover:text-white hover:border-white/40 transition-colors">
              {content.testimonial.blogButton}
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white/60 hover:text-white hover:border-white/40 transition-colors">
              {content.testimonial.casesButton}
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-violet-500/40 bg-violet-500/[0.06] text-sm font-medium text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60 transition-colors">
              {content.testimonial.marketplaceButton}
            </a>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}
