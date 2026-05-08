import { NextRequest, NextResponse, after } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { deployToServer } from '@/lib/deploy'
import { failProgress, initProgress } from '@/lib/kv'
import { createInstance, pollInstanceReady } from '@/lib/contabo'
import { sendServerProvisionedEmail } from '@/lib/email'

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

    const deploySessionId = `sess-stripe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // In mock mode reuse existing test server password; otherwise generate fresh one
    const rootPassword = process.env.CONTABO_MOCK === 'true'
      ? (process.env.FRACTERA_DEPLOY_PASSWORD ?? '')
      : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')

    let contaboInstanceId: number | null = null
    try {
      contaboInstanceId = await createInstance(rootPassword)
    } catch (err) {
      console.error('[webhook] Contabo createInstance failed:', err)
    }

    const serverToken = await db.serverToken.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        status: contaboInstanceId ? 'provisioning' : 'error',
        deploySessionId,
        contaboInstanceId: contaboInstanceId ? String(contaboInstanceId) : null,
        serverPassword: rootPassword,
      },
    })

    if (!contaboInstanceId) {
      await initProgress(deploySessionId)
      await failProgress(deploySessionId, 'Failed to create Contabo VPS')
      return NextResponse.json({ ok: true })
    }

    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })

    after(async () => {
      try {
        await initProgress(deploySessionId)
        const ip = await pollInstanceReady(contaboInstanceId!)

        await db.serverToken.update({
          where: { id: serverToken.id },
          data: { serverIp: ip, status: 'pending' },
        })

        if (user?.email) {
          await sendServerProvisionedEmail(user.email, ip, rootPassword)
        }

        await deployToServer({
          ip,
          login: 'root',
          password: rootPassword,
          session_id: deploySessionId,
          platform: 'claude-code',
          serverToken: serverToken.token,
        })
      } catch (err) {
        console.error('[webhook] provision/deploy error:', err)
        await failProgress(deploySessionId, `Provision failed: ${String(err)}`)
        await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error' } }).catch(() => {})
      }
    })
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
