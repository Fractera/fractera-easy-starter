import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { isTrustedUrl } from '@/lib/trusted-providers'

export const dynamic = 'force-dynamic'

async function loadLinkForUser(linkId: string, userId: string) {
  return db.partnerLink.findFirst({
    where: { id: linkId, partner: { userId } },
    select: {
      id: true, partnerId: true, isDefault: true,
      forWidget: true, forPage: true, affiliateUrl: true,
    },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await loadLinkForUser(id, session.user.id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: {
    providerName?: unknown
    affiliateUrl?: unknown
    isDefault?: unknown
    forWidget?: unknown
    forPage?: unknown
    sortOrder?: unknown
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const data: {
    providerName?: string
    affiliateUrl?: string
    forWidget?: boolean
    forPage?: boolean
    sortOrder?: number
  } = {}

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
  if (typeof body.forWidget === 'boolean') data.forWidget = body.forWidget
  if (typeof body.forPage === 'boolean') data.forPage = body.forPage
  if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder

  // Whitelist enforcement for page surface
  const finalForPage = data.forPage ?? link.forPage
  const finalUrl = data.affiliateUrl ?? link.affiliateUrl
  if (finalForPage && !isTrustedUrl(finalUrl)) {
    return NextResponse.json({
      error: 'NOT_TRUSTED',
      message: 'This hosting provider is not in the trusted whitelist. Contact the Fractera team via the private $20/mo Sponsor Telegram channel to request approval.',
    }, { status: 400 })
  }
  // Must remain on at least one surface
  const finalForWidget = data.forWidget ?? link.forWidget
  if (!finalForWidget && !finalForPage) {
    return NextResponse.json({ error: 'Link must be enabled for at least one surface (widget or page)' }, { status: 400 })
  }

  const makeDefault = body.isDefault === true
  const updated = await db.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.partnerLink.updateMany({ where: { partnerId: link.partnerId }, data: { isDefault: false } })
    }
    return tx.partnerLink.update({
      where: { id: link.id },
      data: { ...data, ...(makeDefault ? { isDefault: true } : {}) },
      select: {
        id: true, providerName: true, affiliateUrl: true,
        isDefault: true, forWidget: true, forPage: true, sortOrder: true, createdAt: true,
      },
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
