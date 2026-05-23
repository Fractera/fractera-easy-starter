import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invalidateTrustedHostingsCache, TRUSTED_PROVIDERS_FALLBACK } from '@/lib/trusted-providers'

const VALID_CATEGORIES = ['vps', 'aff-network', 'other']

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  // Auto-seed on first admin visit: if the table is empty, populate from
  // the static fallback list (the same logic the runtime trusted-check uses
  // when reading via getEntries(), but the admin endpoint bypasses that and
  // reads the DB directly, so we replicate the seed inline here).
  const seedIfEmpty = async () => {
    try {
      await db.trustedHosting.createMany({
        data: TRUSTED_PROVIDERS_FALLBACK.map(p => ({
          domain: p.domain.toLowerCase(),
          name: p.name,
          category: p.category,
        })),
        skipDuplicates: true,
      })
      invalidateTrustedHostingsCache()
    } catch (err) {
      console.error('[admin/hostings] seed failed', err)
    }
  }
  const initialCount = await db.trustedHosting.count()
  if (initialCount === 0) await seedIfEmpty()

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const category = req.nextUrl.searchParams.get('category')?.trim() ?? ''

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { domain: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (category && VALID_CATEGORIES.includes(category)) where.category = category

  // The `total` is the full filtered count from this query — also report
  // the overall total so the admin UI can show "X of Y" when filters are
  // applied.
  const [rows, overall] = await Promise.all([
    db.trustedHosting.findMany({ where, orderBy: { name: 'asc' } }),
    db.trustedHosting.count(),
  ])
  return NextResponse.json({ total: rows.length, overall, rows })
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
