import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { deleteDnsRecord } from '@/lib/cloudflare'

export const maxDuration = 60

const DESTROY_SCRIPT = `
pm2 delete all 2>/dev/null || true
rm -rf /opt/fractera
rm -rf /etc/fractera
rm -rf /root/.gemini /root/.claude /root/.config/openai /root/.openai /root/.config/qwen-code /root/.qwen /root/.config/kimi-cli /root/.kimi /root/.local/share/kimi-cli /root/.local/share/kimi 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/fractera
rm -f /etc/nginx/sites-available/fractera
nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
echo "DESTROYED"
`

async function sshDestroy(ip: string, password: string) {
  return new Promise<void>((resolve, reject) => {
    const ssh = new Client()
    ssh.on('ready', () => {
      ssh.exec(DESTROY_SCRIPT, (err, stream) => {
        if (err) { reject(err); ssh.end(); return }
        stream.on('close', () => { ssh.end(); resolve() })
        stream.on('data', () => {})
        stream.stderr.on('data', () => {})
      })
    })
    ssh.on('error', reject)
    ssh.connect({ host: ip, port: 22, username: 'root', password, readyTimeout: 20000 })
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscriptionId } = await req.json()
  if (!subscriptionId) {
    return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 })
  }

  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      serverTokens: {
        where: { status: { not: 'offline' } },
      },
    },
  })

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }
  if (subscription.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Cancel in Stripe
  if (subscription.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId).catch(() => {})
  }
  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: 'cancelled' },
  })

  // Destroy all associated servers
  for (const token of subscription.serverTokens) {
    if (token.serverIp && token.serverPassword) {
      sshDestroy(token.serverIp, token.serverPassword).catch(() => {})
    }
    if (token.subdomain) {
      const base = token.subdomain.replace(/\.fractera\.ai$/, '')
      // Path-based = 1 record; legacy 4th-level = 6. Try all, silently ignore missing.
      Promise.all([
        deleteDnsRecord(token.subdomain).catch(() => {}),
        deleteDnsRecord(`auth.${base}.fractera.ai`).catch(() => {}),
        deleteDnsRecord(`admin.${base}.fractera.ai`).catch(() => {}),
        deleteDnsRecord(`data.${base}.fractera.ai`).catch(() => {}),
        deleteDnsRecord(`lightrag.${base}.fractera.ai`).catch(() => {}),
        deleteDnsRecord(`hermes.${base}.fractera.ai`).catch(() => {}),
      ])
    }
    await db.serverToken.update({
      where: { id: token.id },
      data: { status: 'offline' },
    })
  }

  return NextResponse.json({ ok: true })
}
