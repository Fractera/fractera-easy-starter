'use client'

import { SessionProvider } from 'next-auth/react'
import { createContext, useCallback, useContext, useState } from 'react'
import { AuthModal } from '@/components/auth-modal'
import { DashboardModal } from '@/components/dashboard-modal'

const AuthModalCtx = createContext({ openModal: () => {} })
export const useAuthModal = () => useContext(AuthModalCtx)

const DashboardCtx = createContext({ openServers: () => {}, openSubscription: () => {} })
export const useDashboard = () => useContext(DashboardCtx)

export function Providers({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [dashboardState, setDashboardState] = useState<{ open: boolean; view: 'servers' | 'subscription' }>({ open: false, view: 'servers' })
  const openServers = useCallback(() => setDashboardState({ open: true, view: 'servers' }), [])
  const openSubscription = useCallback(() => setDashboardState({ open: true, view: 'subscription' }), [])
  return (
    <SessionProvider>
      <AuthModalCtx.Provider value={{ openModal: () => setAuthOpen(true) }}>
        <DashboardCtx.Provider value={{ openServers, openSubscription }}>
          {children}
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          <DashboardModal open={dashboardState.open} view={dashboardState.view} onClose={() => setDashboardState(s => ({ ...s, open: false }))} />
        </DashboardCtx.Provider>
      </AuthModalCtx.Provider>
    </SessionProvider>
  )
}
