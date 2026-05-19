'use client'

import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { useCallback, useEffect, useState } from 'react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutDrawer({ open, planId, serverTokenId, sponsorTier, onClose }: {
  open: boolean
  planId?: string
  serverTokenId?: string
  sponsorTier?: string  // 's1' | 's5' | 's20'
  onClose: () => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    setError(false)
    try {
      let res: Response
      if (sponsorTier) {
        res = await fetch('/api/stripe/checkout/sponsor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: sponsorTier }),
        })
      } else if (serverTokenId) {
        res = await fetch('/api/stripe/checkout/white-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serverTokenId }),
        })
      } else {
        res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, embedded: true }),
        })
      }
      const data = await res.json()
      if (data.clientSecret) setClientSecret(data.clientSecret)
      else setError(true)
    } catch {
      setError(true)
    }
  }, [planId, serverTokenId, sponsorTier])

  useEffect(() => {
    if (open) {
      setClientSecret(null)
      fetchClientSecret()
    } else {
      setClientSecret(null)
      setError(false)
    }
  }, [open, fetchClientSecret])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full md:w-[45vw] bg-white shadow-2xl overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-black text-lg font-bold leading-none"
        >
          ×
        </button>

        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <p className="text-gray-600 text-sm">Failed to load checkout. Please try again.</p>
            <button type="button" onClick={fetchClientSecret}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Retry
            </button>
          </div>
        ) : clientSecret ? (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading…
          </div>
        )}
      </div>
    </>
  )
}
