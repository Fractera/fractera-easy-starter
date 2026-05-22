'use client'

import { useState } from 'react'
import { useHeroContent } from '@/lib/i18n/context'

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

const CARD_STYLE: React.CSSProperties = {
  animation: 'shimmerBorder 3s ease-in-out infinite',
  border: '1px solid rgba(139,92,246,0.7)',
}

export function PlatformSelector() {
  const content = useHeroContent()
  const mcp = content.mcpSection
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(mcp.serverUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be blocked — user can still triple-click and copy */
    }
  }

  return (
    <div id="mcp-section" className="flex flex-col gap-6 w-full scroll-mt-16">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">{mcp.label}</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {mcp.h2}
        </h2>
        <p className="max-w-xl text-base text-white/60">
          {mcp.description}
        </p>
      </div>

      {/* 6-col grid: first 3 cards col-span-2 (33%), last 2 col-span-3 (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {PLATFORMS.map((platform, index) => {
          const colSpan = index >= 3 ? 'md:col-span-3' : 'md:col-span-2'
          return (
            <div
              key={platform.id}
              style={CARD_STYLE}
              className={`${colSpan} rounded-lg p-4 text-left flex flex-col gap-1 min-h-[88px] items-start transition-all duration-300 bg-gradient-to-br from-violet-950/30 via-violet-900/10 to-transparent`}
            >
              <span className="text-sm font-semibold text-white">{platform.name}</span>
              <span className="text-xs text-gray-500">{platform.subscription}</span>
            </div>
          )
        })}
      </div>

      {/* MCP server URL — copyable */}
      <div className="flex flex-col gap-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4 md:p-5">
        <p className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{mcp.serverUrlLabel}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm md:text-base font-mono text-violet-100 bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 break-all select-all">
            {mcp.serverUrl}
          </code>
          <button
            type="button"
            onClick={copyUrl}
            className="shrink-0 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            {copied ? mcp.copied : mcp.copy}
          </button>
        </div>
        <p className="text-xs md:text-sm text-amber-300/85 leading-relaxed mt-1">{mcp.helpHint}</p>
      </div>
    </div>
  )
}
