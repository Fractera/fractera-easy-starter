import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { reserveServer } from '@/lib/pool'

const PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual:  process.env.STRIPE_PRICE_ANNUAL!,
}

const CHECKOUT_TTL_SECONDS = 30 * 60 // 30 minutes

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const body = await req.json().catch(() => ({}))
  const planId: string = body.planId ?? 'monthly'

  const priceId = PRICE_IDS[planId]
  if (!priceId) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'
  const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS
  const reservedUntil = new Date(expiresAt * 1000)

  // Path A: reserve server if available; Path B: proceed without reservation
  let vpsReserveId: string | null = null
  try {
    const reserved = await reserveServer(userId, reservedUntil)
    vpsReserveId = reserved.id
  } catch {
    // Pool empty — Path B, no reservation
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, planId, vpsReserveId: vpsReserveId ?? '' },
    customer_email: session.user.email ?? undefined,
    expires_at: expiresAt,
    success_url: `${baseUrl}/?payment=success&stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
