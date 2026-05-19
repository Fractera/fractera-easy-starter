import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Usage: GET /api/debug/seo?url=https://fractera.ai/en
// No auth — read-only, public metadata audit tool
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const target = searchParams.get('url')

  if (!target) {
    return NextResponse.json(
      { error: 'Pass ?url=https://fractera.ai/en' },
      { status: 400 }
    )
  }

  let html: string
  try {
    const res = await fetch(target, {
      headers: { 'User-Agent': 'fractera-seo-auditor/1.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Fetch failed: ${res.status}` }, { status: 502 })
    }
    html = await res.text()
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }

  // Extract <head>...</head>
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  const headHtml = headMatch?.[1] ?? ''

  const result: Record<string, unknown> = {
    url: target,
    htmlLang: html.match(/<html[^>]+lang="([^"]+)"/i)?.[1] ?? null,
    title: headHtml.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null,
    meta: [] as Record<string, string>[],
    links: [] as Record<string, string>[],
    jsonLd: [] as unknown[],
  }

  // Meta tags
  for (const m of headHtml.matchAll(/<meta\s([^>]+)>/gi)) {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
      attrs[a[1]] = a[2]
    }
    ;(result.meta as Record<string, string>[]).push(attrs)
  }

  // Link tags (canonical, hreflang, icons…)
  for (const m of headHtml.matchAll(/<link\s([^>]+)>/gi)) {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
      attrs[a[1]] = a[2]
    }
    ;(result.links as Record<string, string>[]).push(attrs)
  }

  // JSON-LD blocks
  for (const m of headHtml.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      ;(result.jsonLd as unknown[]).push(JSON.parse(m[1]))
    } catch {
      ;(result.jsonLd as unknown[]).push({ raw: m[1] })
    }
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
