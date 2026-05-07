'use client'

import { SessionProvider } from 'next-auth/react'
import { createContext, useCallback, useContext, useState } from 'react'
import { AuthModal } from '@/components/auth-modal'
import { DashboardModal } from '@/components/dashboard-modal'

const AuthModalCtx = createContext({ openModal: () => {} })
export const useAuthModal = () => useContext(AuthModalCtx)

const DashboardCtx = createContext({ openDashboard: () => {} })
export const useDashboard = () => useContext(DashboardCtx)

export function Providers({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const openDashboard = useCallback(() => setDashboardOpen(true), [])
  return (
    <SessionProvider>
      <AuthModalCtx.Provider value={{ openModal: () => setAuthOpen(true) }}>
        <DashboardCtx.Provider value={{ openDashboard }}>
          {children}
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          <DashboardModal open={dashboardOpen} onClose={() => setDashboardOpen(false)} />
        </DashboardCtx.Provider>
      </AuthModalCtx.Provider>
    </SessionProvider>
  )
}
