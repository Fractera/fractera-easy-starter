'use client'

import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useState } from 'react'
import { AuthModal } from '@/components/auth-modal'

const AuthModalCtx = createContext({ openModal: () => {} })
export const useAuthModal = () => useContext(AuthModalCtx)

export function Providers({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <SessionProvider>
      <AuthModalCtx.Provider value={{ openModal: () => setOpen(true) }}>
        {children}
        <AuthModal open={open} onClose={() => setOpen(false)} />
      </AuthModalCtx.Provider>
    </SessionProvider>
  )
}
