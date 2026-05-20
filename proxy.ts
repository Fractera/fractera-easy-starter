import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  SINGLE_LANG_MODE,
} from './config/translations/translations.config'

export { SUPPORTED_LANGUAGES }

const LOCALE_COOKIE = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60

const PARTNER_DOMAIN_SUFFIX = '.partners.fractera.ai'
const PARTNER_APEX = 'partners.fractera.ai'
const PARTNER_SLUG_RE = /^([a-z0-9][a-z0-9-]{0,62})\.partners\.fractera\.ai$/i

function detectLang(request: NextRequest): string {
  // Priority 1: cookie
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && SUPPORTED_LANGUAGES.includes(cookie)) return cookie

  // Priority 2: Accept-Language header
  const acceptLang = request.headers.get('accept-language') ?? ''
  const matched = acceptLang
    .split(',')
    .map(l => ({ code: l.split(';')[0].trim().split('-')[0].toLowerCase(), q: parseFloat(l.split(';q=')[1] ?? '1') }))
    .sort((a, b) => b.q - a.q)
    .find(l => SUPPORTED_LANGUAGES.includes(l.code))

  return matched?.code ?? DEFAULT_LANGUAGE
}

function withLangCookie(response: NextResponse, lang: string): NextResponse {
  response.cookies.set(LOCALE_COOKIE, lang, { maxAge: COOKIE_MAX_AGE, path: '/', sameSite: 'lax' })
  return response
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const host = (request.headers.get('host') ?? '').toLowerCase()

  // ── Partner subdomain handling (must run BEFORE lang logic) ──
  // Apex partners.fractera.ai with no slug → bounce to the program description.
  if (host === PARTNER_APEX) {
    const target = request.nextUrl.clone()
    target.host = 'fractera.ai'
    target.pathname = '/en/partners'
    return NextResponse.redirect(target)
  }
  // <slug>.partners.fractera.ai → internal rewrite to /partner-mirror/<slug>/...
  if (host.endsWith(PARTNER_DOMAIN_SUFFIX)) {
    const match = host.match(PARTNER_SLUG_RE)
    const url = request.nextUrl.clone()
    if (!match) {
      url.pathname = '/partner-mirror/__not_found__'
      return NextResponse.rewrite(url)
    }
    const slug = match[1].toLowerCase()
    const rest = pathname === '/' ? '' : pathname
    url.pathname = `/partner-mirror/${slug}${rest}`
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-partner-slug', slug)
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  // Skip API routes
  if (pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/debug')) {
    return NextResponse.next()
  }

  // Skip partner-mirror — handled directly, no lang prefix needed.
  if (pathname.startsWith('/partner-mirror')) {
    return NextResponse.next()
  }

  // Skip static assets
  if (/\.\w+$/.test(pathname)) return NextResponse.next()

  const firstSegment = pathname.split('/')[1]

  // Single-language mode: hide lang prefix from public URLs
  if (SINGLE_LANG_MODE) {
    const singleLang = SUPPORTED_LANGUAGES[0]
    if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
      const without = pathname.replace(`/${singleLang}`, '') || '/'
      const url = request.nextUrl.clone()
      url.pathname = without
      return withLangCookie(NextResponse.redirect(url, 301), singleLang)
    }
    const url = request.nextUrl.clone()
    url.pathname = `/${singleLang}${pathname}`
    return withLangCookie(NextResponse.rewrite(url), singleLang)
  }

  // Multi-language mode: pass through if lang already in URL
  if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
    const res = NextResponse.next()
    res.headers.set('x-lang', firstSegment)
    return withLangCookie(res, firstSegment)
  }

  // Detect and redirect
  const lang = detectLang(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
  return withLangCookie(NextResponse.redirect(url), lang)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*|api).*)'],
}
