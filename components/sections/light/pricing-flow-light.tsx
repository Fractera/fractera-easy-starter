'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { InstallFormLight } from '@/components/install-form-light'
import { useAuthModal } from '@/components/providers'
import type { LightContent } from '@/lib/i18n/types'

// Light-themed two-column deploy section. Mirrors the structure of
// PricingFlow (left = VPS providers, right = install card), repainted
// for the bg-sky-50 / text-slate-900 Light page palette.
export function LightPricingFlow({ content }: { content: LightContent }) {
  const { deploy } = content
  const { data: session } = useSession()
  const { openModal } = useAuthModal()

  const [installing, setInstalling] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')

  return (
    <section id="deploy" className="w-full flex flex-col gap-8">
      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">

        {/* Left: header + VPS hint + provider chips */}
        <div className="flex flex-col gap-6 items-start text-left">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{deploy.label}</p>
            <h2 className="font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl lg:text-4xl">
              {deploy.h2}
            </h2>
            <p className="text-base text-slate-600">{deploy.description}</p>
          </div>

          <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl p-5">
            <ServerIcon className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed">{deploy.vpsHint}</p>
          </div>

          <div className="flex flex-col gap-3 w-full pt-4 border-t border-slate-200 lg:mt-auto">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{deploy.serverSection.label}</p>
              <h3 className="text-base font-bold font-serif text-slate-900">{deploy.serverSection.h2}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{deploy.serverSection.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              {deploy.serverSection.providers.map(({ name, tagline, url, price }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={tagline}
                  className="group w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 hover:border-sky-500/60 bg-white hover:bg-sky-50 px-5 py-4 transition-all"
                >
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{name}</span>
                    {price && <span className="text-xs text-slate-600 font-medium">{price}</span>}
                  </span>
                  <span className="shrink-0 text-slate-400 group-hover:text-sky-600 text-base font-bold transition-colors">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: install card */}
        <div className="flex flex-col gap-6">
          <div
            className="flex-1 flex flex-col gap-4 rounded-2xl p-6 bg-gradient-to-br from-sky-50 via-white to-sky-50 border border-sky-200 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 self-start">
                {deploy.ownServerBadge}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Fractera Light</h3>
              <p className="text-sm text-sky-700/80 font-medium">{deploy.freeInstall}</p>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-slate-900 font-medium flex-1">
              {deploy.planFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-sky-600">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {session ? (
              <InstallFormLight
                strings={content.installForm}
                onSubdomainReady={setLiveSubdomain}
                onInstallingChange={setInstalling}
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-sky-500/20"
                >
                  {deploy.signInButton}
                </button>
                <p className="text-xs text-slate-500 text-center -mt-2">{deploy.signInPrompt}</p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Trust strip */}
      <div className="grid grid-cols-3 gap-3">
        {deploy.trustItems.map((item, i) => (
          <div key={i} className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 text-center tracking-wide">
            {item}
          </div>
        ))}
      </div>

      <p className="text-xs text-amber-700/90 leading-relaxed">{deploy.disclaimer}</p>

      {/* Live progress block (after install starts) */}
      {(installing || liveSubdomain) && (
        <div className="w-full flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
            <p className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">{deploy.domainSection.label}</p>
            <h2 className="max-w-3xl font-serif font-bold leading-tight text-slate-900 text-2xl md:text-3xl">
              {deploy.domainSection.h2}
            </h2>
            <p className="max-w-xl text-base text-slate-600">{deploy.domainSection.description}</p>
          </div>
          {liveSubdomain && (
            <div className="w-full rounded-2xl border border-sky-200 bg-white p-6">
              <a
                href={`https://${liveSubdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-sky-700 hover:text-sky-600 break-all"
              >
                ↗ https://{liveSubdomain}
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ServerIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}
