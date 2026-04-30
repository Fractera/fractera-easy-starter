'use client'

import { useState, useEffect } from 'react'

type DomainState = 'empty' | 'installing' | 'ready'

type StoredDomain = {
  domain: string
  status: 'installing' | 'ready'
}

function getStored(): StoredDomain | null {
  try {
    const raw = localStorage.getItem('fractera_domain')
    if (!raw) return null
    return JSON.parse(raw) as StoredDomain
  } catch {
    return null
  }
}

export function DomainStatus({ onStatusChange }: { onStatusChange?: (ready: boolean) => void } = {}) {
  const [state, setState] = useState<DomainState>('empty')
  const [domain, setDomain] = useState('')
  const [copied, setCopied] = useState(false)
  const [pulse, setPulse] = useState(false)

  function updateState(next: DomainState, d?: string) {
    setState(next)
    if (d) setDomain(d)
    onStatusChange?.(next === 'ready')
  }

  useEffect(() => {
    const stored = getStored()
    if (!stored) return
    setDomain(stored.domain)
    setState(stored.status)
    onStatusChange?.(stored.status === 'ready')
  }, [])

  useEffect(() => {
    if (state !== 'installing') return
    const interval = setInterval(() => setPulse(p => !p), 1500)
    return () => clearInterval(interval)
  }, [state])

  function handleCopy() {
    if (state !== 'ready') return
    navigator.clipboard.writeText(`https://${domain}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isEmpty = state === 'empty'
  const isInstalling = state === 'installing'
  const isReady = state === 'ready'

  const borderStyle = isReady
    ? { borderColor: 'rgba(74,222,128,0.4)' }
    : isInstalling
    ? { borderColor: pulse ? 'rgba(251,146,60,0.7)' : 'rgba(234,179,8,0.4)' }
    : { borderColor: 'rgba(255,255,255,0.1)' }

  const textColor = isReady
    ? 'text-green-400'
    : isInstalling
    ? pulse ? 'text-orange-400' : 'text-yellow-500'
    : 'text-gray-600'

  function simulate(next: DomainState) {
    if (next === 'empty') {
      localStorage.removeItem('fractera_domain')
      updateState('empty')
      setDomain('')
    } else {
      const stored: StoredDomain = { domain: 'happy-fox-42.fractera.ai', status: next }
      localStorage.setItem('fractera_domain', JSON.stringify(stored))
      updateState(next, stored.domain)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl">
      <p className="text-sm text-gray-500 uppercase tracking-widest">Your Domain</p>
      <div
        className="flex items-center gap-3 bg-white/5 rounded-xl px-5 py-3 border transition-all duration-[1500ms]"
        style={borderStyle}
      >
        <code className={`text-sm flex-1 break-all transition-colors duration-[1500ms] ${textColor}`}>
          {isEmpty ? 'your domain will appear here' : domain}
        </code>
        <button
          onClick={handleCopy}
          disabled={!isReady}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            isReady
              ? 'text-gray-400 hover:text-white border-white/10 hover:border-white/30 cursor-pointer'
              : 'text-gray-700 border-white/5 cursor-not-allowed'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {isInstalling && (
        <p
          className="text-xs text-yellow-600 transition-opacity duration-[1500ms]"
          style={{ opacity: pulse ? 1 : 0.4 }}
        >
          Installation in progress — please wait...
        </p>
      )}

      {/* DEV: state switcher — remove before launch */}
      <div className="flex gap-2 mt-1">
        {(['empty', 'installing', 'ready'] as DomainState[]).map((s) => (
          <button
            key={s}
            onClick={() => simulate(s)}
            className="w-4 h-4 rounded-sm border border-white/20 transition-colors"
            style={{ background: state === s ? 'white' : 'transparent' }}
          />
        ))}
      </div>
    </div>
  )
}
