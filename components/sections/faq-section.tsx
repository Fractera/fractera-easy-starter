'use client'

import { useState } from 'react'
import { useHeroContent } from '@/lib/i18n/context'

export function FaqSection() {
  const content = useHeroContent()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.faqHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.faqHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">{content.faqHeader.description}</p>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/40 overflow-hidden divide-y divide-white/20">
        {content.faqItems.map((item, i) => (
          <div key={i} className="bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-lg font-semibold text-white leading-snug">{item.q}</span>
              <span className={`shrink-0 text-white mt-0.5 transition-transform duration-200 select-none ${open === i ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {/* Панель всегда в DOM (SSR для краулеров): сворачиваем CSS grid-rows
                0fr↔1fr с overflow-hidden, а не condition-mount — иначе ответ не
                попадает в начальный HTML и робот не прочитает его без клика. */}
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              aria-hidden={open !== i}
            >
              <div className="overflow-hidden">
              <div className="px-5 pb-5 flex flex-col gap-3">
                {item.a.map((para, pi) => (
                  <p key={pi} className="text-[15px] text-white leading-relaxed">{para}</p>
                ))}
                {item.steps && (
                  <ol className="flex flex-col gap-2 mt-1">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex items-start gap-3 text-[15px] text-white leading-relaxed">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-white/[0.08] border border-white/40 flex items-center justify-center text-xs font-bold text-white mt-0.5">{si + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                {item.bullets && (
                  <ul className="flex flex-col gap-2.5 mt-1">
                    {item.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-3 text-base leading-relaxed">
                        <span className="shrink-0 text-violet-400 mt-0.5 font-bold">✓</span>
                        <span className="text-[15px] text-white">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.trail?.map((para, pi) => (
                  <p key={pi} className={`text-[15px] leading-relaxed ${pi === item.trail!.length - 1 ? 'text-violet-400 font-semibold' : 'text-white'}`}>{para}</p>
                ))}
                {item.cta && (
                  <a
                    href={item.cta.href}
                    className="self-start mt-2 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {item.cta.label} →
                  </a>
                )}
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
