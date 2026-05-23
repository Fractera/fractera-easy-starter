import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { wipeServer } from '@/lib/wipe-script'
import { deleteDnsRecord } from '@/lib/cloudflare'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const statusFilter = req.nextUrl.searchParams.get('status')?.trim() ?? ''
  const showDeleted = req.nextUrl.searchParams.get('showDeleted') === '1'
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1)

  const where: Record<string, unknown> = {}
  if (!showDeleted) where.status = { not: 'deleted' }
  if (statusFilter) where.status = statusFilter

  if (q) {
    where.OR = [
      { serverIp: { contains: q } },
      { token: { contains: q } },
      { subdomain: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { referredBy: { slug: { contains: q, mode: 'insensitive' } } } },
    ]
  }

  const [total, rows] = await Promise.all([
    db.serverToken.count({ where }),
    db.serverToken.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        token: true,
        subdomain: true,
        serverIp: true,
        serverPassword: true,
        status: true,
        createdAt: true,
        lastPingAt: true,
        deployError: true,
        whiteLabelActive: true,
        user: {
          select: {
            email: true,
            referredBy: { select: { slug: true, companyName: true } },
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    rows,
  })
}

// Soft delete (default) — mark status='deleted', keep the row for audit.
// Hard wipe (mode='hard') — wipeServer + deleteDnsRecord on all 6 subdomains
// + set status='deleted'. Requires the operator to type-confirm.
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as {
    id?: string
    mode?: 'soft' | 'hard'
    confirmSubdomain?: string
  }
  if (!body.id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const mode = body.mode === 'hard' ? 'hard' : 'soft'

  const token = await db.serverToken.findUnique({
    where: { id: body.id },
    select: { id: true, subdomain: true, serverIp: true, serverPassword: true },
  })
  if (!token) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (mode === 'hard') {
    // Anti-misclick: operator must paste the subdomain back to authorise.
    if (!token.subdomain) {
      return NextResponse.json({ error: 'no subdomain — hard wipe not applicable, use soft' }, { status: 400 })
    }
    if (body.confirmSubdomain !== token.subdomain) {
      return NextResponse.json({ error: 'confirm-subdomain mismatch' }, { status: 400 })
    }
    if (!token.serverIp || !token.serverPassword) {
      return NextResponse.json({ error: 'no credentials on record — cannot SSH wipe; falling back to soft is recommended' }, { status: 400 })
    }
    // 1. SSH wipe on the customer's VPS.
    try {
      await wipeServer(token.serverIp, 'root', token.serverPassword)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[admin/server-tokens] hard wipe SSH failed', err)
      return NextResponse.json({ error: 'ssh wipe failed: ' + msg }, { status: 500 })
    }
    // 2. Delete all 6 DNS records (main + 5 service prefixes). Best-effort.
    const base = token.subdomain
    const dnsTargets = [base, `auth.${base}`, `admin.${base}`, `data.${base}`, `lightrag.${base}`, `hermes.${base}`]
    await Promise.all(dnsTargets.map(d => deleteDnsRecord(d).catch(() => {})))
  }

  // Soft cleanup of related rows + mark deleted. We don't physically DELETE
  // the ServerToken so Purchase rows + the audit trail stay intact for tax /
  // finance review.
  await db.serverToken.update({
    where: { id: token.id },
    data: { status: 'deleted', deployError: mode === 'hard' ? 'admin hard-wipe' : 'admin soft-delete' },
  })

  return NextResponse.json({ ok: true, mode })
}
