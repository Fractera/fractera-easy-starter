'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GA_ID = 'G-W78YGT6XLJ'

// Google Analytics 4 with Consent Mode v2.
//
// gtag.js is loaded on every landing page hit so the tag is detectable by
// Google Tag Tester and GA reports aggregated traffic numbers from day one.
// Before the user clicks "Accept" in the cookie banner, analytics_storage is
// set to 'denied' — Google then sends cookieless pings only (no _ga / _gid
// cookies, no cross-session identifier), which is GDPR-compliant.
//
// When the user accepts, components/cookie-banner.tsx flips the state by
// calling gtag('consent','update',{analytics_storage:'granted'}). After that
// gtag drops the regular _ga cookies and full GA4 attribution works.
//
// Skipped entirely on /embed/* (iframe widget pages) — those are not part of
// our marketing funnel and analytics on them is noise.
export function GoogleAnalytics() {
  const pathname = usePathname() ?? ''
  if (pathname.includes('/embed')) return null

  return (
    <>
      {/* Consent default — MUST run before gtag.js loads. beforeInteractive
          guarantees it's emitted into the document head ahead of the loader. */}
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          // Default everything to denied. The 'update' call lives in the
          // cookie banner Accept handler. Reading the previously-saved consent
          // here lets returning visitors who already accepted skip the
          // cookieless-only phase on this page load.
          var saved = null;
          try { saved = localStorage.getItem('fractera-cookie-consent'); } catch(e) {}
          var granted = saved === 'accepted';
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': granted ? 'granted' : 'denied',
            'wait_for_update': 500
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  )
}
