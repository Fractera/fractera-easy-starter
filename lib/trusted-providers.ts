import trustedProvidersJson from '@/config/trusted-providers.json'
import { db } from '@/lib/db'

export type TrustedProvider = {
  domain: string
  name: string
  category: string
  isHosting?: boolean
  isRegistrar?: boolean
}

export type LinkKind = 'server' | 'domain'

// Resolve hosting/registrar flags, deriving sensible defaults from `category`
// when the explicit booleans are absent (older rows / JSON entries):
//   registrar → domain only · aff-network → both · vps/other → hosting only.
function resolveFlags(p: { category?: string; isHosting?: boolean | null; isRegistrar?: boolean | null }): { isHosting: boolean; isRegistrar: boolean } {
  if (typeof p.isHosting === 'boolean' || typeof p.isRegistrar === 'boolean') {
    return { isHosting: p.isHosting ?? false, isRegistrar: p.isRegistrar ?? false }
  }
  if (p.category === 'registrar') return { isHosting: false, isRegistrar: true }
  if (p.category === 'aff-network') return { isHosting: true, isRegistrar: true }
  return { isHosting: true, isRegistrar: false }
}

// Whether a whitelist entry is allowed for a given affiliate-link kind.
// Affiliate networks (cj.com, admitad…) wrap links for either kind, so they
// always pass — this also keeps pre-migration DB rows (whose isRegistrar
// column defaulted to false) usable for domain links.
function entryAllows(p: { category?: string; isHosting?: boolean | null; isRegistrar?: boolean | null }, kind: LinkKind): boolean {
  if (p.category === 'aff-network') return true
  const f = resolveFlags(p)
  return kind === 'domain' ? f.isRegistrar : f.isHosting
}

// Static seed list. Used in two situations:
//   1. As the source for the initial DB seed (first request after migration).
//   2. As a synchronous fallback for callers that can't await DB (client UI
//      datalist), so the trusted whitelist is never empty.
export const TRUSTED_PROVIDERS_FALLBACK: TrustedProvider[] = trustedProvidersJson.providers

// Cached DB snapshot. Refreshed lazily on first use after server boot.
let cached: { entries: TrustedProvider[]; loadedAt: number } | null = null
const CACHE_TTL_MS = 60_000

async function loadFromDb(): Promise<TrustedProvider[]> {
  try {
    const rows = await db.trustedHosting.findMany({ select: { domain: true, name: true, category: true, isHosting: true, isRegistrar: true } })
    if (rows.length === 0) {
      // First boot after migration — seed from the static list so the existing
      // partner-page whitelist keeps working without admin intervention.
      try {
        await db.trustedHosting.createMany({
          data: TRUSTED_PROVIDERS_FALLBACK.map(p => {
            const f = resolveFlags(p)
            return { domain: p.domain.toLowerCase(), name: p.name, category: p.category, isHosting: f.isHosting, isRegistrar: f.isRegistrar }
          }),
          skipDuplicates: true,
        })
        return await db.trustedHosting.findMany({ select: { domain: true, name: true, category: true, isHosting: true, isRegistrar: true } })
      } catch (err) {
        console.error('[trusted-providers] seed failed', err)
        return TRUSTED_PROVIDERS_FALLBACK
      }
    }
    return rows
  } catch (err) {
    console.error('[trusted-providers] DB read failed, using fallback', err)
    return TRUSTED_PROVIDERS_FALLBACK
  }
}

async function getEntries(): Promise<TrustedProvider[]> {
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) return cached.entries
  const entries = await loadFromDb()
  cached = { entries, loadedAt: Date.now() }
  return entries
}

export function invalidateTrustedHostingsCache() { cached = null }

// Synchronous facade (kept for the existing client-side datalist that
// imports TRUSTED_PROVIDERS at build time). Reflects whatever the most
// recent server-side fetch saw, falling back to the static list.
export const TRUSTED_PROVIDERS: TrustedProvider[] = TRUSTED_PROVIDERS_FALLBACK

function normaliseDomains(list: TrustedProvider[]): string[] {
  return list.map(p => p.domain.toLowerCase()).sort((a, b) => b.length - a.length)
}

function extractHost(input: string): string | null {
  if (!input) return null
  try { return new URL(input).hostname.toLowerCase() } catch { return null }
}

/**
 * Async, server-only check against the live DB whitelist. Use this in API
 * routes that handle PartnerLink writes — they all run server-side and can
 * await a single DB read (cached, costs ~0 after the first call).
 */
export async function isTrustedUrlAsync(url: string): Promise<boolean> {
  const host = extractHost(url)
  if (!host) return false
  const entries = await getEntries()
  const domains = normaliseDomains(entries)
  return domains.some(domain => host === domain || host.endsWith('.' + domain))
}

/**
 * Kind-aware server-only check against the live DB whitelist. Use on
 * PartnerLink write paths: a 'server' link must match a hosting-eligible
 * entry, a 'domain' link a registrar-eligible one (affiliate networks pass
 * for both). This is the authoritative check (replaces the old sync one).
 */
export async function isTrustedUrlForAsync(url: string, kind: LinkKind): Promise<boolean> {
  const host = extractHost(url)
  if (!host) return false
  const entries = await getEntries()
  return entries.some(e => {
    const d = e.domain.toLowerCase()
    return (host === d || host.endsWith('.' + d)) && entryAllows(e, kind)
  })
}

/**
 * Kind-aware synchronous check against the static fallback list — for
 * client-side UI badges only (the DB list may differ; authoritative checks
 * use isTrustedUrlForAsync).
 */
export function isTrustedUrlFor(url: string, kind: LinkKind): boolean {
  const host = extractHost(url)
  if (!host) return false
  return TRUSTED_PROVIDERS_FALLBACK.some(e => {
    const d = e.domain.toLowerCase()
    return (host === d || host.endsWith('.' + d)) && entryAllows(e, kind)
  })
}

/**
 * Synchronous check against the static fallback list. Used by client-side
 * UI badges where awaiting the DB is impossible. The admin-managed list may
 * differ — for authoritative server-side checks use isTrustedUrlAsync.
 */
export function isTrustedUrl(url: string): boolean {
  const host = extractHost(url)
  if (!host) return false
  const domains = normaliseDomains(TRUSTED_PROVIDERS_FALLBACK)
  return domains.some(domain => host === domain || host.endsWith('.' + domain))
}

export function findTrustedProvider(url: string): TrustedProvider | null {
  const host = extractHost(url)
  if (!host) return null
  return TRUSTED_PROVIDERS_FALLBACK.find(p => {
    const d = p.domain.toLowerCase()
    return host === d || host.endsWith('.' + d)
  }) ?? null
}
