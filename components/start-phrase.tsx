'use client'

import { useState, useEffect } from 'react'

const PHRASES: Record<string, string> = {
  ru: 'установи fractera',
  es: 'instala fractera',
  fr: 'installe fractera',
  de: 'installiere fractera',
  pt: 'instala o fractera',
  it: 'installa fractera',
  zh: '安装 fractera',
  ja: 'fractera をインストール',
  ko: 'fractera 설치해줘',
}

function getPhrase(): string {
  if (typeof navigator === 'undefined') return 'install fractera'
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  return PHRASES[lang] ?? 'install fractera'
}

export function StartPhrase() {
  const [phrase, setPhrase] = useState('install fractera')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPhrase(getPhrase())
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
