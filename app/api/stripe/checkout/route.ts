import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Guard: if user already has a pending or active server, don't create a new checkout
  const existing = await db.serverToken.findFirst({
    where: { userId, status: { in: ['pending', 'active'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, subdomain: true, deploySessionId: true, createdAt: true },
  })
  if (existing) {
    return NextResponse.json({ hasServer: true, server: existing })
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    customer_email: session.user.email ?? undefined,
    success_url: `${baseUrl}/?payment=success&stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
