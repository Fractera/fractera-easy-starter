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
  openWhiteLabelSelfHosted: (_subdomain: string, _ip: string) => {},
})
export const useDashboard = () => useContext(DashboardCtx)

const CheckoutCtx = createContext({ openCheckout: (_plan: string) => {} })
export const useCheckout = () => useContext(CheckoutCtx)

type WlState =
  | { open: false }
  | { open: true; serverTokenId: string; serverSubdomain?: undefined; serverIp?: undefined }
  | { open: true; serverSubdomain: string; serverIp: string; serverTokenId?: undefined }

export function Providers({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string | undefined>()
  const [dashboardState, setDashboardState] = useState<{ open: boolean; view: 'servers' | 'subscription' | 'purchases' }>({ open: false, view: 'servers' })
  const [checkoutState, setCheckoutState] = useState<{ open: boolean; planId: string }>({ open: false, planId: 'monthly' })
  const [wlState, setWlState] = useState<WlState>({ open: false })

  const openModal = useCallback((plan?: string) => {
    setPendingPlan(plan)
    setAuthOpen(true)
  }, [])

  const openServers = useCallback(() => setDashboardState({ open: true, view: 'servers' }), [])
  const openSubscription = useCallback(() => setDashboardState({ open: true, view: 'subscription' }), [])
  const openPurchases = useCallback(() => setDashboardState({ open: true, view: 'purchases' }), [])
  const openWhiteLabelSelfHosted = useCallback((subdomain: string, ip: string) => {
    setWlState({ open: true, serverSubdomain: subdomain, serverIp: ip })
  }, [])

  const openCheckout = useCallback((plan: string) => {
    setCheckoutState({ open: true, planId: plan })
  }, [])

  const closeWl = useCallback(() => setWlState({ open: false }), [])

  return (
    <SessionProvider>
      <AuthModalCtx.Provider value={{ openModal }}>
        <DashboardCtx.Provider value={{ openServers, openSubscription, openPurchases, openWhiteLabelSelfHosted }}>
          <CheckoutCtx.Provider value={{ openCheckout }}>
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
              serverTokenId={wlState.open ? wlState.serverTokenId : undefined}
              serverSubdomain={wlState.open ? wlState.serverSubdomain : undefined}
              serverIp={wlState.open ? wlState.serverIp : undefined}
              onClose={closeWl}
            />
          </CheckoutCtx.Provider>
        </DashboardCtx.Provider>
      </AuthModalCtx.Provider>
    </SessionProvider>
  )
}
