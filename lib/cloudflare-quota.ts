import { sendDnsQuotaWarningEmail, sendDnsQuotaCriticalEmail } from '@/lib/email'

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

// Plan-to-limit map. Source: Cloudflare AI agent confirmation 2026-05-25.
// Free zones created after 2024-09-01 → 200 records (post-cutoff).
// ACM is a $10/mo add-on; does NOT raise this limit. CLAUDE.md rule 15.
const PLAN_LIMITS: Record<string, number> = {
  'Free Website': 200,
  'Free': 200,
  'Pro Website': 3500,
  'Pro': 3500,
  'Business Website': 3500,
  'Business': 3500,
  'Enterprise Website': 5000,
  'Enterprise': 5000,
}

const NEXT_TIER: Record<string, { name: string; limit: number; monthly: string } | undefined> = {
  'Free Website': { name: 'Pro', limit: 3500, monthly: '$25/mo' },
  'Free':         { name: 'Pro', limit: 3500, monthly: '$25/mo' },
  'Pro Website':  { name: 'Enterprise', limit: 5000, monthly: 'contact sales' },
  'Pro':          { name: 'Enterprise', limit: 5000, monthly: 'contact sales' },
  'Business Website': { name: 'Enterprise', limit: 5000, monthly: 'contact sales' },
  'Business':         { name: 'Enterprise', limit: 5000, monthly: 'contact sales' },
}

const WARN_RATIO = 0.8   // 80% — send warning email
const CRIT_RATIO = 1.0   // 100% — block deploys

export type QuotaStatus = 'ok' | 'warning' | 'critical'

export interface QuotaCheck {
  status: QuotaStatus
  count: number
  limit: number
  planTier: string
  zoneId: string
  emailSent?: 'warning' | 'critical' | null
}

interface ZoneInfo {
  count: number
  planTier: string
}

async function fetchZoneInfo(): Promise<ZoneInfo> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!zoneId || !token) throw new Error('CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN missing')

  // 1. Record count via result_info.total_count (cheap — per_page=1)
  const listRes = await fetch(
    `${CLOUDFLARE_API}/zones/${zoneId}/dns_records?per_page=1`,
    { headers: { 'Authorization': `Bearer ${token}` } },
  )
  if (!listRes.ok) {
    const errText = await listRes.text().catch(() => '')
    throw new Error(`Cloudflare list dns_records failed: ${listRes.status} ${errText.slice(0, 200)}`)
  }
  const listJson = await listRes.json()
  const count: number = listJson?.result_info?.total_count ?? 0

  // 2. Plan tier via zone GET
  const zoneRes = await fetch(`${CLOUDFLARE_API}/zones/${zoneId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!zoneRes.ok) {
    const errText = await zoneRes.text().catch(() => '')
    throw new Error(`Cloudflare zone GET failed: ${zoneRes.status} ${errText.slice(0, 200)}`)
  }
  const zoneJson = await zoneRes.json()
  const planTier: string = zoneJson?.result?.plan?.name ?? 'Unknown'

  return { count, planTier }
}

// Try to suppress repeated emails — bootstrap quota check runs per deploy,
// so warning email could fire 5× in 10 minutes. Use a KV flag with TTL.
// Best-effort: if KV write fails, we still send email (better duplicate than
// silent failure).
async function shouldSendOnce(key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const { kv } = await import('@/lib/kv')
    if (typeof (kv as unknown as { setnx?: unknown }).setnx === 'function') {
      const ok = await (kv as unknown as { setnx: (k: string, v: string, opts?: unknown) => Promise<number> }).setnx(key, '1', { ex: ttlSeconds })
      return ok === 1
    }
    // Fallback: get + set (race-prone but rare here)
    const existing = await (kv as unknown as { get: (k: string) => Promise<unknown> }).get(key)
    if (existing) return false
    await (kv as unknown as { set: (k: string, v: string, opts?: unknown) => Promise<unknown> }).set(key, '1', { ex: ttlSeconds })
    return true
  } catch {
    return true
  }
}

// Public: read the current DNS quota state. Side-effect: send warning/critical
// emails to admin@fractera.ai if thresholds are crossed (idempotent — 4h
// suppression window per state).
export async function checkDnsQuota(blockedDomain?: string): Promise<QuotaCheck> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? ''
  const { count, planTier } = await fetchZoneInfo()
  const limit = PLAN_LIMITS[planTier] ?? 200
  const nextTier = NEXT_TIER[planTier]
  const ratio = count / limit

  let status: QuotaStatus = 'ok'
  if (ratio >= CRIT_RATIO) status = 'critical'
  else if (ratio >= WARN_RATIO) status = 'warning'

  let emailSent: 'warning' | 'critical' | null = null
  if (status === 'critical') {
    if (await shouldSendOnce(`quota:critical:${planTier}:${Math.floor(count / 5)}`, 4 * 60 * 60)) {
      try {
        await sendDnsQuotaCriticalEmail('admin@fractera.ai', { current: count, limit, planTier, blockedDomain, nextTier })
        emailSent = 'critical'
      } catch (err) {
        console.error('[quota] critical email failed', err)
      }
    }
  } else if (status === 'warning') {
    if (await shouldSendOnce(`quota:warning:${planTier}:${Math.floor(count / 5)}`, 4 * 60 * 60)) {
      try {
        await sendDnsQuotaWarningEmail('admin@fractera.ai', { current: count, limit, planTier, nextTier })
        emailSent = 'warning'
      } catch (err) {
        console.error('[quota] warning email failed', err)
      }
    }
  }

  return { status, count, limit, planTier, zoneId, emailSent }
}
