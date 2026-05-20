import trustedProvidersJson from '@/config/trusted-providers.json'

export type TrustedProvider = {
  domain: string
  name: string
  category: string
}

export const TRUSTED_PROVIDERS: TrustedProvider[] = trustedProvidersJson.providers

// Normalised list for fast lookups (lowercase, sorted by length descending so
// 'timeweb.ru' wins over 'web.ru' if both were ever present).
const TRUSTED_DOMAINS: string[] = TRUSTED_PROVIDERS
  .map(p => p.domain.toLowerCase())
  .sort((a, b) => b.length - a.length)

function extractHost(input: string): string | null {
  if (!input) return null
  try {
    const u = new URL(input)
    return u.hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Whether the given URL points to a trusted provider domain (or any of its
 * subdomains). `wm.timeweb.ru` matches `timeweb.ru`; `https://contabo.com/...`
 * matches `contabo.com`.
 */
export function isTrustedUrl(url: string): boolean {
  const host = extractHost(url)
  if (!host) return false
  return TRUSTED_DOMAINS.some(domain => host === domain || host.endsWith('.' + domain))
}

/** Look up the matching provider entry for a URL (used to render badges / names). */
export function findTrustedProvider(url: string): TrustedProvider | null {
  const host = extractHost(url)
  if (!host) return null
  return TRUSTED_PROVIDERS.find(p => {
    const d = p.domain.toLowerCase()
    return host === d || host.endsWith('.' + d)
  }) ?? null
}
