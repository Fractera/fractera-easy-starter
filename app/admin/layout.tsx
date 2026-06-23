import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { auth } from '@/lib/auth'
import { Providers } from '@/components/providers'
import { htmlFontClass } from '@/lib/fonts'
import { AdminHeader } from '@/components/admin-header'

// Admin is architect-only and stays dynamic (auth() per request). After the
// static-rendering refactor (step 130) the root layout is a bare pass-through, so
// this layout owns its own <html lang="en"> root. The route lives at /admin/* with
// no language prefix and is English-only.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    redirect('/')
  }
  return (
    <html lang="en" className={htmlFontClass}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="min-h-screen bg-black text-white">
            <AdminHeader email={session.user.email ?? null} />
            <main>{children}</main>
          </div>
          <Toaster position="top-center" theme="dark" />
        </Providers>
      </body>
    </html>
  )
}
