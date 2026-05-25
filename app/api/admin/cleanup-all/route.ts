import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

// Records that must NEVER be deleted by cleanup-all.
// - Essential infrastructure for fractera.ai itself: apex, www, partners, dash, dashboard
// - Email: MX/TXT/SPF/DKIM/DMARC records (anything not A/CNAME — see TYPE_BLOCKLIST)
// - Cloudflare-internal: names starting with `_`
const ESSENTIAL_EXACT_NAMES = new Set([
  'fractera.ai',
  'www.fractera.ai',
  'partners.fractera.ai',
  'dash.fractera.ai',
  'dashboard.fractera.ai',
  'mail.fractera.ai',
  'static.fractera.ai',
  'cdn.fractera.ai',
])

// Only A and CNAME records are considered for deletion. Everything else
// (MX, TXT, CAA, NS, SOA, SRV, SVCB, HTTPS, etc.) is kept unconditionally.
const TYPE_DELETABLE = new Set(['A', 'AAAA', 'CNAME'])

type CfRecord = {
  id: string
  type: string
  name: string
  content: string
  proxied: boolean
  modified_on?: string
  created_on?: string
}

async function listAllDnsRecords(zoneId: string, token: string): Promise<CfRecord[]> {
  const all: CfRecord[] = []
  let page = 1
  while (true) {
    const res = await fetch(
      `${CLOUDFLARE_API}/zones/${zoneId}/dns_records?per_page=100&page=${page}`,
      { headers: { 'Authorization': `Bearer ${token}` } },
    )
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`CF list page=${page} failed: ${res.status} ${text.slice(0, 200)}`)
    }
    const json = await res.json()
    const items: CfRecord[] = json?.result ?? []
    all.push(...items)
    const totalPages = json?.result_info?.total_pages ?? 1
    if (page >= totalPages) break
    page += 1
  }
  return all
}

function shouldDelete(rec: CfRecord): boolean {
  if (!TYPE_DELETABLE.has(rec.type)) return false
  if (rec.name.startsWith('_')) return false
  if (ESSENTIAL_EXACT_NAMES.has(rec.name)) return false
  return true
}

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const execute = req.nextUrl.searchParams.get('execute') === 'true'
  const keepActive = req.nextUrl.searchParams.get('keepActive') === 'true'

  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!zoneId || !token) {
    return NextResponse.json({ error: 'Cloudflare env missing' }, { status: 500 })
  }

  // === DNS analysis ===
  const allRecords = await listAllDnsRecords(zoneId, token)
  const toDelete = allRecords.filter(shouldDelete)
  const kept = allRecords.filter(r => !shouldDelete(r))

  // === DB analysis ===
  const tokenWhere = keepActive ? { status: { not: 'active' as const } } : {}
  const tokensToDelete = await db.serverToken.findMany({
    where: tokenWhere,
    select: { id: true, token: true, subdomain: true, status: true, serverIp: true, createdAt: true },
  })
  const subsToCancel = await db.subscription.findMany({
    where: keepActive
      ? { status: { not: 'cancelled' }, planId: 'free' }
      : { status: { not: 'cancelled' } },
    select: { id: true, planId: true, userId: true, status: true },
  })

  const plan = {
    dns: {
      total: allRecords.length,
      essential_kept: kept.length,
      to_delete: toDelete.length,
      sample_to_delete: toDelete.slice(0, 20).map(r => ({ id: r.id, name: r.name, type: r.type, content: r.content })),
      sample_kept: kept.slice(0, 10).map(r => ({ name: r.name, type: r.type })),
    },
    db: {
      server_tokens_to_delete: tokensToDelete.length,
      subscriptions_to_cancel: subsToCancel.length,
      sample_tokens: tokensToDelete.slice(0, 10).map(t => ({ id: t.id, subdomain: t.subdomain, status: t.status, ip: t.serverIp })),
    },
    flags: { execute, keepActive },
  }

  if (!execute) {
    return NextResponse.json({ ...plan, mode: 'dry-run', hint: 'Re-run with ?execute=true to actually delete' })
  }

  // === Execute deletes ===
  let dnsDeleted = 0
  const dnsErrors: { name: string; err: string }[] = []
  // Sequential delete — CF API rate limit is generous but bursts of 100+ parallel can trip it
  for (const rec of toDelete) {
    try {
      const res = await fetch(`${CLOUDFLARE_API}/zones/${zoneId}/dns_records/${rec.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        dnsDeleted += 1
      } else {
        const text = await res.text().catch(() => '')
        dnsErrors.push({ name: rec.name, err: `${res.status} ${text.slice(0, 100)}` })
      }
    } catch (err) {
      dnsErrors.push({ name: rec.name, err: err instanceof Error ? err.message : String(err) })
    }
  }

  let tokensDeleted = 0
  let subsCancelled = 0
  try {
    const result = await db.serverToken.deleteMany({ where: tokenWhere })
    tokensDeleted = result.count
  } catch (err) {
    console.error('[cleanup-all] serverToken.deleteMany failed', err)
  }
  try {
    const result = await db.subscription.updateMany({
      where: keepActive
        ? { status: { not: 'cancelled' }, planId: 'free' }
        : { status: { not: 'cancelled' } },
      data: { status: 'cancelled' },
    })
    subsCancelled = result.count
  } catch (err) {
    console.error('[cleanup-all] subscription.updateMany failed', err)
  }

  return NextResponse.json({
    mode: 'executed',
    dns: { ...plan.dns, deleted: dnsDeleted, errors: dnsErrors },
    db: { ...plan.db, server_tokens_deleted: tokensDeleted, subscriptions_cancelled: subsCancelled },
    flags: { execute, keepActive },
  })
}
