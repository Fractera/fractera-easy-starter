'use client'

import { useState, useEffect } from 'react'

const PHRASES: Record<string, string> = {
  ru: 'Используй MCP Fractera, отвечай на русском языке',
  es: 'Usa MCP Fractera, respóndeme en español',
  fr: 'Utilise MCP Fractera, réponds-moi en français',
  de: 'Nutze MCP Fractera, antworte mir auf Deutsch',
  pt: 'Usa o MCP Fractera, responde-me em português',
  it: 'Usa MCP Fractera, rispondimi in italiano',
  zh: '使用 MCP Fractera，用中文回复我',
  ja: 'MCP Fractera を使って、日本語で答えて',
  ko: 'MCP Fractera를 사용해서 한국어로 답해줘',
}

const DEFAULT = 'Use MCP Fractera, reply in English'

export function StartPhrase() {
  const [phrase, setPhrase] = useState(DEFAULT)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const lang = navigator.language?.slice(0, 2).toLowerCase()
    setPhrase(PHRASES[lang] ?? DEFAULT)
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(phrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl">
      <p className="text-sm text-gray-500 uppercase tracking-widest">Start phrase for Claude</p>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
        <code className="text-sm text-green-400 flex-1 break-all select-all">{phrase}</code>
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
