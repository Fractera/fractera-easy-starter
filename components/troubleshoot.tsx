'use client'

import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Platform = {
  id: string
  name: string
  subscription: string
  url: string
}

const PLATFORMS: Platform[] = [
  { id: 'claude-code', name: 'Claude Code',  subscription: 'Anthropic Claude Pro/Max', url: 'https://claude.ai' },
  { id: 'codex',       name: 'Codex',        subscription: 'ChatGPT Plus/Pro',         url: 'https://chatgpt.com' },
  { id: 'gemini',      name: 'Gemini CLI',   subscription: 'Google AI Pro',            url: 'https://aistudio.google.com' },
  { id: 'qwen',        name: 'Qwen Code',    subscription: 'Qwen Cloud',               url: 'https://chat.qwen.ai' },
  { id: 'kimi',        name: 'Kimi Code',    subscription: 'Kimi Cloud',               url: 'https://kimi.com' },
  { id: 'open-code',   name: 'Open Code',    subscription: 'OpenRouter or local LLM',  url: 'https://openrouter.ai' },
]

export function Troubleshoot() {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="self-start text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2"
      >
        <span className={`inline-block transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>›</span>
        I have a problem
      </button>

      {open && (
        <div className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-400">
            Solve the problem with the help of AI:
          </p>
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLATFORMS.map(platform => (
                <Tooltip key={platform.id}>
                  <TooltipTrigger
                    disabled
                    className="bg-white/5 border border-white/10 rounded-lg p-4 text-left opacity-40 cursor-not-allowed flex flex-col gap-1 min-h-[88px] items-start"
                  >
                    <span className="text-sm font-semibold text-white">{platform.name}</span>
                    <span className="text-xs text-gray-500">{platform.subscription}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="!block max-w-72 text-sm leading-relaxed whitespace-normal w-72">
                    Use this service to resolve installation problems if you have a paid {platform.subscription} subscription. Coming soon.
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
