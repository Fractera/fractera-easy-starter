'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles, Copy, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { getAskAi, CLAUDE_URL } from '@/lib/i18n/ask-ai'

// Floating "Ask the AI" widget — fixed bottom-right. Collapsed = a glowing
// amber Sparkles pill; on hover the label slides out to the LEFT (the pill is
// right-anchored, so growing width expands leftward). Click (collapsed or
// expanded) opens a centered modal that removes the "I don't know how to start"
// barrier: it explains the free MCP connector, copies a ready-made prompt, and
// links to Claude.ai. Strings via i18n (rule 4а).
export function AskAiWidget({ lang }: { lang: string }) {
  const t = getAskAi(lang)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Esc closes the modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Don't show on the embed widget (it's a standalone surface).
  if (pathname?.includes('/embed')) return null

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(t.promptText)
      setCopied(true)
      toast.success(t.copiedToast)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Copy failed — please select and copy the text manually.')
    }
  }

  return (
    <>
      {/* ── Floating button ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.bubble}
        className="cta-shimmer group fixed bottom-5 right-5 z-50 inline-flex items-center overflow-hidden rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-colors"
        style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 }}
      >
        <span aria-hidden className="cta-shimmer-sweep pointer-events-none absolute inset-0 z-0 rounded-full" />
        {/* label expands to the left on hover */}
        <span className="relative z-10 max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:max-w-[260px] group-hover:opacity-100">
          {t.bubble}
        </span>
        <Sparkles className="relative z-10 shrink-0" size={22} />
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-950 via-zinc-950 to-black p-6 shadow-2xl"
            style={{ boxShadow: '0 0 0 1px rgba(167,139,250,0.15), 0 20px 60px rgba(124,58,237,0.35), 0 0 80px rgba(251,191,36,0.10)' }}
          >
            {/* soft cosmic glow accents */}
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-amber-300">
                  <Sparkles size={20} />
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">{t.modalTitle}</h2>
              </div>

              <div className="flex flex-col gap-2.5 text-sm leading-relaxed text-white/75">
                {t.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-500"
                >
                  {copied ? <Check size={16} className="text-amber-300" /> : <Copy size={16} />}
                  {copied ? t.copiedButton : t.copyButton}
                </button>
                <a
                  href={CLAUDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.06]"
                >
                  {t.claudeButton}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
