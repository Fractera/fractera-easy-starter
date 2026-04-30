'use client'

import { useState } from 'react'

export function CopyUrl({ url, label = 'MCP Server URL' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl">
      <p className="text-sm text-gray-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
        <code className="text-sm text-green-400 flex-1 break-all select-all">{url}</code>
        <button
          onClick={handleCopy}
          className="shrink-0 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
