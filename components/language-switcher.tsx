'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Languages, Search, X } from 'lucide-react'
import {
  getAvailableLanguages,
  DEFAULT_LANGUAGE,
  SINGLE_LANG_MODE,
} from '@/config/translations/translations.config'

export function LanguageSwitcher() {
  if (SINGLE_LANG_MODE) return null

  return <LanguageSwitcherInner />
}

function LanguageSwitcherInner() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const allLanguages = useMemo(() => getAvailableLanguages(), [])

  const currentLang = useMemo(() => {
    const seg = pathname.split('/').filter(Boolean)[0]
    return allLanguages.find(l => l.code === seg) ? seg : DEFAULT_LANGUAGE
  }, [pathname, allLanguages])

  const currentMeta = allLanguages.find(l => l.code === currentLang)

  const filtered = useMemo(() => {
    if (!filter) return allLanguages
    const q = filter.toLowerCase()
    return allLanguages.filter(
      l => l.nativeName.toLowerCase().startsWith(q) || l.englishName.toLowerCase().startsWith(q)
    )
  }, [allLanguages, filter])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setFilter('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function switchLang(code: string) {
    if (code === currentLang) { setOpen(false); return }
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === currentLang) segments.shift()
    router.replace(`/${code}${segments.length ? '/' + segments.join('/') : ''}`)
    setOpen(false)
    setFilter('')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-violet-500/60 text-white/80 hover:text-white hover:border-violet-400 hover:bg-violet-500/10 transition-all"
        title={currentMeta?.englishName ?? 'Switch language'}
      >
        <Languages size={14} />
        <span className="font-semibold uppercase tracking-wider text-xs">{currentLang}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-64 rounded-lg border border-white/10 bg-[#111] shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="relative p-2 border-b border-white/10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input
              autoFocus
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search language…"
              className="w-full bg-white/5 text-white text-sm rounded-md pl-8 pr-7 py-1.5 outline-none placeholder:text-white/30 focus:ring-1 focus:ring-violet-500"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-white/40">No languages found</p>
            ) : (
              filtered.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => switchLang(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left
                    ${lang.code === currentLang
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-white/80 hover:bg-white/8 hover:text-white'
                    }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="ml-auto text-xs text-white/30 uppercase">{lang.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
