'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Client-side admin convenience redirect (step 130). Previously the home page
// called auth() server-side to bounce the architect to /admin — which forced the
// whole home page to render dynamically on EVERY visit just to redirect one person.
// Moving it client-side lets the home page be fully static; the architect is
// redirected right after the session resolves on the client.
export function AdminRedirect() {
  const { data: session } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session?.user?.email === 'admin@fractera.ai') {
      router.replace('/admin')
    }
  }, [session, router])
  return null
}
