import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripeSessionId = new URL(req.url).searchParams.get('stripe_session_id')

  const where = stripeSessionId
    ? { userId: session.user.id, stripeCheckoutSessionId: stripeSessionId, status: { notIn: ['offline'] } }
    : { userId: session.user.id, status: { notIn: ['offline'] } }

  const serverToken = await db.serverToken.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      subdomain: true,
      deploySessionId: true,
      stripeCheckoutSessionId: true,
      createdAt: true,
    },
  })

  if (!serverToken) {
    return NextResponse.json({ server: null })
  }

  return NextResponse.json({ server: serverToken })
}
