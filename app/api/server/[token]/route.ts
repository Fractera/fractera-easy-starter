import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const serverToken = await db.serverToken.findUnique({
    where: { token },
    include: { subscription: true },
  })

  if (!serverToken) {
    return NextResponse.json({ error: 'Unknown token' }, { status: 401 })
  }

  const sub = serverToken.subscription
  const daysLeft = sub
    ? Math.floor((sub.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return NextResponse.json({
    subscriptionStatus: sub?.status ?? 'none',
    currentPeriodEnd: sub?.currentPeriodEnd.toISOString() ?? null,
    daysLeft,
    warning: daysLeft !== null && daysLeft <= 7,
  })
}
