'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const GA_ID = 'G-W78YGT6XLJ'
const CONSENT_KEY = 'fractera-cookie-consent'
const CONSENT_EVENT = 'cookie-consent-changed'

// GA loads only after the user clicks "Accept" in the cookie banner. We listen
// to:
//   - localStorage on mount (in case they already accepted on a previous visit)
//   - the custom `cookie-consent-changed` event the banner dispatches when they
//     click Accept in the current session (instant reaction, no reload needed)
//   - the `storage` event so a multi-tab acceptance also flips this tab
//
// We never load GA on /embed/* (iframe widget pages) — those are not part of
// our marketing funnel and analytics there is meaningless.
export function GoogleAnalytics() {
  const pathname = usePathname() ?? ''
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const check = () => {
      try { setEnabled(localStorage.getItem(CONSENT_KEY) === 'accepted') } catch {}
    }
    check()
    window.addEventListener(CONSENT_EVENT, check)
    window.addEventListener('storage', e => { if (e.key === CONSENT_KEY) check() })
    return () => {
      window.removeEventListener(CONSENT_EVENT, check)
      // 'storage' listener captured a closure — the anonymous remove is best-effort
    }
  }, [])

  if (pathname.includes('/embed')) return null
  if (!enabled) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
