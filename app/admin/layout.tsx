import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminHeader } from '@/components/admin-header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    redirect('/')
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader email={session.user.email ?? null} />
      <main>{children}</main>
    </div>
  )
}
