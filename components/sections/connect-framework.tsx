'use client'

import { useState } from 'react'
import { useHeroContent } from '@/lib/i18n/context'

// Framework display-name → logo file in /public/framework-icons.
// Dark-optimized brand marks (designed for a dark background — no white chip
// needed). Names not present fall back to a letter chip (Hono, Reflex have no
// official logo). vue/react-router/solidstart/remix are colored brand marks,
// also visible on the dark card.
export const ICON: Record<string, string> = {
  'Next.js': 'next-js-dark', 'React': 'react', 'Vue': 'vue', 'Angular': 'angular',
  'SvelteKit': 'svelte', 'Nuxt': 'nuxt', 'Astro': 'astro-dark', 'Remix': 'remix',
  'Gatsby': 'gatsby', 'SolidStart': 'solidstart', 'Qwik': 'qwik',
  'React Router': 'react-router', 'TanStack Start': 'tanstack-dark', 'Hugo': 'hugo',
  'Jekyll': 'jekyll', 'Eleventy': 'eleventy', 'Vite': 'vite', 'Ember': 'ember',
  'Redwood': 'redwoodsdk', 'Express': 'express-dark', 'NestJS': 'nest-js',
  'Fastify': 'fastify', 'Django': 'django-dark', 'Flask': 'flask', 'FastAPI': 'fastapi',
  'Laravel': 'laravel-dark', 'Symfony': 'symfony-dark', 'Rails': 'rails-dark',
  'Phoenix': 'phoenix', 'Spring': 'spring', '.NET': 'dotnet',
}

// "Connect your framework" — sits directly under the pricing/deploy block.
// Vision-toned reframe: "deploy a starter of ANY framework (or any public repo)
// onto your VPS". Honesty constraint: only the Next.js starter actually deploys
// today; every card here is a placeholder linking to "/#" (per-framework guides
// are upcoming). The grid has a collapsed/expanded toggle ("Show all" / "Hide").
// Strings come from i18n (rule 4а) via content.connectFramework.
export function ConnectFramework() {
  const content = useHeroContent()
  const cf = content.connectFramework
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? cf.frameworks : cf.frameworks.slice(0, cf.collapsedCount)
  const hasMore = cf.frameworks.length > cf.collapsedCount

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-3 items-start text-left md:items-center md:text-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/50 bg-violet-500/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em]">{cf.badge}</span>
        </div>
        <h2 className="max-w-3xl font-serif font-bold leading-tight text-white text-2xl md:text-3xl lg:text-4xl">
          {cf.h2}
        </h2>
        <p className="max-w-2xl text-base text-white/60 leading-relaxed">{cf.description}</p>
      </div>

      {/* Card grid: bordered, hover glow (matches hero benefit cards). Each card is
          a placeholder link to "/#" — guides are upcoming, no per-framework deploy
          is promised. Responsive: 2 cols → 3 md → 4 lg. */}
      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 list-none">
        {visible.map((name) => (
          <li key={name}>
            <a
              href="/#"
              className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/[0.06] hover:shadow-[0_0_30px_2px_rgba(139,92,246,0.3)]"
            >
              {ICON[name] ? (
                <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center">
                  <img
                    src={`/framework-icons/${ICON[name]}.svg`}
                    alt=""
                    width={24}
                    height={24}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-[11px] font-bold text-violet-300 group-hover:border-violet-500/40 transition-colors"
                >
                  {name.charAt(0)}
                </span>
              )}
              <span className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors truncate">
                {name}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-violet-500/60 bg-white/[0.03] hover:bg-violet-500/[0.06] px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-violet-200 transition-all"
          >
            {expanded ? cf.hide : cf.showAll}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      )}

      <p className="text-xs text-orange-400/80 leading-relaxed">{cf.hint}</p>
    </div>
  )
}
