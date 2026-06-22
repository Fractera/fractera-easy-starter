/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { SiteContent } from '@/lib/i18n/types'

type DrawerStrings = SiteContent['frameworkFeedback']['drawer']

type Props = {
  open: boolean
  onClose: () => void
  // Plain passthrough — sent to the API for the record, never compared in the UI.
  lang: string
  email: string
  // Framework this feedback concerns (e.g. "Next.js"). Universal drawer — the name
  // is interpolated into the localized strings ({framework} placeholder) so the same
  // component serves every /framework/<slug> page.
  framework: string
  // Pre-resolved localized strings (from the i18n shell) — the component never does
  // a lang comparison itself.
  strings: DrawerStrings
}

// Universal framework-expert feedback drawer (the right-hand slide-over of the
// callback card on /framework/<slug>). Mirrors company-brain-inquiry-drawer's
// mechanics but with a different intent: ask someone with real expertise in
// {framework} to introduce themselves, link their GitHub, say a few words about
// themselves, and — most importantly — write what they'd like to see in the project.
// Strings come pre-localized from the i18n shell; {framework} is interpolated here.
// Posts to /api/framework-feedback, which sends a distinctively-marked email naming
// the framework.
export function FrameworkFeedbackDrawer({ open, onClose, lang, email, framework, strings }: Props) {
  const [name, setName] = useState('')
  const [github, setGithub] = useState('')
  const [about, setAbout] = useState('')
  const [wish, setWish] = useState('')
  const [spamUnderstood, setSpamUnderstood] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setDone(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  // Interpolate the framework name into every localized string.
  const fill = (s: string) => s.replaceAll('{framework}', framework)
  const t = strings

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/framework-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framework, name, github, about, wish, lang }),
      })
      if (!res.ok) {
        toast.error(fill(t.sendFailed))
        return
      }
      setDone(true)
    } catch {
      toast.error(fill(t.sendFailed))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full md:w-[500px] bg-neutral-950 border-l border-white/15 shadow-2xl overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg font-bold leading-none"
        >
          ×
        </button>

        <div className="flex flex-col gap-5 p-6 md:p-8 pt-12">

          {done ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-2xl leading-none">✓</span>
                <h2 className="text-xl md:text-2xl font-bold text-white font-serif">{fill(t.successTitle)}</h2>
              </div>
              <p className="text-sm md:text-base text-white/75 leading-relaxed">{fill(t.successBody)}</p>
              <button
                type="button"
                onClick={onClose}
                className="self-start mt-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                {fill(t.successClose)}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{fill(t.eyebrow)}</span>
                <h2 className="text-xl md:text-2xl font-bold text-white font-serif">{fill(t.title)}</h2>
                <p className="text-sm text-white/60 leading-relaxed">{fill(t.subtitle)}</p>
              </div>

              <Field label={fill(t.nameLabel)} value={name} onChange={setName} />
              <Field label={fill(t.githubLabel)} value={github} onChange={setGithub} placeholder={fill(t.githubPlaceholder)} />
              <Field label={fill(t.aboutLabel)} value={about} onChange={setAbout} placeholder={fill(t.aboutPlaceholder)} multiline />
              <Field label={fill(t.wishLabel)} value={wish} onChange={setWish} placeholder={fill(t.wishPlaceholder)} multiline />

              {/* Email — readonly (from session) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{fill(t.emailLabel)}</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="bg-white/[0.02] border border-white/15 rounded-lg px-3 py-2 text-sm text-white/70 font-mono cursor-not-allowed"
                />
                <p className="text-xs text-white/50 leading-relaxed">{fill(t.emailHint)}</p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={spamUnderstood}
                  onChange={e => setSpamUnderstood(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-violet-500"
                />
                <span className="text-sm text-white/75 leading-relaxed">{fill(t.spamLabel)}</span>
              </label>

              <button
                type="submit"
                disabled={submitting || !spamUnderstood}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl text-sm md:text-base transition-colors shadow-lg shadow-violet-500/30"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {fill(t.submitting)}
                  </>
                ) : (
                  <>{fill(t.submit)} →</>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  )
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 leading-relaxed"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70"
        />
      )}
    </div>
  )
}
