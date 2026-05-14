'use client'

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
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">MCP · AI Agents</p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          Deploy and Manage Your Server with an AI Agent via MCP
        </h2>
        <p className="max-w-xl text-base text-white/60">
          Building and managing a production server through an AI agent inside your chat has never been this seamless.
          Connect Claude, Codex, or Gemini to the Fractera MCP server — deploy infrastructure, monitor installation,
          and launch new environments without leaving your conversation.
        </p>
      </div>

      {/* 6-col grid: first 3 cards col-span-2 (33%), last 2 col-span-3 (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {PLATFORMS.map((platform, index) => {
          const colSpan = index >= 3 ? 'md:col-span-3' : 'md:col-span-2'
          return (
            <button
              key={platform.id}
              type="button"
              style={CARD_STYLE}
              className={`${colSpan} rounded-lg p-4 text-left flex flex-col gap-1 min-h-[88px] items-start cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-violet-950/50 hover:via-violet-900/20 hover:to-transparent`}
            >
              <span className="text-sm font-semibold text-white">{platform.name}</span>
              <span className="text-xs text-gray-500">{platform.subscription}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
