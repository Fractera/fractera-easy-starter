'use client'

import { useState } from 'react'

const LANGS = ['en', 'ru', 'es', 'de', 'fr', 'pt', 'zh', 'ja', 'ar', 'ko', 'hi', 'it']
const BASE = 'https://fractera.ai'

type MetaTag = Record<string, string>
type AuditResult = {
  url: string
  htmlLang: string | null
  title: string | null
  meta: MetaTag[]
  links: MetaTag[]
  jsonLd: unknown[]
  error?: string
}

export default function SeoDebugPage() {
  const [lang, setLang] = useState('en')
  const [result, setResult] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/debug/seo?url=${BASE}/${lang}`)
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const hreflangLinks = result?.links.filter(l => l.rel === 'alternate' && l.hreflang) ?? []
  const canonicalLink = result?.links.find(l => l.rel === 'canonical')
  const descMeta = result?.meta.find(m => m.name === 'description')
  const robotsMeta = result?.meta.find(m => m.name === 'robots')
  const ogTitle = result?.meta.find(m => m.property === 'og:title')
  const ogImage = result?.meta.find(m => m.property === 'og:image')

  const s = { fontFamily: 'monospace', fontSize: '13px' }

  return (
    <div style={{ ...s, padding: '32px', maxWidth: '960px', margin: '0 auto', color: '#e5e5e5', background: '#0a0a0a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '18px', margin: '0 0 24px' }}>SEO Head Auditor</h1>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{ background: '#111', color: '#e5e5e5', border: '1px solid #333', borderRadius: '6px', padding: '8px 12px', fontSize: '14px' }}
        >
          {LANGS.map(l => <option key={l} value={l}>{l} — {BASE}/{l}</option>)}
        </select>
        <button
          onClick={run}
          disabled={loading}
          style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Fetching…' : 'Audit'}
        </button>
      </div>

      {result?.error && (
        <div style={{ background: '#2a1010', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#f87171' }}>
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <>
          {/* Quick summary */}
          <Section title="Summary">
            <Row label="URL" value={result.url} />
            <Row label="html lang=" value={result.htmlLang ?? '❌ missing'} ok={result.htmlLang === lang} />
            <Row label="<title>" value={result.title ?? '❌ missing'} ok={!!result.title} />
            <Row label="canonical" value={canonicalLink?.href ?? '❌ missing'} ok={!!canonicalLink} />
            <Row label="description" value={descMeta?.content ?? '❌ missing'} ok={!!descMeta} />
            <Row label="robots" value={robotsMeta?.content ?? '❌ missing'} ok={!!robotsMeta} />
            <Row label="og:title" value={ogTitle?.content ?? '❌ missing'} ok={!!ogTitle} />
            <Row label="og:image" value={ogImage?.content ?? '❌ missing'} ok={!!ogImage} />
          </Section>

          {/* hreflang */}
          <Section title={`hreflang alternates (${hreflangLinks.length} found — expect 13)`}>
            {hreflangLinks.length === 0 && <p style={{ color: '#f87171', margin: 0 }}>❌ No hreflang links found</p>}
            {hreflangLinks.map((l, i) => (
              <Row key={i} label={l.hreflang} value={l.href}
                ok={l.hreflang === 'x-default' || LANGS.includes(l.hreflang)}
              />
            ))}
            {!hreflangLinks.find(l => l.hreflang === 'x-default') && (
              <Row label="x-default" value="❌ MISSING" ok={false} />
            )}
          </Section>

          {/* JSON-LD */}
          <Section title={`JSON-LD schemas (${result.jsonLd.length} found)`}>
            {result.jsonLd.length === 0 && <p style={{ color: '#f87171', margin: 0 }}>❌ No JSON-LD found</p>}
            {result.jsonLd.map((schema: unknown, i) => {
              const s = schema as Record<string, unknown>
              return (
                <div key={i} style={{ marginBottom: '12px', background: '#0f1117', border: '1px solid #1e2130', borderRadius: '6px', padding: '12px' }}>
                  <p style={{ margin: '0 0 8px', color: '#60a5fa', fontSize: '12px' }}>
                    @type: {String(s['@type'] ?? '?')}
                  </p>
                  <pre style={{ margin: 0, fontSize: '11px', color: '#94a3b8', overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              )
            })}
          </Section>

          {/* All meta */}
          <Section title="All <meta> tags">
            {result.meta.map((m, i) => (
              <Row key={i}
                label={m.name ?? m.property ?? m['http-equiv'] ?? '?'}
                value={m.content ?? JSON.stringify(m)}
              />
            ))}
          </Section>
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>{title}</h2>
      <div style={{ background: '#111', border: '1px solid #1f2937', borderRadius: '8px', padding: '4px 0' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px', padding: '8px 16px', borderBottom: '1px solid #1a1a1a' }}>
      <span style={{ color: '#6b7280', fontSize: '12px', wordBreak: 'break-all' }}>{label}</span>
      <span style={{
        fontSize: '12px',
        wordBreak: 'break-all',
        color: ok === false ? '#f87171' : ok === true ? '#4ade80' : '#e5e5e5',
      }}>{value}</span>
    </div>
  )
}
