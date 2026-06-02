'use client'

import { useState } from 'react'
import { AlertCircle, Lightbulb } from 'lucide-react'
import { useHeroContent } from '@/lib/i18n/context'

export function ProblemSection() {
  const content = useHeroContent()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  function handleSelect(index: number) {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => { setActiveIndex(index); setIsAnimating(false) }, 400)
  }

  const active = content.problemItems[activeIndex]

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{content.problemHeader.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.problemHeader.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60 leading-relaxed">{content.problemHeader.description}</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-6 items-start">
        <ul className="flex w-full flex-col gap-y-1 md:w-[220px] md:shrink-0">
          {content.problemItems.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(index)}
                className={[
                  'w-full border-l-[3px] py-2.5 pl-3.5 text-left text-base font-medium leading-snug transition-all duration-200',
                  index === activeIndex
                    ? 'border-violet-500 text-white cursor-default'
                    : 'border-transparent text-white/40 hover:text-white/80',
                ].join(' ')}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="relative w-full grow overflow-hidden rounded-[14px] bg-gray-900 p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-violet-400 shrink-0" />
            <h3 className="text-base font-semibold text-white">{content.problemLabel}</h3>
          </div>
          <div className="relative overflow-hidden min-h-[72px]">
            <p className={['text-[15px] leading-relaxed text-white/80 transition-all duration-[400ms] ease-in-out', isAnimating ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'].join(' ')}>
              {active.problem}
            </p>
          </div>

          <span className="my-4 block h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-violet-400 shrink-0" />
            <h3 className="text-base font-semibold text-white">{content.solutionLabel}</h3>
          </div>
          <div className="relative overflow-hidden min-h-[72px]">
            <p className={['text-[15px] leading-relaxed text-white/80 transition-all duration-[400ms] ease-in-out', isAnimating ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'].join(' ')}>
              {active.solution}
            </p>
          </div>

          <span className="pointer-events-none absolute -bottom-14 -left-32 h-[83px] w-[155px] rounded-full bg-violet-400/20 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-40 -left-20 h-[293px] w-[175px] -rotate-45 rounded-full bg-gradient-to-b from-violet-400/30 to-transparent opacity-40 blur-2xl" />
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10" />
        </div>
      </div>

      {/* SSR-краулабельный блок: вкладки выше показывают по одному пункту через JS,
          здесь весь problem/solution каждого пункта лежит в начальном HTML, чтобы
          робот прочитал их без клика. Заголовки — <strong>, не <h*> (иерархия). */}
      <div className="sr-only">
        {content.problemItems.map((item) => (
          <div key={`seo-${item.id}`}>
            <p><strong>{item.title}</strong></p>
            <p>{content.problemLabel}: {item.problem}</p>
            <p>{content.solutionLabel}: {item.solution}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
