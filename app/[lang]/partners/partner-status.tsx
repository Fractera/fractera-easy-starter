'use client'

import { useSession } from 'next-auth/react'
import { PartnersCta, OpenCabinetButton } from './partners-cta'

// Client island for the "join vs active partner" block (step 130). Previously the
// page called auth() + db.partner server-side just to pick this block, which forced
// the whole /partners page to render dynamically. The session already carries
// partnerSlug (same field SiteHeader reads), so we decide on the client and the page
// stays static. Logged-out / non-partner visitors see the join CTA; partners see
// their active card.
type PartnerStatusStrings = {
  activeBadge: string
  activeTitle: string
  activeIdLabel: string
  activeBody: string
  activeButton: string
  activeNote: string
  joinTitle: string
  joinBody: string
  joinButton: string
  joinNote: string
}

export function PartnerStatusSection({ lang, t }: { lang: string; t: PartnerStatusStrings }) {
  const { data: session } = useSession()
  const partnerSlug = session?.user?.partnerSlug

  if (partnerSlug) {
    return (
      <div className="flex flex-col gap-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black/60 p-8 items-start">
        <span className="self-start text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest border border-emerald-500/40 bg-emerald-500/[0.08] px-3 py-1 rounded-full">
          {t.activeBadge}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.activeTitle}</h2>
        <div className="w-full flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-black/40 p-5">
          <p className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">{t.activeIdLabel}</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-white tracking-wide select-all">{partnerSlug}</p>
        </div>
        <p className="text-base text-white/70 leading-relaxed max-w-2xl">{t.activeBody}</p>
        <OpenCabinetButton label={t.activeButton} />
        <p className="text-sm text-white/50">{t.activeNote}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-black/60 p-8 items-start">
      <h2 className="text-2xl md:text-3xl font-bold font-serif text-white">{t.joinTitle}</h2>
      <p className="text-base text-white/70 leading-relaxed max-w-2xl">{t.joinBody}</p>
      <PartnersCta lang={lang} label={t.joinButton} />
      <p className="text-sm text-white/50">{t.joinNote}</p>
    </div>
  )
}
