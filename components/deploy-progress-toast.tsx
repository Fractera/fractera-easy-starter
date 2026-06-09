'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

type ProgressToastStrings = {
  title: string
  dashboardNote: string
  checkboxLabel: string
  hideButton: string
  domainTipTitle: string
  domainTipBody: string
  domainButton: string
}

export function DeployProgressToast({
  progress,
  strings,
  onHide,
  domainUrl,
}: {
  progress: number
  strings: ProgressToastStrings
  onHide: () => void
  // Referral domain link (same one shown in the left deploy-options container).
  // When present, the toast surfaces a "buy a domain while you wait" block.
  domainUrl?: string
}) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Toast panel */}
      <div className="relative w-full max-w-md flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-violet-950 via-violet-900/60 to-black border border-violet-500/70 p-6 shadow-2xl shadow-violet-500/20">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-400 shrink-0 animate-spin" />
          <p className="text-lg font-bold text-violet-200 leading-snug">
            {strings.title}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-yellow-300 font-semibold">{progress}%</p>
        </div>

        {/* Dashboard note */}
        <p className="text-sm text-violet-200/70 leading-relaxed">
          {strings.dashboardNote}
        </p>

        {/* Make-good-use-of-the-wait: buy a domain. Only when a referral link
            is available (same link as the left deploy-options container). */}
        {domainUrl && (
          <div className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-sm font-semibold text-violet-200 leading-snug">
              {strings.domainTipTitle}
            </p>
            <p className="text-xs text-violet-200/70 leading-relaxed">
              {strings.domainTipBody}
            </p>
            <a
              href={domainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-violet-500"
            >
              {strings.domainButton}
            </a>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-violet-500/20" />

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-violet-400 cursor-pointer shrink-0"
          />
          <span className="text-sm text-white leading-snug font-medium">
            {strings.checkboxLabel}
          </span>
        </label>

        {/* Hide button */}
        <button
          type="button"
          onClick={onHide}
          disabled={!confirmed}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900/50 disabled:text-violet-700 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors disabled:cursor-not-allowed"
        >
          {strings.hideButton}
        </button>
      </div>
    </div>
  )
}
