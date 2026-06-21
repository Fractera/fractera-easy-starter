'use client'

import { useHeroContent } from '@/lib/i18n/context'

export function FractеraPromo() {
  const content = useHeroContent()
  return (
    <div className="w-screen bg-black border-y-4 border-violet-500 py-8" style={{ marginLeft: 'calc(50% - 50vw)' }}>
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-between gap-8 md:flex-row md:gap-16">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h2 className="mb-6 max-w-3xl font-serif font-bold leading-tight text-white text-xl md:text-2xl lg:text-4xl">
            {content.promoSection.h2}
          </h2>
          <p className="mb-12 max-w-xl text-base text-white/60 md:text-lg">
            {content.promoSection.description}
          </p>
          <div className="flex flex-col w-full gap-4 mt-8">
            <a
              href="https://github.com/Fractera/Agent-Engineering-Infrastructure"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center gap-2 justify-center rounded-full border border-violet-500/50 bg-violet-500/[0.06] hover:bg-violet-500/20 text-white font-semibold px-6 py-3 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
              {content.promoSection.githubButton}
            </a>
          </div>
        </div>
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/git.png" width={300} height={300} alt="Fractera" className="h-auto max-w-xs sm:max-w-sm md:max-w-md" />
        </div>
      </div>
    </div>
  )
}
