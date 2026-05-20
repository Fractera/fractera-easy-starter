import { NextRequest, NextResponse } from 'next/server'

// Edge runtime: no Prisma here. We only parse the host header and rewrite —
// the partner-mirror page does the DB lookup on the Node side.

const PARTNER_DOMAIN_SUFFIX = '.partners.fractera.ai'
const PARTNER_APEX = 'partners.fractera.ai'
const PARTNER_SLUG_RE = /^([a-z0-9][a-z0-9-]{0,62})\.partners\.fractera\.ai$/i

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase()
  const url = request.nextUrl.clone()

  // Apex partner domain (no slug) — bounce to the partner-program description.
  if (host === PARTNER_APEX) {
    const target = request.nextUrl.clone()
    target.host = 'fractera.ai'
    target.pathname = '/en/partners'
    return NextResponse.redirect(target)
  }

  // Partner mirror subdomain — internal rewrite, browser URL stays the same.
  if (host.endsWith(PARTNER_DOMAIN_SUFFIX)) {
    const match = host.match(PARTNER_SLUG_RE)
    if (!match) {
      // Malformed subdomain (e.g. uppercase only, illegal chars) — 404.
      url.pathname = '/partner-mirror/__not_found__'
      return NextResponse.rewrite(url)
    }
    const slug = match[1].toLowerCase()
    const rest = url.pathname === '/' ? '' : url.pathname
    url.pathname = `/partner-mirror/${slug}${rest}`
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-partner-slug', slug)
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  // Main domain or anything else — pass through.
  return NextResponse.next()
}

export const config = {
  matcher: [
    // All requests except static assets and Next internals.
    '/((?!_next|api/auth|favicon|robots|sitemap|fractera-logo|fractera-snipet|apple-touch-icon|android-chrome).*)',
  ],
}
