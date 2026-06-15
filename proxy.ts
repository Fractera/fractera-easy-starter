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

// Public content pages an external agent / crawler / partner may link in a
// language we do not ship (e.g. /ko/partners for Korean) or with a guessed
// slug (/ar/term). These must NEVER 404 — they resolve to the page in the
// requested language if it is supported, otherwise the default language.
// Scoped to KNOWN slugs so genuine typos still return an honest 404.
// Keep in sync with app/[lang]/<slug>/page.tsx (12 public slugs + home).
const KNOWN_PAGE_SLUGS = new Set([
  'privacy', 'terms', 'refund', 'cookies',
  'partners', 'regional-partners',
  'cases', 'blog', 'sponsors', 'skills', 'product-loop',
])

// Common singular / synonym guesses an AI or crawler invents → canonical slug.
const SLUG_ALIASES: Record<string, string> = {
  term: 'terms', tos: 'terms', 'terms-of-service': 'terms',
  'privacy-policy': 'privacy', policy: 'privacy',
  cookie: 'cookies', 'cookie-policy': 'cookies',
  refunds: 'refund', 'refund-policy': 'refund',
  partner: 'partners', 'regional-partner': 'regional-partners', sponsor: 'sponsors',
}

const canonSlug = (s: string): string => SLUG_ALIASES[s] ?? s

// A bare 2–3 letter lowercase segment looks like an ISO language code. Used to
// recognise an INVENTED locale prefix (one not in SUPPORTED_LANGUAGES) so we can
// strip it instead of 404-ing. Real page slugs are all longer than 3 chars.
const LOCALE_LIKE = /^[a-z]{2,3}$/

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

  // Single canonical reference page — served at the bare /mcp-info with NO lang
  // prefix (one indexable URL, no per-language duplicates). Pass through so it is
  // NOT redirected to /<lang>/mcp-info. Bilingual via ?lang=ru on the same URL.
  if (pathname === '/mcp-info' || pathname.startsWith('/mcp-info/')) {
    return NextResponse.next()
  }

  // Same deal: the AI Workspace architecture reference is a single English root
  // URL (no lang prefix). Pass through so it is NOT redirected to /<lang>/… .
  if (pathname === '/ai-workspace-architect' || pathname.startsWith('/ai-workspace-architect/')) {
    return NextResponse.next()
  }

  // Same deal: the AI Development Loop reference is a single English root URL.
  // It MUST never get a language version — pass it through unchanged so the proxy
  // never rewrites it under a /<lang>/ prefix.
  if (pathname === '/ai-development-loop' || pathname.startsWith('/ai-development-loop/')) {
    return NextResponse.next()
  }

  // Same deal: the Token Economics reference is a single English root URL.
  // EN-only by design — pass it through so it is never rewritten under /<lang>/.
  if (pathname === '/token-economics' || pathname.startsWith('/token-economics/')) {
    return NextResponse.next()
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

  const segs = pathname.split('/').filter(Boolean)

  // Multi-language mode: lang already in URL.
  if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
    // Fix a guessed / singular slug inside a real language so footer pages
    // always resolve: /ru/term → /ru/terms, /en/cookie → /en/cookies.
    if (segs.length >= 2) {
      const canon = canonSlug(segs[1])
      if (canon !== segs[1] && KNOWN_PAGE_SLUGS.has(canon)) {
        const url = request.nextUrl.clone()
        url.pathname = `/${firstSegment}/${[canon, ...segs.slice(2)].join('/')}`
        return withLangCookie(NextResponse.redirect(url, 308), firstSegment)
      }
    }
    const res = NextResponse.next()
    res.headers.set('x-lang', firstSegment)
    return withLangCookie(res, firstSegment)
  }

  // First segment is an INVENTED locale (not one we ship), e.g. /ko, /ar, /hy.
  // If the page after it is one we know, drop the phantom locale and serve the
  // page in the default language — never 404 a real page just because an agent
  // assumed we localise that language. A bare invented locale → default home.
  if (LOCALE_LIKE.test(firstSegment) && !KNOWN_PAGE_SLUGS.has(firstSegment)) {
    if (segs.length >= 2) {
      const canon = canonSlug(segs[1])
      if (KNOWN_PAGE_SLUGS.has(canon)) {
        const url = request.nextUrl.clone()
        url.pathname = `/${DEFAULT_LANGUAGE}/${[canon, ...segs.slice(2)].join('/')}`
        return withLangCookie(NextResponse.redirect(url, 308), DEFAULT_LANGUAGE)
      }
    } else {
      const url = request.nextUrl.clone()
      url.pathname = `/${DEFAULT_LANGUAGE}`
      return withLangCookie(NextResponse.redirect(url, 308), DEFAULT_LANGUAGE)
    }
  }

  // Root-level known page with no lang prefix: /terms, /term, /partners.
  // Send it to the detected language's canonical URL (instead of falling through
  // to the generic redirect, which would not normalise a guessed slug).
  {
    const canon = canonSlug(firstSegment)
    if (KNOWN_PAGE_SLUGS.has(canon)) {
      const lang0 = detectLang(request)
      const url = request.nextUrl.clone()
      url.pathname = `/${lang0}/${[canon, ...segs.slice(1)].join('/')}`
      return withLangCookie(NextResponse.redirect(url, 308), lang0)
    }
  }

  // Detect lang.
  const lang = detectLang(request)

  // SEO: keep the bare root `/` REWRITING (not redirecting) to `/${DEFAULT_LANGUAGE}`
  // when the chosen lang IS the default. Crawlers and direct backlinks to
  // fractera.ai/ get real HTML at the root, not a 307 that drops PageRank.
  // For non-default detected languages, redirect to /<lang>/ as before.
  if (pathname === '/' || pathname === '') {
    if (lang === DEFAULT_LANGUAGE) {
      const url = request.nextUrl.clone()
      url.pathname = `/${DEFAULT_LANGUAGE}`
      const res = NextResponse.rewrite(url)
      res.headers.set('x-lang', lang)
      // Hint to crawlers + caches that the served HTML at `/` IS the
      // canonical English page (see metadata generateMetadata for the
      // matching <link rel="canonical">).
      res.headers.set('Vary', 'Cookie, Accept-Language')
      return withLangCookie(res, lang)
    }
    // Non-default detected lang — redirect so the URL shown matches the
    // content. (e.g. Russian Accept-Language → /ru.)
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}`
    return withLangCookie(NextResponse.redirect(url), lang)
  }

  // Non-root path without lang prefix — redirect as before.
  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname}`
  return withLangCookie(NextResponse.redirect(url), lang)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*|api).*)'],
}
