import trustedProvidersJson from '@/config/trusted-providers.json'
import { db } from '@/lib/db'

export type TrustedProvider = {
  domain: string
  name: string
  category: string
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
    const rows = await db.trustedHosting.findMany({ select: { domain: true, name: true, category: true } })
    if (rows.length === 0) {
      // First boot after migration — seed from the static list so the existing
      // partner-page whitelist keeps working without admin intervention.
      try {
        await db.trustedHosting.createMany({
          data: TRUSTED_PROVIDERS_FALLBACK.map(p => ({
            domain: p.domain.toLowerCase(),
            name: p.name,
            category: p.category,
          })),
          skipDuplicates: true,
        })
        return await db.trustedHosting.findMany({ select: { domain: true, name: true, category: true } })
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
