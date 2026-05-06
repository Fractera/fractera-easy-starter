import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    if (!userId || !session.subscription || !session.customer) {
      return NextResponse.json({ ok: true })
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    const subscription = await db.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: session.customer as string,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    })

    const serverToken = await db.serverToken.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        status: 'pending',
      },
    })

    const deploySessionId = `sess-stripe-${serverToken.token.slice(-10)}`

    const ip = process.env.FRACTERA_DEPLOY_IP!
    const login = process.env.FRACTERA_DEPLOY_USER!
    const password = process.env.FRACTERA_DEPLOY_PASSWORD!

    deployToServer({
      ip,
      login,
      password,
      session_id: deploySessionId,
      platform: 'claude-code',
      serverToken: serverToken.token,
    }).catch(err => console.error('[webhook] deploy error:', err))
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const stripeSubscription = event.data.object
    const existing = await db.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
      include: { user: true },
    })
    if (!existing) return NextResponse.json({ ok: true })

    await db.subscription.update({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        status: stripeSubscription.status,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    })
  }

  return NextResponse.json({ ok: true })
}
