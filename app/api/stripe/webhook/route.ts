import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { confirmServerPayment, releaseServer } from '@/lib/pool'
import { sendWelcomeEmail, sendQueuedEmail, sendAdminAlertEmail } from '@/lib/email'

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
    const planId = session.metadata?.planId ?? 'monthly'
    const vpsReserveId = session.metadata?.vpsReserveId || null

    if (!userId || !session.customer) {
      return NextResponse.json({ ok: true })
    }

    if (!session.subscription) return NextResponse.json({ ok: true })

    const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
    const subscription = await db.subscription.create({
      data: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSub.id,
        status: stripeSub.status,
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        planId,
      },
    })

    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })

    // Path A: pool server was reserved — instant assignment (server is pre-provisioned)
    if (vpsReserveId) {
      const reserve = await confirmServerPayment(vpsReserveId)

      await db.serverToken.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          status: 'active',
          stripeCheckoutSessionId: session.id,
          serverIp: reserve.ip,
          serverPassword: reserve.password,
          subdomain: reserve.subdomain ?? undefined,
        },
      })

      if (user?.email && reserve.subdomain) {
        await sendWelcomeEmail(user.email, reserve.subdomain)
      }

      return NextResponse.json({ ok: true })
    }

    // Path B: pool was empty — queue for manual assignment
    await db.serverToken.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        status: 'queued',
        stripeCheckoutSessionId: session.id,
      },
    })

    if (user?.email) {
      await sendQueuedEmail(user.email)
    }
    await sendAdminAlertEmail(user?.email ?? userId, subscription.id)
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object
    const vpsReserveId = session.metadata?.vpsReserveId
    if (vpsReserveId) {
      await releaseServer(vpsReserveId)
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const stripeSub = event.data.object
    const existing = await db.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    })
    if (!existing) return NextResponse.json({ ok: true })

    await db.subscription.update({
      where: { stripeSubscriptionId: stripeSub.id },
      data: {
        status: stripeSub.status,
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    })
  }

  return NextResponse.json({ ok: true })
}
