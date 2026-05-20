import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const partner = await db.partner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!partner) {
    return NextResponse.json({ referralCount: 0 })
  }

  const referralCount = await db.user.count({
    where: { referredByPartnerId: partner.id },
  })

  return NextResponse.json({ referralCount })
}
