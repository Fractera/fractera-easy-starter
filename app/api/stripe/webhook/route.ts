import { NextRequest, NextResponse, after } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'
import { failProgress, initProgress } from '@/lib/kv'

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

    const deploySessionId = `sess-stripe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const serverToken = await db.serverToken.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        status: 'pending',
        deploySessionId,
      },
    })

    const ip = process.env.FRACTERA_DEPLOY_IP
    const login = process.env.FRACTERA_DEPLOY_USER
    const password = process.env.FRACTERA_DEPLOY_PASSWORD

    // Check required env vars before attempting deploy
    if (!ip || !login || !password) {
      await initProgress(deploySessionId)
      await failProgress(deploySessionId, `Server credentials not configured: missing ${[!ip && 'FRACTERA_DEPLOY_IP', !login && 'FRACTERA_DEPLOY_USER', !password && 'FRACTERA_DEPLOY_PASSWORD'].filter(Boolean).join(', ')}`)
      await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error' } })
      console.error('[webhook] missing deploy env vars')
      return NextResponse.json({ ok: true })
    }

    // after() keeps the Vercel function alive until deploy task completes
    // (without it, Vercel kills the process right after returning { ok: true })
    after(async () => {
      try {
        await deployToServer({
          ip,
          login,
          password,
          session_id: deploySessionId,
          platform: 'claude-code',
          serverToken: serverToken.token,
        })
      } catch (err) {
        console.error('[webhook] deploy error:', err)
        await failProgress(deploySessionId, `Deploy failed: ${String(err)}`)
        await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error' } }).catch(() => {})
      }
    })
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
