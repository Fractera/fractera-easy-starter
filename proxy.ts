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

const PARTNER_APEX = 'partners.fractera.ai'

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
  // partners.fractera.ai/<lang>/<slug> is an alias for fractera.ai/<lang>/partners/<slug>.
  // The 'partners' segment is implicit in the subdomain. Apex bounces to the
  // program description page on the main domain.
  if (host === PARTNER_APEX) {
    if (pathname === '/' || pathname === '') {
      const target = request.nextUrl.clone()
      target.host = 'fractera.ai'
      target.pathname = '/en/partners'
      return NextResponse.redirect(target)
    }
    const segments = pathname.split('/').filter(Boolean)
    const first = segments[0]
    if (SUPPORTED_LANGUAGES.includes(first)) {
      const rest = segments.slice(1).join('/')
      const url = request.nextUrl.clone()
      url.pathname = rest ? `/${first}/partners/${rest}` : `/${first}/partners`
      const res = NextResponse.rewrite(url)
      res.headers.set('x-lang', first)
      return withLangCookie(res, first)
    }
    // Path has no lang prefix — detect lang and redirect (stay on partners host).
    const lang = detectLang(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
    return withLangCookie(NextResponse.redirect(url), lang)
  }

  // Skip API routes
  if (pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/debug')) {
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
