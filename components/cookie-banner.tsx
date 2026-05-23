'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function CookieBanner() {
  const pathname = usePathname() ?? ''
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('fractera-cookie-consent')) {
      setVisible(true)
    }
    const handler = () => setVisible(true)
    window.addEventListener('open-cookie-settings', handler)
    return () => window.removeEventListener('open-cookie-settings', handler)
  }, [])

  if (pathname.includes('/embed')) return null
  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-neutral-950/98 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <p className="text-sm text-white/70 leading-relaxed">
          We use cookies to provide and improve our services. By continuing to use Fractera, you agree to our{' '}
          <a href="/cookies" className="text-white underline hover:no-underline">Cookie Policy</a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('fractera-cookie-consent', 'accepted')
              // Lets GoogleAnalytics + any future consent-gated script load
              // immediately in this tab, without a page reload.
              window.dispatchEvent(new Event('cookie-consent-changed'))
              setVisible(false)
            }}
            className="text-sm font-semibold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-lg transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('fractera-cookie-consent', 'rejected')
              window.dispatchEvent(new Event('cookie-consent-changed'))
              setVisible(false)
            }}
            className="text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
