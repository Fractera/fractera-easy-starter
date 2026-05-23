'use client'

import { useState } from 'react'
import type { LightContent } from '@/lib/i18n/types'

export function LightFaq({ content }: { content: LightContent }) {
  const { faq } = content
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-serif font-bold text-slate-900 text-2xl md:text-3xl">{faq.h2}</h2>

      <div className="flex flex-col rounded-2xl border border-slate-300 overflow-hidden divide-y divide-slate-200 bg-white">
        {faq.items.map((item, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-lg font-semibold text-slate-900 leading-snug">{item.q}</span>
              <span
                className={`shrink-0 text-sky-700 mt-0.5 transition-transform duration-200 select-none ${
                  open === i ? 'rotate-180' : ''
                }`}
              >
                ▾
              </span>
            </button>

            {open === i && (
              <div className="px-5 pb-5 flex flex-col gap-3">
                {item.a.map((para, pi) => (
                  <p key={pi} className="text-[15px] text-slate-700 leading-relaxed">
                    {para}
                  </p>
                ))}
                {item.steps && (
                  <ol className="flex flex-col gap-2 mt-1">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-xs font-bold text-sky-700 mt-0.5">
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                {item.bullets && (
                  <ul className="flex flex-col gap-2.5 mt-1">
                    {item.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-3 text-base leading-relaxed">
                        <span className="shrink-0 text-sky-600 mt-0.5 font-bold">✓</span>
                        <span className="text-[15px] text-slate-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.trail?.map((para, pi) => (
                  <p
                    key={pi}
                    className={`text-[15px] leading-relaxed ${
                      pi === item.trail!.length - 1 ? 'text-sky-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
