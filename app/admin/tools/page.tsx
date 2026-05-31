'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

// Only the 4 transactional emails that fire during a real IP-mode deploy.
// Other functions in lib/email.ts (deploy_failed, queued, expiry_warning,
// company_brain_inquiry, welcome-with-domain) still exist and are called from
// failure handlers / Stripe webhooks / B2B form — they're just not surfaced
// here because we audit them separately from the install flow.
const TEMPLATES = [
  { key: 'install_started',  label: '1 · Install started — confirmation',      desc: 'First email. Sent right after the user clicks Deploy — bootstrap is starting on the VPS.' },
  { key: 'recovery_token',   label: '2 · Recovery token — safety net',         desc: 'Sent in parallel with install-started. Carries SESSION_ID + SERVER_TOKEN + Fractera MCP URL so the user can re-engage the deploy from any AI agent if anything breaks.' },
  { key: 'install_progress', label: '3 · Install progress — middle of deploy', desc: 'Sent once mid-bootstrap when all 6 dependency steps finished (~30% through). Reassures the user the deploy is still running.' },
  { key: 'welcome_ip',       label: '4 · Welcome — server is live (IP-only)',  desc: 'Final email after deploy. IP-mode rendering: HTTP IP:port links to Live app, Brain, Memory. Recommended next steps (OpenAI key, Codex, Telegram, domain), Sponsor CTA, GitHub star CTA.' },
  { key: 'domain_activated', label: '5 · Domain activated — switched to HTTPS', desc: 'Sent after the user completes the Personal Domain wizard step 4. Same look as welcome_ip but URLs are https://<host>.<domain>, and the "buy a domain" step is replaced with a congratulations card.' },
  { key: 'cert_expiry',      label: '6 · TLS certificate expiring (Secure mode)', desc: 'Sent by the customer server\'s daily cert-relay when the HTTPS certificate drops to ≤14 days left (one per cert lifecycle, re-armed after renewal). Same look as domain_activated + Sponsor / GitHub star CTAs. Sample renders 7 days left.' },
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
