'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const TABS = [
  { href: '/admin/users',       label: 'Users' },
  { href: '/admin/sponsors-1',  label: '$1 sponsors' },
  { href: '/admin/sponsors-5',  label: '$5 sponsors' },
  { href: '/admin/sponsors-20', label: '$20 sponsors' },
  { href: '/admin/whitelabel',  label: 'White-label' },
  { href: '/admin/blackbox',    label: 'Black Box' },
  { href: '/admin/partners',    label: 'Partners' },
  { href: '/admin/servers',     label: 'Servers' },
  { href: '/admin/deployments', label: 'Deployments' },
  { href: '/admin/hostings',    label: 'Hostings' },
]

export function AdminHeader({ email }: { email: string | null }) {
  const pathname = usePathname() ?? ''
  return (
    <header className="sticky top-0 z-30 border-b border-white/15 bg-black/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin/users" className="text-lg font-bold tracking-tight text-white">
            Fractera <span className="text-violet-400">Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-white/55 font-mono text-xs">{email ?? ''}</span>
            <Link
              href="/"
              className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded transition-colors"
            >
              Site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 -mx-1">
          {TABS.map(tab => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  active
                    ? 'bg-violet-500/15 text-violet-200 border border-violet-500/40'
                    : 'text-white/70 hover:text-white border border-transparent hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
