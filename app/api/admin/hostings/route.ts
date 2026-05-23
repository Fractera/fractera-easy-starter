import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invalidateTrustedHostingsCache, TRUSTED_PROVIDERS_FALLBACK } from '@/lib/trusted-providers'

const VALID_CATEGORIES = ['vps', 'aff-network', 'other']

export async function GET() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  // Auto-seed on first admin visit: if the table is empty, populate from
  // the static fallback list (the same logic the runtime trusted-check uses
  // when reading via getEntries(), but the admin endpoint bypasses that and
  // reads the DB directly, so we replicate the seed inline here).
  let rows = await db.trustedHosting.findMany({ orderBy: { name: 'asc' } })
  if (rows.length === 0) {
    try {
      await db.trustedHosting.createMany({
        data: TRUSTED_PROVIDERS_FALLBACK.map(p => ({
          domain: p.domain.toLowerCase(),
          name: p.name,
          category: p.category,
        })),
        skipDuplicates: true,
      })
      rows = await db.trustedHosting.findMany({ orderBy: { name: 'asc' } })
      invalidateTrustedHostingsCache()
    } catch (err) {
      console.error('[admin/hostings] seed failed', err)
    }
  }
  return NextResponse.json({ total: rows.length, rows })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as { domain?: string; name?: string; category?: string }
  const domain = (body.domain ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const name = (body.name ?? '').trim()
  const category = VALID_CATEGORIES.includes((body.category ?? '').trim()) ? (body.category as string).trim() : 'vps'
  if (!domain || !name) return NextResponse.json({ error: 'domain and name required' }, { status: 400 })
  try {
    const row = await db.trustedHosting.create({
      data: { domain, name, category, createdBy: session.user.email ?? null },
    })
    invalidateTrustedHostingsCache()
    return NextResponse.json({ ok: true, row })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/Unique constraint/i.test(msg)) {
      return NextResponse.json({ error: 'domain already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as { id?: string }
  if (!body.id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  await db.trustedHosting.delete({ where: { id: body.id } }).catch(() => {})
  invalidateTrustedHostingsCache()
  return NextResponse.json({ ok: true })
}
