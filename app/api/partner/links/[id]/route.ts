import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function loadLinkForUser(linkId: string, userId: string) {
  return db.partnerLink.findFirst({
    where: { id: linkId, partner: { userId } },
    select: { id: true, partnerId: true, isDefault: true },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await loadLinkForUser(id, session.user.id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { providerName?: unknown; affiliateUrl?: unknown; isDefault?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const data: { providerName?: string; affiliateUrl?: string } = {}
  if (typeof body.providerName === 'string') {
    const v = body.providerName.trim()
    if (!v || v.length > 80) return NextResponse.json({ error: 'providerName 1–80 chars' }, { status: 400 })
    data.providerName = v
  }
  if (typeof body.affiliateUrl === 'string') {
    const v = body.affiliateUrl.trim()
    if (!/^https?:\/\//i.test(v) || v.length > 2048) {
      return NextResponse.json({ error: 'affiliateUrl must start with http(s):// and be ≤ 2048 chars' }, { status: 400 })
    }
    data.affiliateUrl = v
  }

  const makeDefault = body.isDefault === true
  const updated = await db.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.partnerLink.updateMany({ where: { partnerId: link.partnerId }, data: { isDefault: false } })
    }
    return tx.partnerLink.update({
      where: { id: link.id },
      data: { ...data, ...(makeDefault ? { isDefault: true } : {}) },
      select: { id: true, providerName: true, affiliateUrl: true, isDefault: true, createdAt: true },
    })
  })

  return NextResponse.json({ link: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await loadLinkForUser(id, session.user.id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.$transaction(async (tx) => {
    await tx.partnerLink.delete({ where: { id: link.id } })
    if (link.isDefault) {
      // Promote the next-oldest link to default, if any
      const next = await tx.partnerLink.findFirst({
        where: { partnerId: link.partnerId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      })
      if (next) await tx.partnerLink.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  })

  return NextResponse.json({ ok: true })
}
