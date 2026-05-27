import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { confirmServerPayment, releaseServer, findActiveReserveForUser } from '@/lib/pool'
import { sendWelcomeEmail, sendQueuedEmail, sendAdminAlertEmail, sendSponsorThankYouEmail } from '@/lib/email'

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
    let vpsReserveId = session.metadata?.vpsReserveId || null
    const productType = session.metadata?.productType

    // Recovery: if metadata.vpsReserveId is empty (lost during a double
    // checkout call) but the user actually has a hanging pending_payment
    // reservation, claim it. Without this, the user ends up in queue while
    // their reserved server orphans. See Step 45.
    if (!vpsReserveId && userId && productType !== 'white_label') {
      const hanging = await findActiveReserveForUser(userId)
      if (hanging) {
        vpsReserveId = hanging.id
      }
    }

    if (!userId) return NextResponse.json({ ok: true })

    // Sponsorship subscription — separate flow, no server provisioning
    if (productType === 'sponsorship') {
      const tier = session.metadata?.tier
      if (!tier || !userId || !session.subscription) return NextResponse.json({ ok: true })

      const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
      await db.sponsorship.upsert({
        where: { stripeSubscriptionId: stripeSub.id },
        update: {
          status: stripeSub.status,
          tier,
        },
        create: {
          userId,
          tier,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSub.id,
          status: stripeSub.status,
        },
      })

      const sponsorUser = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
      if (sponsorUser?.email && (tier === 's1' || tier === 's5' || tier === 's20')) {
        await sendSponsorThankYouEmail(sponsorUser.email, tier).catch(() => {})
      }
      return NextResponse.json({ ok: true })
    }

    // White label one-time purchase
    if (productType === 'white_label') {
      const serverTokenId = session.metadata?.serverTokenId
      if (!serverTokenId) return NextResponse.json({ ok: true })

      const server = await db.serverToken.findUnique({
        where: { id: serverTokenId },
        select: { token: true, subdomain: true, serverIp: true },
      })
      if (!server) return NextResponse.json({ ok: true })

      await db.purchase.create({
        data: {
          userId,
          serverTokenId,
          productType: 'white_label',
          stripePaymentId: (session.payment_intent as string) ?? session.id,
          serverIp: server.serverIp,
          serverSubdomain: server.subdomain,
        },
      })

      await db.serverToken.update({
        where: { id: serverTokenId },
        data: { whiteLabelActive: true },
      })

      if (server.subdomain && server.token) {
        fetch(`https://admin.${server.subdomain}/api/config/white-label`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${server.token}`,
            'x-fractera-secret': process.env.INSTALL_SCRIPT_SECRET ?? '',
          },
        }).catch(() => {})
      }

      return NextResponse.json({ ok: true })
    }

    if (!session.customer) return NextResponse.json({ ok: true })

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
        await sendWelcomeEmail(user.email, reserve.subdomain, { ip: reserve.ip, password: reserve.password })
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
    if (existing) {
      await db.subscription.update({
        where: { stripeSubscriptionId: stripeSub.id },
        data: {
          status: stripeSub.status,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      })
    } else {
      // Maybe it's a sponsorship subscription
      const sponsorship = await db.sponsorship.findUnique({
        where: { stripeSubscriptionId: stripeSub.id },
      })
      if (sponsorship) {
        await db.sponsorship.update({
          where: { stripeSubscriptionId: stripeSub.id },
          data: { status: stripeSub.status },
        })
      }
    }
  }

  // Sponsorship: count successful invoice payments
  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    const subId = (invoice as { subscription?: string | null }).subscription
    if (subId) {
      const sponsorship = await db.sponsorship.findUnique({
        where: { stripeSubscriptionId: subId },
      })
      if (sponsorship) {
        const now = new Date()
        await db.sponsorship.update({
          where: { stripeSubscriptionId: subId },
          data: {
            paymentsCount: { increment: 1 },
            lastPaymentAt: now,
            firstPaymentAt: sponsorship.firstPaymentAt ?? now,
            status: 'active',
          },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
