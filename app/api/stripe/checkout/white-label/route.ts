import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { serverTokenId } = await req.json().catch(() => ({})) as { serverTokenId?: string }
  if (!serverTokenId) {
    return NextResponse.json({ error: 'Missing serverTokenId' }, { status: 400 })
  }

  const server = await db.serverToken.findUnique({ where: { id: serverTokenId } })
  if (!server || server.userId !== session.user.id || server.status !== 'active') {
    return NextResponse.json({ error: 'Server not found or not active' }, { status: 404 })
  }

  if (server.whiteLabelActive) {
    return NextResponse.json({ error: 'White label already active' }, { status: 409 })
  }

  const priceId = process.env.STRIPE_PRICE_WHITE_LABEL
  if (!priceId) {
    return NextResponse.json({ error: 'White label not configured' }, { status: 503 })
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id, serverTokenId, productType: 'white_label' },
    customer_email: session.user.email ?? undefined,
    ui_mode: 'embedded',
    return_url: `${baseUrl}/?purchase=success`,
  })

  return NextResponse.json({ clientSecret: checkoutSession.client_secret })
}
