'use client'

import { SessionProvider } from 'next-auth/react'
import { createContext, useCallback, useContext, useState } from 'react'
import { AuthModal } from '@/components/auth-modal'
import { DashboardModal } from '@/components/dashboard-modal'
import { CheckoutDrawer } from '@/components/stripe-checkout-drawer'

const AuthModalCtx = createContext({ openModal: (_plan?: string) => {} })
export const useAuthModal = () => useContext(AuthModalCtx)

const DashboardCtx = createContext({
  openServers: () => {},
  openSubscription: () => {},
  openPurchases: () => {},
  openWhiteLabel: (_serverTokenId: string) => {},
})
export const useDashboard = () => useContext(DashboardCtx)

const CheckoutCtx = createContext({
  openCheckout: (_plan: string) => {},
  openSponsorCheckout: (_tier: string) => {},
})
export const useCheckout = () => useContext(CheckoutCtx)

export function Providers({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string | undefined>()
  const [dashboardState, setDashboardState] = useState<{ open: boolean; view: 'servers' | 'subscription' | 'purchases' }>({ open: false, view: 'servers' })
  const [checkoutState, setCheckoutState] = useState<{ open: boolean; planId: string }>({ open: false, planId: 'monthly' })
  const [wlState, setWlState] = useState<{ open: boolean; serverTokenId: string | null }>({ open: false, serverTokenId: null })
  const [sponsorState, setSponsorState] = useState<{ open: boolean; tier: string }>({ open: false, tier: 's5' })

  const openModal = useCallback((plan?: string) => {
    setPendingPlan(plan)
    setAuthOpen(true)
  }, [])

  const openServers = useCallback(() => setDashboardState({ open: true, view: 'servers' }), [])
  const openSubscription = useCallback(() => setDashboardState({ open: true, view: 'subscription' }), [])
  const openPurchases = useCallback(() => setDashboardState({ open: true, view: 'purchases' }), [])
  const openWhiteLabel = useCallback((id: string) => setWlState({ open: true, serverTokenId: id }), [])
  const openCheckout = useCallback((plan: string) => setCheckoutState({ open: true, planId: plan }), [])
  const openSponsorCheckout = useCallback((tier: string) => setSponsorState({ open: true, tier }), [])

  return (
    <SessionProvider>
      <AuthModalCtx.Provider value={{ openModal }}>
        <DashboardCtx.Provider value={{ openServers, openSubscription, openPurchases, openWhiteLabel }}>
          <CheckoutCtx.Provider value={{ openCheckout, openSponsorCheckout }}>
            {children}
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} pendingPlan={pendingPlan} />
            <DashboardModal
              open={dashboardState.open}
              view={dashboardState.view}
              onClose={() => setDashboardState(s => ({ ...s, open: false }))}
              onWhiteLabel={(id) => setWlState({ open: true, serverTokenId: id })}
            />
            <CheckoutDrawer open={checkoutState.open} planId={checkoutState.planId} onClose={() => setCheckoutState(s => ({ ...s, open: false }))} />
            <CheckoutDrawer
              open={wlState.open}
              serverTokenId={wlState.serverTokenId ?? undefined}
              onClose={() => setWlState({ open: false, serverTokenId: null })}
            />
            <CheckoutDrawer
              open={sponsorState.open}
              sponsorTier={sponsorState.tier}
              onClose={() => setSponsorState(s => ({ ...s, open: false }))}
            />
          </CheckoutCtx.Provider>
        </DashboardCtx.Provider>
      </AuthModalCtx.Provider>
    </SessionProvider>
  )
}
