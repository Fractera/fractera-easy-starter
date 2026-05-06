import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      userId: session.user.id,
    },
    customer_email: session.user.email ?? undefined,
    success_url: `${baseUrl}/?payment=success&stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
