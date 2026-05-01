'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-5 h-5 rounded-full border border-orange-500/60 text-orange-400 hover:text-orange-300 hover:border-orange-400 transition-colors text-xs font-bold inline-flex items-center justify-center shrink-0 ml-2 mt-1.5">
          ?
        </TooltipTrigger>
        <TooltipContent side="right" className="!block max-w-72 text-sm leading-relaxed whitespace-normal w-72">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
