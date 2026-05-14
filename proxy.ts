import { NextRequest, NextResponse } from 'next/server'

export const SUPPORTED_LANGS = [
  'en', 'ru', 'es', 'de', 'fr', 'pt', 'zh', 'ja', 'ar', 'ko', 'hi', 'it',
]

const DEFAULT_LANG = 'en'

function detectLang(acceptLanguage: string): string {
  return (
    acceptLanguage
      .split(',')
      .map(l => l.split(';')[0].trim().split('-')[0].toLowerCase())
      .find(l => SUPPORTED_LANGS.includes(l)) ?? DEFAULT_LANG
  )
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Skip API, admin, debug routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/debug')
  ) {
    return NextResponse.next()
  }

  // Skip paths with file extensions (static assets, robots.txt, sitemap.xml, etc.)
  if (/\.\w+$/.test(pathname)) return NextResponse.next()

  // Pass through if already has a supported lang prefix
  const firstSegment = pathname.split('/')[1]
  if (SUPPORTED_LANGS.includes(firstSegment)) return NextResponse.next()

  // Detect language and redirect
  const lang = detectLang(request.headers.get('accept-language') ?? '')
  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
