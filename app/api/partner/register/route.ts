import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateUniquePartnerSlug } from '@/lib/partner'
import { sendPartnerWelcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await db.partner.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true, status: true, createdAt: true },
  })
  if (existing) {
    return NextResponse.json({ partner: existing, alreadyRegistered: true })
  }

  const slug = await generateUniquePartnerSlug()
  const partner = await db.partner.create({
    data: { userId: session.user.id, slug, status: 'active' },
    select: { id: true, slug: true, status: true, createdAt: true },
  })

  try {
    await sendPartnerWelcomeEmail(session.user.email, partner.slug)
  } catch (err) {
    console.error('[partner/register] welcome email failed', err)
  }

  return NextResponse.json({ partner, alreadyRegistered: false })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ partner: null })
  }
  const partner = await db.partner.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true, status: true, createdAt: true },
  })
  return NextResponse.json({ partner })
}
