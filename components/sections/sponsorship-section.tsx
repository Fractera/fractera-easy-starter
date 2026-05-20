'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useHeroContent } from '@/lib/i18n/context'
import { useAuthModal, useCheckout } from '@/components/providers'

type TierId = 's1' | 's5' | 's20'

export function SponsorshipSection() {
  const content = useHeroContent()
  const { data: session } = useSession()
  const { openModal } = useAuthModal()
  const { openSponsorCheckout } = useCheckout()
  const searchParams = useSearchParams()
  const router = useRouter()
  const justSponsored = searchParams.get('sponsor') === 'thanks'

  const [hovered, setHovered] = useState<TierId | null>(null)

  function handleClick(tier: TierId) {
    if (!session) {
      openModal()
      return
    }
    openSponsorCheckout(tier)
  }

  if (justSponsored) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-950/40 via-amber-900/20 to-black/60 p-8 md:p-10 text-center">
        <div className="flex justify-center">
          <span className="text-4xl" role="img" aria-label="thanks">💛</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
          {content.sponsorship.thankYouTitle}
        </h2>
        <p className="text-base text-white/80">{content.sponsorship.thankYouBody}</p>
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="text-sm font-semibold text-white border border-white/40 hover:border-white/60 hover:bg-white/[0.06] px-5 py-2 rounded-lg transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="sponsorship" className="w-full max-w-4xl flex flex-col gap-8 scroll-mt-20">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <p className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
          {content.sponsorship.label}
        </p>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {content.sponsorship.h2}
        </h2>
        <div className="max-w-2xl flex flex-col gap-2">
          {content.sponsorship.body.map((line, i) => (
            <p key={i} className="text-base text-white/70 leading-relaxed">{line}</p>
          ))}
        </div>
      </div>

      {/* ─── Tier cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {content.sponsorship.tiers.map(tier => {
          const isPopular = !!tier.badge
          const isHovered = hovered === tier.id
          return (
            <div
              key={tier.id}
              onMouseEnter={() => setHovered(tier.id)}
              onMouseLeave={() => setHovered(null)}
              className={`relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-200 ${
                isPopular
                  ? 'bg-gradient-to-br from-yellow-950/50 via-amber-900/20 to-black/60 border-yellow-500/50'
                  : 'bg-gradient-to-br from-neutral-900/60 to-black/60 border-white/15 hover:border-yellow-500/40'
              } border ${isHovered && !isPopular ? 'transform -translate-y-0.5' : ''}`}
              style={isPopular ? { boxShadow: '0 0 24px -8px rgba(250, 204, 21, 0.25)' } : {}}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-yellow-300 bg-yellow-500/15 px-3 py-1 rounded-full border border-yellow-500/50 uppercase tracking-widest whitespace-nowrap">
                  {tier.badge}
                </span>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white tracking-tight">{tier.amount}</span>
                  <span className="text-sm text-white/60 font-medium">{tier.period}</span>
                </div>
                <p className="text-sm text-white/70 leading-snug">{tier.sublabel}</p>
              </div>

              <button
                type="button"
                onClick={() => handleClick(tier.id)}
                className={`w-full font-bold px-5 py-3 rounded-xl text-sm transition-colors mt-auto ${
                  isPopular
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/30 hover:border-white/50'
                }`}
              >
                {content.sponsorship.sponsorButton
                  .replace('{amount}', tier.amount)
                  .replace('{period}', tier.period)}
              </button>
            </div>
          )
        })}
      </div>

      {!session && (
        <p className="text-sm text-white/50 text-center -mt-2">
          {content.sponsorship.signInPrompt}
        </p>
      )}

      {/* ─── Perks ─── */}
      <div className="flex flex-col gap-3 mt-2 rounded-2xl border border-white/15 bg-white/[0.02] p-5 md:p-6">
        <p className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
          {content.sponsorship.perksTitle}
        </p>
        <ul className="flex flex-col gap-2">
          {content.sponsorship.perks.map((perk, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80 leading-relaxed">
              <span className="shrink-0 text-yellow-400 mt-0.5 font-bold">★</span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
