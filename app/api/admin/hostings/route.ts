import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invalidateTrustedHostingsCache, TRUSTED_PROVIDERS_FALLBACK } from '@/lib/trusted-providers'

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
          isHosting: p.isHosting === true,
          isRegistrar: p.isRegistrar === true,
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

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { domain: { contains: q, mode: 'insensitive' } },
    ]
  }

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
  const body = await req.json().catch(() => ({})) as { domain?: string; name?: string; isHosting?: boolean; isRegistrar?: boolean }
  const domain = (body.domain ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const name = (body.name ?? '').trim()
  // Trusted as a server provider and/or a domain registrar. Guarantee at least
  // one is true so the entry is usable.
  let isHosting = body.isHosting === true
  const isRegistrar = body.isRegistrar === true
  if (!isHosting && !isRegistrar) isHosting = true
  if (!domain || !name) return NextResponse.json({ error: 'domain and name required' }, { status: 400 })
  try {
    const row = await db.trustedHosting.create({
      data: { domain, name, isHosting, isRegistrar, createdBy: session.user.email ?? null },
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
