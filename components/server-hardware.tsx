'use client'

import { useState } from 'react'
import type { ServerHardware } from '@/lib/kv'

// 🔒 ЖЕЛЕЗО НАЗЫВАЕТСЯ ДО РАБОТЫ, А НЕ ПОСЛЕ ОТКАЗА.
//
// ✗ 2026-08-23: установка умерла на 33% с кодом 137 — ядро убило `npm install` на
// машине с гигабайтом памяти. Человек прождал минуты и получил обрыв, из которого
// невозможно понять, что ему просто не хватило места. Установщик знал это в первую
// секунду и молчал.
//
// 🔒 КАРТОЧКА СТОИТ НА МЕСТЕ АДРЕСОВ, А НЕ РЯДОМ. Внимание в этот момент одно, и
// адреса ещё не нужны — до них минуты. Закрыл предупреждение — под ним адреса,
// которые никуда не делись: это одно место, показывающее по очереди две вещи, а
// не два блока, соревнующихся за взгляд.
//
// 🔒 МЫ НЕ ОТКАЗЫВАЕМСЯ СТАВИТЬ. Установка идёт в любом случае: сервер чужой, и
// решать за человека, что ему покупать, мы не вправе. Наше дело — сказать правду
// заранее, включая ту её часть, где мы можем не справиться.

type HardwareStrings = {
  warnTitle: string
  okTitle: string
  cores: string
  ram: string
  disk: string
  warnBody: string
  okBody: string
  close: string
}

/** Порог, при котором мы предупреждаем. Ниже — работать будет, но у предела. */
export const RECOMMENDED = { cores: 4, ramGb: 6 }

export function ServerHardwareCard({
  hardware,
  strings,
  onDismiss,
}: {
  hardware: ServerHardware
  strings: HardwareStrings
  onDismiss: () => void
}) {
  const [closing, setClosing] = useState(false)
  const warn = hardware.warn
  const ramGb = hardware.ramMb > 0 ? (hardware.ramMb / 1024).toFixed(1) : '?'

  function dismiss() {
    setClosing(true)
    // Короткая задержка ради затухания: мгновенная подмена блока читается как сбой.
    setTimeout(onDismiss, 200)
  }

  const rows = [
    { label: strings.cores, value: String(hardware.cores || '?'), bad: hardware.cores < RECOMMENDED.cores },
    { label: strings.ram, value: `${ramGb} GB`, bad: hardware.ramMb < RECOMMENDED.ramGb * 1000 },
    { label: strings.disk, value: hardware.diskGb > 0 ? `${hardware.diskGb} GB` : '?', bad: false },
  ]

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-opacity duration-200 ${
        closing ? 'opacity-0' : 'opacity-100'
      } ${warn ? 'border-amber-500/50 bg-amber-500/[0.07]' : 'border-white/20 bg-white/[0.03]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-sm shrink-0 ${warn ? 'text-amber-400' : 'text-white/50'}`}>
            {warn ? '⚠' : '✓'}
          </span>
          <p
            className={`text-xs font-bold uppercase tracking-widest ${
              warn ? 'text-amber-300' : 'text-white/60'
            }`}
          >
            {warn ? strings.warnTitle : strings.okTitle}
          </p>
        </div>
        {/* Закрыть можно всегда: предупреждение, которое нельзя убрать, читается
            как ошибка и мешает смотреть на адреса, ради которых человек здесь. */}
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          {strings.close}
        </button>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {rows.map(({ label, value, bad }) => (
          <span key={label} className="flex items-baseline gap-1.5">
            <span className="text-xs text-white/45">{label}</span>
            <span
              className={`text-sm font-mono font-bold ${bad ? 'text-amber-300' : 'text-white/85'}`}
            >
              {value}
            </span>
          </span>
        ))}
      </div>

      {hardware.os && <p className="text-xs text-white/35 font-mono truncate">{hardware.os}</p>}

      <p className={`text-xs leading-relaxed ${warn ? 'text-amber-200/80' : 'text-white/45'}`}>
        {warn ? strings.warnBody : strings.okBody}
      </p>
    </div>
  )
}
