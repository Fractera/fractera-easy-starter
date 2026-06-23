import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { shouldBypassAuth } from '@/lib/auth-bypass'

// Temporary tooling for the Vercel → self-host migration. Two ways through:
//  - FRACTERA_IP_NODOMAIN_MODE=true (or NODE_ENV=development) → open access
//  - any signed-in project owner → gated access
// Reveal of secrets is further gated by ?reveal=1 in app/debug/page.tsx.
// Remove this whole folder after migration is complete.
export default async function DebugLayout({ children }: { children: React.ReactNode }) {
  if (shouldBypassAuth()) return <>{children}</>
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/')
  }
  return <>{children}</>
}
