// Helpers for working with the ServerToken.subdomain field.
//
// The "subdomain" identifier stored in the DB can be one of two forms:
//   1. A real DNS subdomain on fractera.ai (legacy 4th-level): "pure-fox-77.fractera.ai"
//   2. A synthetic IP-mode identifier: either "ip-<IPv4>" or just "<IPv4>"
//      (bootstrap.sh sends SUBDOMAIN=$SERVER_IP, the install route stores
//       "ip-<IP>", so both shapes coexist in the DB after the IP-first
//       migration).
//
// These helpers normalise + render so the UI/email can branch on a single
// well-defined "mode".

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

export type SubdomainShape =
  | { mode: 'ip'; ip: string }
  | { mode: 'domain'; subdomain: string }

export function classifySubdomain(raw: string | null | undefined): SubdomainShape {
  const s = (raw ?? '').trim()
  if (!s) return { mode: 'ip', ip: '' }
  // Synthetic "ip-<IP>" form set by /api/install route.
  if (s.startsWith('ip-')) {
    const ip = s.slice(3)
    if (IPV4.test(ip)) return { mode: 'ip', ip }
  }
  // Bare IPv4 (e.g. bootstrap.sh ping sends SUBDOMAIN=$SERVER_IP).
  if (IPV4.test(s)) return { mode: 'ip', ip: s }
  // Anything else is a real fractera.ai subdomain.
  return { mode: 'domain', subdomain: s }
}

// URL builders. IP-mode → plain HTTP with ports. Domain-mode → HTTPS subdomains.
export function buildUrls(raw: string | null | undefined) {
  const shape = classifySubdomain(raw)
  if (shape.mode === 'ip') {
    const ip = shape.ip
    return {
      mode: 'ip' as const,
      ip,
      appUrl:    `http://${ip}:3000`,
      adminUrl:  `http://${ip}:3002`,
      authUrl:   `http://${ip}:3001`,
      mediaUrl:  `http://${ip}:3300`,
      hermesUrl: `http://${ip}:9119`,
      brainUrl:  `http://${ip}:9621`,
      appLabel:    ip,
      adminLabel:  `${ip}:3002`,
      hermesLabel: `${ip}:9119`,
    }
  }
  const sub = shape.subdomain
  return {
    mode: 'domain' as const,
    ip: null as string | null,
    appUrl:    `https://${sub}`,
    adminUrl:  `https://admin.${sub}`,
    authUrl:   `https://auth.${sub}`,
    mediaUrl:  `https://data.${sub}`,
    hermesUrl: `https://hermes.${sub}`,
    brainUrl:  `https://lightrag.${sub}`,
    appLabel:    sub,
    adminLabel:  `admin.${sub}`,
    hermesLabel: `hermes.${sub}`,
  }
}
