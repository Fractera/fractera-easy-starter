'use client'

import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ClaudeCodeSetup } from '@/components/claude-code-setup'

type Platform = {
  id: string
  name: string
  subscription: string
}

const PLATFORMS: Platform[] = [
  { id: 'claude-code', name: 'Claude Code',  subscription: 'Anthropic Claude Pro/Max' },
  { id: 'codex',       name: 'Codex',        subscription: 'ChatGPT Plus/Pro'         },
  { id: 'gemini',      name: 'Gemini CLI',   subscription: 'Google AI Pro'            },
  { id: 'qwen',        name: 'Qwen Code',    subscription: 'Qwen Cloud'               },
  { id: 'kimi',        name: 'Kimi Code',    subscription: 'Kimi Cloud'               },
  { id: 'open-code',   name: 'Open Code',    subscription: 'OpenRouter or local LLM'  },
]

export function PlatformSelector() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 w-full">
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLATFORMS.map(platform => {
            const isActive = platform.id === 'claude-code'
            const isSelected = selected === platform.id

            if (isActive) {
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelected(s => s === platform.id ? null : platform.id)}
                  className={`bg-white/5 border rounded-lg p-4 text-left flex flex-col gap-1 min-h-[88px] items-start transition-colors ${
                    isSelected
                      ? 'border-orange-500/60 bg-orange-500/10'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-sm font-semibold text-white">{platform.name}</span>
                  <span className="text-xs text-gray-500">{platform.subscription}</span>
                </button>
              )
            }

            return (
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
            )
          })}
        </div>
      </TooltipProvider>

      {selected === 'claude-code' && (
        <div className="mt-2">
          <ClaudeCodeSetup />
        </div>
      )}
    </div>
  )
}
