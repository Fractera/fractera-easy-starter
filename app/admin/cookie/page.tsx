import { getAllCookies } from '@/lib/i18n/locales'

export default function CookieAdminPage() {
  const all = getAllCookies()
  const langs = Object.keys(all).sort()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Cookie banner — texts</h1>
        <p className="text-sm text-white/55 leading-relaxed">
          Per-language texts shown by the cookie consent banner on the public site.
          Source of truth is <code className="text-violet-300 font-mono text-xs">lib/i18n/locales/&lt;lang&gt;/cookie.ts</code> —
          edit there to change a translation, or add a new locale file for country-specific compliance text.
        </p>
        <p className="text-xs text-white/40">
          The <code className="font-mono">{'{policy}'}</code> placeholder inside <em>message</em> is replaced by a link to <code className="font-mono">/&lt;lang&gt;/cookies</code> whose visible label is <em>policyLinkLabel</em>.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {langs.map(lang => {
          const t = all[lang]
          return (
            <section
              key={lang}
              className="flex flex-col gap-3 rounded-xl border border-white/15 bg-white/[0.02] p-5"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest font-mono">{lang}</h2>
                <code className="text-xs text-white/40 font-mono">lib/i18n/locales/{lang}/cookie.ts</code>
              </div>

              <Field label="message" value={t.message} />
              <Field label="policyLinkLabel" value={t.policyLinkLabel} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="accept" value={t.accept} />
                <Field label="decline" value={t.decline} />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-widest">{label}</span>
      <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 font-mono whitespace-pre-wrap break-words">
        {value}
      </div>
    </div>
  )
}
