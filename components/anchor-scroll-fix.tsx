'use client'

import { useEffect } from 'react'

/**
 * Re-scrolls to the URL hash after the first paint and again 600ms later.
 *
 * Why: sections above the hash target (PlatformSelector, FeaturesGrid, etc.)
 * finish layouting after the initial scroll fires, which pushes the target
 * down and leaves the user landing on the section ABOVE the intended one.
 * On the second click users land correctly because by then the layout has
 * stabilised. A two-shot scroll (immediate + delayed) covers both cases.
 *
 * Also handles hashchange events for in-page anchor clicks while the user
 * is already on the landing.
 */
export function AnchorScrollFix() {
  useEffect(() => {
    function scrollToHash() {
      const hash = window.location.hash?.slice(1)
      if (!hash) return
      const el = document.getElementById(hash)
      if (!el) return
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    }

    // First pass — once React has painted.
    scrollToHash()
    // Second pass — after lazy sections above the target have laid out.
    const t = setTimeout(scrollToHash, 600)

    window.addEventListener('hashchange', scrollToHash)
    return () => {
      clearTimeout(t)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  return null
}
