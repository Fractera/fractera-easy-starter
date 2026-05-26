'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { InstallFormMain } from '@/components/install-form-main'
import { useAuthModal } from '@/components/providers'

export function MainDeploySection() {
  const { data: session } = useSession()
  const { openModal } = useAuthModal()
  const [installing, setInstalling] = useState(false)
  const [liveSubdomain, setLiveSubdomain] = useState('')

  return (
    <section id="deploy-main" className="w-full flex flex-col gap-8 scroll-mt-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/40 bg-indigo-500/[0.06] px-3 py-1 rounded-full self-start">
          Fractera Main — Beta
        </span>
        <h2 className="font-serif font-bold leading-tight text-white text-2xl md:text-3xl">
          Deploy the full AI workspace on your server
        </h2>
        <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-2xl">
          Path-based architecture. One DNS record. Bring your own Ubuntu VPS — get the full Fractera admin panel with preview, database, media, and users.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
        {session ? (
          <InstallFormMain
            onSubdomainReady={setLiveSubdomain}
            onInstallingChange={setInstalling}
          />
        ) : (
          <div className="flex flex-col gap-4 max-w-md">
            <p className="text-sm text-white/60">Sign in to start deployment.</p>
            <button
              type="button"
              onClick={() => openModal()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors"
            >
              Sign in to deploy →
            </button>
          </div>
        )}
      </div>

      {(installing || liveSubdomain) && liveSubdomain && (
        <div className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
          <p className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-2">Your server is live</p>
          <a
            href={`https://${liveSubdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-bold text-indigo-400 hover:text-indigo-300 break-all"
          >
            ↗ https://{liveSubdomain}
          </a>
        </div>
      )}
    </section>
  )
}
