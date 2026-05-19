import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DebugLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    redirect('/')
  }
  return <>{children}</>
}
