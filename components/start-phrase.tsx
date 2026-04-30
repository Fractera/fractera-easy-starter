'use client'

import { useState, useEffect } from 'react'

const LOCALE_DATA: Record<string, { display: string; copy: string }> = {
  ru: { display: 'установи fractera, отвечай на русском языке', copy: 'установи fractera, отвечай на русском языке' },
  es: { display: 'instala fractera, responde en español', copy: 'instala fractera, responde en español' },
  fr: { display: 'installe fractera, réponds en français', copy: 'installe fractera, réponds en français' },
  de: { display: 'installiere fractera, antworte auf Deutsch', copy: 'installiere fractera, antworte auf Deutsch' },
  pt: { display: 'instala o fractera, responde em português', copy: 'instala o fractera, responde em português' },
  it: { display: 'installa fractera, rispondi in italiano', copy: 'installa fractera, rispondi in italiano' },
  zh: { display: '安装 fractera，请用中文回复', copy: '安装 fractera，请用中文回复' },
  ja: { display: 'fractera をインストール、日本語で答えて', copy: 'fractera をインストール、日本語で答えて' },
  ko: { display: 'fractera 설치해줘, 한국어로 답해줘', copy: 'fractera 설치해줘, 한국어로 답해줘' },
}

const DEFAULT = { display: 'install fractera', copy: 'install fractera' }

function getLocale() {
  if (typeof navigator === 'undefined') return DEFAULT
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  return LOCALE_DATA[lang] ?? DEFAULT
}

export function StartPhrase() {
  const [locale, setLocale] = useState(DEFAULT)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLocale(getLocale())
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(locale.copy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl">
      <p className="text-sm text-gray-500 uppercase tracking-widest">Start phrase for Claude</p>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
        <code className="text-sm text-green-400 flex-1 break-all select-all">{locale.display}</code>
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
