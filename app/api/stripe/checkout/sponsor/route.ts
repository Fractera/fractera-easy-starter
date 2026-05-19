import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

const SPONSOR_PRICE_IDS: Record<string, string | undefined> = {
  s1:  process.env.STRIPE_PRICE_SPONSOR_1,
  s5:  process.env.STRIPE_PRICE_SPONSOR_5,
  s20: process.env.STRIPE_PRICE_SPONSOR_20,
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tier } = await req.json().catch(() => ({})) as { tier?: string }
  if (!tier || !(tier in SPONSOR_PRICE_IDS)) {
    return NextResponse.json({ error: 'Unknown sponsor tier' }, { status: 400 })
  }

  const priceId = SPONSOR_PRICE_IDS[tier]
  if (!priceId) {
    return NextResponse.json({ error: 'Sponsor tier not configured' }, { status: 503 })
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId: session.user.id,
      productType: 'sponsorship',
      tier,
    },
    customer_email: session.user.email ?? undefined,
    ui_mode: 'embedded',
    return_url: `${baseUrl}/?sponsor=thanks`,
  })

  return NextResponse.json({ clientSecret: checkoutSession.client_secret })
}
