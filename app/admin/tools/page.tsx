'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

// A REAL DEPLOY SENDS EXACTLY TWO EMAILS (owner's decision, 2026-08-17): the
// start confirmation and the result. The two that used to sit between them —
// 'recovery_token' and 'install_progress' — were deleted from lib/email.ts, not
// merely hidden here; see the tombstones there. Both are unlisted for the same
// reason they were removed: every extra send eats the Resend allowance while the
// customer can already watch the deploy live on the page they started from.
//
// Other functions in lib/email.ts (deploy_failed, queued, expiry_warning,
// company_brain_inquiry) still exist and are called from failure handlers /
// Stripe webhooks / the B2B form — they're just audited separately from the
// install flow.
const TEMPLATES = [
  { key: 'install_started',  label: '1 · Install started — confirmation',      desc: 'First of two. Sent right after the user clicks Deploy. Carries the server IP and both addresses (:3000 app, :3002 panel), so the customer holds them from minute one and does not depend on the success email arriving.' },
  { key: 'welcome_ip',       label: '2 · Welcome — server is live (IP-only)',  desc: 'Second of two, after the deploy finishes. IP-mode rendering: HTTP IP:port links. Sent exactly once via the ServerToken.welcomeSentAt claim, and re-attempted by the */15 ping cron if a send fails.' },
  { key: 'domain_activated', label: '3 · Domain activated — switched to HTTPS', desc: 'Sent after the user completes the Personal Domain wizard step 4. Same look as welcome_ip but URLs are https://<host>.<domain>, and the "buy a domain" step is replaced with a congratulations card.' },
  { key: 'cert_expiry',      label: '4 · TLS certificate expiring (Secure mode)', desc: 'Sent by the customer server\'s daily cert-relay when the HTTPS certificate drops to ≤14 days left (one per cert lifecycle, re-armed after renewal). Same look as domain_activated + Sponsor / GitHub star CTAs. Sample renders 7 days left.' },
  { key: 'partner_welcome',  label: '5 · Partner welcome — cabinet activated',   desc: 'Sent when a user registers as a partner. Carries the partner ID/slug, the partner page URL (www.fractera.ai/partner/<slug>), the widget iframe snippet, and the "choosing an affiliate program" guidance (Hostinger easiest; Contabo/GoDaddy via cj.com).' },
] as const

type TemplateKey = typeof TEMPLATES[number]['key']

export default function ToolsPage() {
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState<TemplateKey | null>(null)
  const [result, setResult] = useState<{ template: string; ok: boolean; message: string } | null>(null)

  useEffect(() => {
    if (session?.user?.email && !email) setEmail(session.user.email)
  }, [session, email])

  async function send(template: TemplateKey) {
    if (!email.trim()) return
    setPending(template)
    setResult(null)
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), template }),
      })
      const d = await res.json()
      if (res.ok) {
        setResult({ template, ok: true, message: `Sent ${template} to ${d.sent}` })
      } else {
        setResult({ template, ok: false, message: d.error ?? 'unknown error' })
      }
    } catch (err) {
      setResult({ template, ok: false, message: err instanceof Error ? err.message : String(err) })
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Tools</h1>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-white/15 bg-white/[0.02] p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-white">Email design preview</h2>
          <p className="text-sm text-white/55">
            Sends one of the live transactional templates with sample data so you can inspect the rendered design in any inbox. Real production emails use the same templates — no separate &quot;preview&quot; version.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">Send to</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/70 font-mono"
          />
          <p className="text-xs text-white/40">Defaults to your admin email. Change to test deliverability across inboxes.</p>
        </div>

        <div className="flex flex-col gap-2">
          {TEMPLATES.map(t => (
            <div key={t.key} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-semibold text-white">{t.label}</p>
                <p className="text-xs text-white/55 leading-relaxed">{t.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => send(t.key)}
                disabled={!email.trim() || pending !== null}
                className="shrink-0 text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/40 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {pending === t.key ? 'Sending…' : 'Send preview'}
              </button>
            </div>
          ))}
        </div>

        {result && (
          <div
            className={`text-sm rounded-lg p-3 border ${
              result.ok
                ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/[0.05]'
                : 'text-red-300 border-red-500/30 bg-red-500/[0.05]'
            }`}
          >
            {result.ok ? '✓ ' : '✗ '}{result.message}
          </div>
        )}
      </section>
    </div>
  )
}
