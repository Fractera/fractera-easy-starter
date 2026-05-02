'use client'

import { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function InfoTooltip({ text }: { text: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={() => setOpen(true)}
            aria-label="Show details"
            className="w-5 h-5 rounded-full border border-orange-500/60 text-orange-400 hover:text-orange-300 hover:border-orange-400 transition-colors text-xs font-bold inline-flex items-center justify-center shrink-0 ml-2 mt-1.5 cursor-pointer touch-manipulation"
          >
            ?
          </TooltipTrigger>
          <TooltipContent side="right" className="!block max-w-72 text-sm leading-relaxed whitespace-normal w-72 max-md:hidden">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-sm w-full bg-neutral-900 border border-orange-500/40 rounded-xl p-5 text-sm leading-relaxed text-gray-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-2 right-2 w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 inline-flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>
            <div className="pr-8">{text}</div>
          </div>
        </div>
      )}
    </>
  )
}
