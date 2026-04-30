'use client'

import { useState } from 'react'

export function CopyUrl({ url, label = 'MCP Server URL', disabled = false }: { url: string; label?: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (disabled) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex flex-col gap-2 w-full max-w-xl transition-opacity duration-500 ${disabled ? 'opacity-30' : ''}`}>
      <p className="text-sm text-gray-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
        <code className="text-sm text-gray-500 flex-1 break-all">{url}</code>
        <button
          onClick={handleCopy}
          disabled={disabled}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            disabled
              ? 'text-gray-700 border-white/5 cursor-not-allowed'
              : 'text-gray-400 hover:text-white border-white/10 hover:border-white/30 cursor-pointer'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
