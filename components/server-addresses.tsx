'use client'

import { buildUrls } from '@/lib/subdomain-helpers'

// 🔒 THE ADDRESS IS KNOWN BEFORE THE DEPLOY STARTS, so it is shown from the first
// second — this component is the whole point of that.
//
// In IP mode every URL is derived from the IP the customer just typed
// (`http://<ip>:3000` / `:3001` / `:3002`). Nothing about the install produces
// them, so making the customer wait ~15 minutes and an email to learn their own
// address was a choice, not a constraint. Previously `deploy-progress.tsx` even
// rendered a pulsing "Your site URL will appear here when ready" placeholder — a
// promise about the future, standing exactly where the answer could have been.
//
// `live` only changes the STYLING and the caption, never the addresses: they are
// identical before and after completion, which is the fact worth teaching the
// customer.

type AddressStrings = {
  pendingTitle: string
  pendingNote: string
  liveTitle: string
  siteLabel: string
  authLabel: string
  adminLabel: string
}

export function ServerAddresses({
  /** Either a bare IP, or any ServerToken.subdomain form (`ip-<IP>`, a real domain). */
  target,
  live,
  strings,
}: {
  target: string
  live: boolean
  strings: AddressStrings
}) {
  const t = target.trim()
  if (!t) return null
  const urls = buildUrls(t)
  // A half-typed IP ("109.199") classifies as a domain and would render nonsense
  // links like https://109.199 — so render nothing until the value is a real one.
  if (urls.mode === 'ip' && !urls.ip) return null

  const rows = [
    { href: urls.appUrl, label: urls.appLabel, note: strings.siteLabel },
    { href: urls.authUrl, label: urls.mode === 'ip' ? `${urls.ip}:3001` : `auth.${t}`, note: strings.authLabel },
    { href: urls.adminUrl, label: urls.adminLabel, note: strings.adminLabel },
  ]

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-4 transition-colors duration-700 ${
        live ? 'border-emerald-500/50 bg-emerald-500/[0.07]' : 'border-white/20 bg-white/[0.03]'
      }`}
    >
      <div className="flex items-center gap-2">
        {live ? (
          <span className="text-emerald-400 text-sm">✓</span>
        ) : (
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        )}
        <p
          className={`text-xs font-bold uppercase tracking-widest ${
            live ? 'text-emerald-400' : 'text-amber-300/90'
          }`}
        >
          {live ? strings.liveTitle : strings.pendingTitle}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map(({ href, label, note }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors ${
              live
                ? 'border-emerald-500/40 bg-white/[0.05] hover:border-emerald-400/60 hover:bg-white/[0.10]'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30'
            }`}
          >
            <span className="flex flex-col gap-0.5 min-w-0">
              {/* select-all so the customer can copy the address with one click,
                  which is the main thing they want from this block while waiting. */}
              <span
                className={`text-sm font-mono font-bold truncate select-all ${
                  live ? 'text-white' : 'text-white/70'
                }`}
              >
                {label}
              </span>
              <span className={`text-xs font-medium ${live ? 'text-white/70' : 'text-white/40'}`}>
                {note}
              </span>
            </span>
            <span
              className={`shrink-0 text-sm font-bold transition-colors ${
                live ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-white/30'
              }`}
            >
              ↗
            </span>
          </a>
        ))}
      </div>

      {!live && (
        <p className="text-xs text-white/45 leading-relaxed">{strings.pendingNote}</p>
      )}
    </div>
  )
}
