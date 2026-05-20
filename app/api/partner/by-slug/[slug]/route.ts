import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const partner = await db.partner.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      status: true,
      links: {
        where: { isDefault: true },
        select: { providerName: true, affiliateUrl: true },
        take: 1,
      },
    },
  })

  if (!partner || partner.status !== 'active') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const defaultLink = partner.links[0] ?? null

  return NextResponse.json({
    slug: partner.slug,
    providerName: defaultLink?.providerName ?? null,
    affiliateUrl: defaultLink?.affiliateUrl ?? null,
  })
}
