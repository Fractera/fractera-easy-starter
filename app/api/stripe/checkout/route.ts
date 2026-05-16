import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { reserveServer, findActiveReserveForUser } from '@/lib/pool'

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
  const embedded: boolean = body.embedded === true

  const priceId = PRICE_IDS[planId]
  if (!priceId) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'
  const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS
  const reservedUntil = new Date(expiresAt * 1000)

  // Idempotency: if this user already has an active reservation from a
  // previous attempt (drawer remount, page refresh, retry), reuse it instead
  // of trying to grab a new one. Otherwise the second call may orphan the
  // first reservation while the user is paying through a fresh Stripe
  // session whose metadata.vpsReserveId is empty — webhook then falls into
  // Path B (queue) and admin has to fix manually. See Step 45.
  let vpsReserveId: string | null = null
  const existingReserve = await findActiveReserveForUser(userId)
  if (existingReserve) {
    // Extend TTL so the new Stripe session window is honored
    await db.vpsReserve.update({
      where: { id: existingReserve.id },
      data: { reservedUntil },
    })
    vpsReserveId = existingReserve.id
  } else {
    try {
      const reserved = await reserveServer(userId, reservedUntil)
      vpsReserveId = reserved.id
    } catch {
      // Pool truly empty — Path B, no reservation
    }
  }

  const returnUrl = `${baseUrl}/?payment=success&stripe_session_id={CHECKOUT_SESSION_ID}`

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, planId, vpsReserveId: vpsReserveId ?? '' },
    customer_email: session.user.email ?? undefined,
    expires_at: expiresAt,
    ...(embedded
      ? { ui_mode: 'embedded', return_url: returnUrl }
      : { success_url: returnUrl, cancel_url: `${baseUrl}/` }),
  })

  if (embedded) {
    return NextResponse.json({ clientSecret: checkoutSession.client_secret })
  }
  return NextResponse.json({ url: checkoutSession.url })
}
