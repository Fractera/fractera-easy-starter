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
]

export function PlatformSelector() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1 w-fit">
          MCP · AI Agents
        </span>
        <h3 className="text-lg font-bold text-white">Choose your AI assistant</h3>
        <p className="text-sm text-white/60 leading-relaxed max-w-xl">
          Use MCP to track installation progress, troubleshoot issues, and launch new servers directly from your AI agent — no terminal, no SSH required.
        </p>
      </div>
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
                      ? 'border-violet-500/60 bg-violet-500/10'
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
