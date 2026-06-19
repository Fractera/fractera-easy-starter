'use client'

import { useState } from 'react'
import { getContent } from '@/lib/i18n/locales'
import { ICON } from '@/components/sections/connect-framework'

// Inline framework grid for prose bodies (News / blog), dropped in through the
// shared PostBody renderer via the `{ kind: 'frameworks' }` block. It mirrors the
// homepage ConnectFramework grid + show-more/less toggle, but reads the EN content
// directly (getContent('en')) so it needs no i18n provider and stays a self-
// contained client island inside a server-rendered article. Names are proper
// nouns shared across locales, and the News corpus is EN-only, so EN is correct.
export function InlineFrameworkGrid() {
  const cf = getContent('en').connectFramework
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? cf.frameworks : cf.frameworks.slice(0, cf.collapsedCount)
  const hasMore = cf.frameworks.length > cf.collapsedCount

  return (
    <div className="my-2 flex flex-col gap-5">
      <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {visible.map((name) => (
          <li key={name}>
            <div className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3 transition-colors hover:border-violet-500/40 hover:bg-violet-500/[0.06]">
              {ICON[name] ? (
                <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/framework-icons/${ICON[name]}.svg`}
                    alt="" width={24} height={24} loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-[11px] font-bold text-violet-300"
                >
                  {name.charAt(0)}
                </span>
              )}
              <span className="truncate text-sm font-semibold text-white/85 group-hover:text-white transition-colors">
                {name}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="flex justify-start md:justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white/80 transition-all hover:border-violet-500/60 hover:bg-violet-500/[0.06] hover:text-violet-200"
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
    </div>
  )
}
