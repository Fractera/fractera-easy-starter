'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset state when modal opens
  useEffect(() => {
    if (open) { setEmail(''); setEmailSent(false); setLoading(false) }
  }, [open])

  if (!open) return null

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await signIn('resend', { email, redirect: false })
    setEmailSent(true)
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 inline-flex items-center justify-center text-lg leading-none"
        >
          ×
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-white">Sign in to continue</h2>
          <p className="text-sm text-gray-500">You need an account to start your server.</p>
        </div>

        {emailSent ? (
          <div className="flex flex-col gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-green-400 font-medium">Check your email</p>
            <p className="text-xs text-gray-400">
              We sent a login link to <strong className="text-white">{email}</strong>. Click it to sign in.
            </p>
            <p className="text-xs text-yellow-600">
              Don&apos;t see it? Check your <strong>spam or junk folder</strong>.
            </p>
          </div>
        ) : (
          <>
            {/* Google */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="flex items-center justify-center gap-3 w-full bg-white text-black font-medium px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908C16.658 14.252 17.64 11.945 17.64 9.2Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-600">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Magic link */}
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
