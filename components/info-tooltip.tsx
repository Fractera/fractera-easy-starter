'use client'

import { useState } from 'react'

export function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-start">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-5 h-5 rounded-full border border-orange-500/60 text-orange-400 hover:text-orange-300 hover:border-orange-400 transition-colors text-xs font-bold leading-none flex items-center justify-center shrink-0 mt-1.5"
        aria-label="More information"
      >
        ?
      </button>
      {visible && (
        <span className="absolute left-7 top-0 z-20 w-72 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-gray-400 leading-relaxed shadow-xl">
          {text}
        </span>
      )}
    </span>
  )
}
