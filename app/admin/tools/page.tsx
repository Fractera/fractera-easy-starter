'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const TEMPLATES = [
  { key: 'welcome',                label: 'Welcome — server is live',              desc: 'Main deploy-success email with primary CTA, three destination cards, SSH credentials block.' },
  { key: 'install_started',        label: 'Install started — confirmation',        desc: 'Sent right after a paid deploy begins.' },
  { key: 'install_progress',       label: 'Install progress — middle of deploy',   desc: 'Sent once mid-bootstrap when dependencies finished installing (~30%).' },
  { key: 'recovery_token',         label: 'Recovery token — safety net',           desc: 'Sent in parallel with install-started. Carries SESSION_ID + SERVER_TOKEN + Fractera MCP URL.' },
  { key: 'deploy_failed',          label: 'Deploy failed — with recovery',         desc: 'Sent when bootstrap fails. Includes error text + MCP retry path.' },
  { key: 'queued',                 label: 'Queued — pool is empty (Path B)',       desc: 'Sent when the user paid but no server was ready in the pool.' },
  { key: 'expiry_warning',         label: 'Expiry warning — 7 days left',          desc: 'Sent 7 days before the Stripe subscription expires.' },
  { key: 'company_brain_inquiry',      label: 'AI Company Brain inquiry — admin notify',      desc: 'Sent to admin@fractera.ai when a B2B inquiry is submitted. Reply-To is the inquirer.' },
  { key: 'light_install_started',  label: 'Light — install started',               desc: 'Light variant of install-started. No Hermes/LightRAG/coding agents mentioned.' },
  { key: 'light_recovery_token',   label: 'Light — recovery token',                desc: 'Light variant of recovery-token. Points to https://www.fractera.ai/api/mcp/light (Light MCP), Light palette.' },
  { key: 'light_deploy_failed',    label: 'Light — deploy failed',                 desc: 'Light variant of deploy-failed. Points to Light MCP for retry; no Hermes/Brain mentions.' },
  { key: 'light_welcome',          label: 'Light — server is live',                desc: 'Light deploy-success email. Admin panel + public site + git sync hint — no Hermes, no Company Brain, no 5 platforms.' },
  { key: 'dns_quota_warning',      label: 'DNS quota — warning (80%+)',            desc: 'Sent to admin@fractera.ai when Cloudflare DNS record count crosses ~80% of plan limit. Amber palette. Sample: 160/200 on Free Website.' },
  { key: 'dns_quota_critical',     label: 'DNS quota — CRITICAL (100%)',           desc: 'Sent to admin@fractera.ai when DNS quota is exhausted; bootstrap aborts. Red palette. Sample: 200/200 on Free Website.' },
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
