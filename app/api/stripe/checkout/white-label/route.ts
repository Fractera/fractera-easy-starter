import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const priceId = process.env.STRIPE_PRICE_WHITE_LABEL
  if (!priceId) {
    return NextResponse.json({ error: 'White label not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => ({})) as {
    serverTokenId?: string
    serverSubdomain?: string
    serverIp?: string
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'

  // Mode A: paid subscriber with a ServerToken
  if (body.serverTokenId) {
    const server = await db.serverToken.findUnique({ where: { id: body.serverTokenId } })
    if (!server || server.userId !== session.user.id || server.status !== 'active') {
      return NextResponse.json({ error: 'Server not found or not active' }, { status: 404 })
    }
    if (server.whiteLabelActive) {
      return NextResponse.json({ error: 'White label already active' }, { status: 409 })
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: session.user.id, serverTokenId: body.serverTokenId, productType: 'white_label' },
      customer_email: session.user.email ?? undefined,
      ui_mode: 'embedded',
      return_url: `${baseUrl}/?purchase=success`,
    })
    return NextResponse.json({ clientSecret: checkoutSession.client_secret })
  }

  // Mode B: self-hosted (Fractera Lite) — no ServerToken
  if (body.serverSubdomain) {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId: session.user.id,
        serverSubdomain: body.serverSubdomain,
        serverIp: body.serverIp ?? '',
        productType: 'white_label_selfhosted',
      },
      customer_email: session.user.email ?? undefined,
      ui_mode: 'embedded',
      return_url: `${baseUrl}/?purchase=success`,
    })
    return NextResponse.json({ clientSecret: checkoutSession.client_secret })
  }

  return NextResponse.json({ error: 'Missing serverTokenId or serverSubdomain' }, { status: 400 })
}
