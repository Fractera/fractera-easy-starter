import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { isTrustedUrl } from '@/lib/trusted-providers'

export const dynamic = 'force-dynamic'

async function loadPartner(userId: string) {
  return db.partner.findUnique({ where: { userId }, select: { id: true } })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const partner = await loadPartner(session.user.id)
  if (!partner) return NextResponse.json({ links: [] })

  const { searchParams } = new URL(req.url)
  const surface = searchParams.get('surface') // 'widget' | 'page' | null (all)

  const where: { partnerId: string; forWidget?: boolean; forPage?: boolean } = { partnerId: partner.id }
  if (surface === 'widget') where.forWidget = true
  if (surface === 'page') where.forPage = true

  const links = await db.partnerLink.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { isDefault: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      providerName: true,
      affiliateUrl: true,
      isDefault: true,
      forWidget: true,
      forPage: true,
      sortOrder: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ links })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const partner = await loadPartner(session.user.id)
  if (!partner) return NextResponse.json({ error: 'Not a partner' }, { status: 403 })

  let body: {
    providerName?: unknown
    affiliateUrl?: unknown
    isDefault?: unknown
    forWidget?: unknown
    forPage?: unknown
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const providerName = typeof body.providerName === 'string' ? body.providerName.trim() : ''
  const affiliateUrl = typeof body.affiliateUrl === 'string' ? body.affiliateUrl.trim() : ''
  const forWidget = body.forWidget === false ? false : true // default true
  const forPage = body.forPage === true

  if (!providerName || providerName.length > 80) {
    return NextResponse.json({ error: 'providerName required, 1–80 chars' }, { status: 400 })
  }
  if (!/^https?:\/\//i.test(affiliateUrl) || affiliateUrl.length > 2048) {
    return NextResponse.json({ error: 'affiliateUrl must start with http(s):// and be ≤ 2048 chars' }, { status: 400 })
  }
  if (forPage && !isTrustedUrl(affiliateUrl)) {
    return NextResponse.json({
      error: 'NOT_TRUSTED',
      message: 'This hosting provider is not in the trusted whitelist. Contact the Fractera team via the private $20/mo Sponsor Telegram channel to request approval.',
    }, { status: 400 })
  }
  if (!forWidget && !forPage) {
    return NextResponse.json({ error: 'Link must be enabled for at least one surface (widget or page)' }, { status: 400 })
  }

  const existingCount = await db.partnerLink.count({ where: { partnerId: partner.id } })
  const shouldBeDefault = body.isDefault === true || existingCount === 0

  const link = await db.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.partnerLink.updateMany({ where: { partnerId: partner.id }, data: { isDefault: false } })
    }
    return tx.partnerLink.create({
      data: {
        partnerId: partner.id,
        providerName,
        affiliateUrl,
        isDefault: shouldBeDefault,
        forWidget,
        forPage,
        sortOrder: existingCount,
      },
      select: {
        id: true, providerName: true, affiliateUrl: true,
        isDefault: true, forWidget: true, forPage: true, sortOrder: true, createdAt: true,
      },
    })
  })

  return NextResponse.json({ link })
}
