// DEBUG PAGE — remove before launch
import { db } from '@/lib/db'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

type VarRow = {
  name: string
  value: string
  ok: boolean
  note?: string
}

function maskSecret(val: string | undefined, showChars = 6): string {
  if (!val) return '❌ NOT SET'
  if (val.length <= showChars) return '✅ ' + '*'.repeat(val.length)
  return '✅ ' + val.slice(0, showChars) + '…' + val.slice(-4)
}

function showPartial(val: string | undefined, showChars = 20): string {
  if (!val) return '❌ NOT SET'
  return '✅ ' + val.slice(0, showChars) + (val.length > showChars ? '…' : '')
}

export default async function DebugPage() {
  // --- Check DB ---
  let dbStatus = '❌ ERROR'
  let userCount = '?'
  let serverTokenCount = '?'
  let latestToken: { id: string; status: string; deploySessionId: string | null; subdomain: string | null; createdAt: Date } | null = null

  try {
    await db.$queryRaw`SELECT 1`
    dbStatus = '✅ Connected'
    userCount = String(await db.user.count())
    serverTokenCount = String(await db.serverToken.count())
    latestToken = await db.serverToken.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, deploySessionId: true, subdomain: true, createdAt: true },
    })
  } catch (e) {
    dbStatus = '❌ ' + String(e).slice(0, 120)
  }

  // --- Check Redis ---
  let redisStatus = '❌ ERROR'
  try {
    const kv = Redis.fromEnv()
    await kv.ping()
    redisStatus = '✅ Connected'
  } catch (e) {
    redisStatus = '❌ ' + String(e).slice(0, 120)
  }

  const groups: { title: string; rows: VarRow[] }[] = [
    {
      title: '🚀 Deploy (Stripe one-click)',
      rows: [
        { name: 'FRACTERA_DEPLOY_IP',       value: showPartial(process.env.FRACTERA_DEPLOY_IP, 20),       ok: !!process.env.FRACTERA_DEPLOY_IP,       note: 'IP сервера для деплоя после оплаты' },
        { name: 'FRACTERA_DEPLOY_USER',      value: showPartial(process.env.FRACTERA_DEPLOY_USER, 20),     ok: !!process.env.FRACTERA_DEPLOY_USER,      note: 'SSH логин' },
        { name: 'FRACTERA_DEPLOY_PASSWORD',  value: maskSecret(process.env.FRACTERA_DEPLOY_PASSWORD),      ok: !!process.env.FRACTERA_DEPLOY_PASSWORD,  note: 'SSH пароль' },
        { name: 'INSTALL_SCRIPT_SECRET',     value: maskSecret(process.env.INSTALL_SCRIPT_SECRET),         ok: !!process.env.INSTALL_SCRIPT_SECRET,     note: 'Секрет bootstrap → /api/progress' },
      ],
    },
    {
      title: '💳 Stripe',
      rows: [
        { name: 'STRIPE_SECRET_KEY',         value: maskSecret(process.env.STRIPE_SECRET_KEY),             ok: !!process.env.STRIPE_SECRET_KEY },
        { name: 'STRIPE_PRICE_ID',           value: showPartial(process.env.STRIPE_PRICE_ID, 30),          ok: !!process.env.STRIPE_PRICE_ID },
        { name: 'STRIPE_WEBHOOK_SECRET',     value: maskSecret(process.env.STRIPE_WEBHOOK_SECRET),         ok: !!process.env.STRIPE_WEBHOOK_SECRET },
      ],
    },
    {
      title: '🔐 Auth',
      rows: [
        { name: 'AUTH_SECRET',               value: maskSecret(process.env.AUTH_SECRET),                   ok: !!process.env.AUTH_SECRET },
        { name: 'AUTH_URL',                  value: showPartial(process.env.AUTH_URL, 40),                 ok: !!process.env.AUTH_URL,                 note: 'должен быть https://fractera.ai' },
        { name: 'GOOGLE_CLIENT_ID',          value: maskSecret(process.env.GOOGLE_CLIENT_ID, 20),          ok: !!process.env.GOOGLE_CLIENT_ID },
        { name: 'GOOGLE_CLIENT_SECRET',      value: maskSecret(process.env.GOOGLE_CLIENT_SECRET),          ok: !!process.env.GOOGLE_CLIENT_SECRET },
        { name: 'RESEND_API_KEY',            value: maskSecret(process.env.RESEND_API_KEY),                ok: !!process.env.RESEND_API_KEY },
        { name: 'AUTH_RESEND_FROM',          value: showPartial(process.env.AUTH_RESEND_FROM, 30),         ok: !!process.env.AUTH_RESEND_FROM },
      ],
    },
    {
      title: '🗄️ Database & Redis',
      rows: [
        { name: 'DATABASE_URL',              value: maskSecret(process.env.DATABASE_URL, 30),              ok: !!process.env.DATABASE_URL },
        { name: 'UPSTASH_REDIS_REST_URL',    value: maskSecret(process.env.UPSTASH_REDIS_REST_URL, 30),    ok: !!process.env.UPSTASH_REDIS_REST_URL },
        { name: 'UPSTASH_REDIS_REST_TOKEN',  value: maskSecret(process.env.UPSTASH_REDIS_REST_TOKEN),      ok: !!process.env.UPSTASH_REDIS_REST_TOKEN },
      ],
    },
  ]

  const totalMissing = groups.flatMap(g => g.rows).filter(r => !r.ok).length

  return (
    <div style={{ fontFamily: 'monospace', padding: '32px', maxWidth: '900px', margin: '0 auto', color: '#e5e5e5', background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 4px' }}>🔧 Fractera Debug — Environment</h1>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>DEBUG PAGE — remove before launch</p>
      </div>

      {/* Summary */}
      <div style={{ background: totalMissing > 0 ? '#2a1010' : '#0f2a0f', border: `1px solid ${totalMissing > 0 ? '#7f1d1d' : '#14532d'}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: totalMissing > 0 ? '#f87171' : '#4ade80' }}>
          {totalMissing > 0 ? `❌ ${totalMissing} variable(s) missing` : '✅ All variables set'}
        </p>
      </div>

      {/* Services */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Neon DB', value: dbStatus },
          { label: 'Upstash Redis', value: redisStatus },
          { label: 'Users in DB', value: userCount },
          { label: 'Server Tokens', value: serverTokenCount },
          { label: 'Latest Token Status', value: latestToken?.status ?? 'none' },
          { label: 'Latest deploySessionId', value: latestToken?.deploySessionId ? latestToken.deploySessionId.slice(0, 24) + '…' : 'none' },
        ].map(item => (
          <div key={item.label} style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666' }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: '13px', wordBreak: 'break-all' }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Env var groups */}
      {groups.map(group => (
        <div key={group.title} style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '14px', color: '#888', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{group.title}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <th style={{ textAlign: 'left', padding: '6px 12px', color: '#555', fontWeight: 'normal', width: '35%' }}>Variable</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', color: '#555', fontWeight: 'normal', width: '35%' }}>Value</th>
                <th style={{ textAlign: 'left', padding: '6px 12px', color: '#555', fontWeight: 'normal' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map(row => (
                <tr key={row.name} style={{ borderBottom: '1px solid #1a1a1a', background: row.ok ? 'transparent' : '#1a0000' }}>
                  <td style={{ padding: '8px 12px', color: '#ccc' }}>{row.name}</td>
                  <td style={{ padding: '8px 12px', color: row.ok ? '#4ade80' : '#f87171' }}>{row.value}</td>
                  <td style={{ padding: '8px 12px', color: '#555', fontSize: '11px' }}>{row.note ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <p style={{ fontSize: '11px', color: '#333', marginTop: '40px' }}>
        Generated at {new Date().toISOString()}
      </p>
    </div>
  )
}
