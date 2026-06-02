'use client'

import { useHeroContent } from '@/lib/i18n/context'

// RU-блок «Импортозамещение» — занимает слот бывшей Elon-секции в русском потоке.
// Якорит продакшн-периметр под 152-ФЗ (сервер/данные/домен/сертификат — в РФ).
// Рендерится только когда `importSubstitution` задан в локали (RU); иначе null.
export function ImportSubstitution() {
  const t = useHeroContent().importSubstitution
  if (!t) return null

  return (
    <div id="import-substitution" className="w-full max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {t.points.map((p, i) => (
          <div key={i} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 flex flex-col gap-2">
            <h3 className="text-base font-bold text-white leading-snug">{p.title}</h3>
            <p className="text-sm text-white/65 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
