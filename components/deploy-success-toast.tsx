'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

type SuccessToastStrings = {
  title: string
  siteLabel: string
  adminLabel: string
  dashboardNote: string
  checkboxLabel: string
  closeButton: string
}

export function DeploySuccessToast({
  subdomain,
  strings,
  onClose,
}: {
  subdomain: string
  strings: SuccessToastStrings
  onClose: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)

  const siteUrl = `https://${subdomain}`
  const isPathBased = subdomain?.startsWith('light-') || subdomain?.startsWith('main-')
  const adminUrl = isPathBased ? `https://${subdomain}/admin` : `https://admin.${subdomain}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop — non-interactive, just visual */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Toast panel */}
      <div className="relative w-full max-w-md flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900/60 to-black border border-emerald-500/70 p-6 shadow-2xl shadow-emerald-500/20">

        {/* Header */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-lg font-bold text-emerald-300 leading-snug">
            {strings.title}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group bg-white/[0.05] hover:bg-white/[0.10] border border-emerald-500/40 hover:border-emerald-400/60 rounded-xl px-4 py-3 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                {strings.siteLabel}
              </span>
              <span className="text-sm text-white font-mono font-bold">{subdomain}</span>
            </div>
            <span className="text-emerald-400 group-hover:text-emerald-300 text-base font-bold transition-colors">↗</span>
          </a>

          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group bg-white/[0.05] hover:bg-white/[0.10] border border-emerald-500/40 hover:border-emerald-400/60 rounded-xl px-4 py-3 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                {strings.adminLabel}
              </span>
              <span className="text-sm text-white font-mono font-bold">{isPathBased ? `${subdomain}/admin` : `admin.${subdomain}`}</span>
            </div>
            <span className="text-emerald-400 group-hover:text-emerald-300 text-base font-bold transition-colors">↗</span>
          </a>
        </div>

        {/* Dashboard note */}
        <p className="text-sm text-emerald-200/70 leading-relaxed">
          {strings.dashboardNote}
        </p>

        {/* Divider */}
        <div className="h-px bg-emerald-500/20" />

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-emerald-400 cursor-pointer shrink-0"
          />
          <span className="text-sm text-white leading-snug font-medium">
            {strings.checkboxLabel}
          </span>
        </label>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={!confirmed}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 disabled:text-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-base transition-colors disabled:cursor-not-allowed"
        >
          {strings.closeButton}
        </button>
      </div>
    </div>
  )
}
