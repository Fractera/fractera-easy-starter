'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GTM_ID = 'GTM-K7QLGSPD'

// Google Tag Manager loader. The container script is injected as high as possible
// via next/script (afterInteractive). The matching <noscript> iframe is rendered
// separately, immediately after <body>, in the zone layout (a client Script cannot
// emit a <noscript>). Skipped on /embed/* (iframe widget pages — not part of the
// marketing funnel), same as Google Analytics.
export function GoogleTagManager() {
  const pathname = usePathname() ?? ''
  if (pathname.includes('/embed')) return null

  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}

// The <body> noscript fallback. Render it as the FIRST child of <body>.
export function GoogleTagManagerNoscript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
