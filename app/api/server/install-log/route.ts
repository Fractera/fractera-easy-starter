import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appendStep } from '@/lib/kv'
import { sendInstallProgressEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { percent } = body

  const serverToken = await db.serverToken.findUnique({
    where: { token },
    include: { user: { select: { email: true } } },
  })
  if (!serverToken) return NextResponse.json({ ok: false })

  // Send progress email at the ~30% milestone (deps installed, building services)
  // Only for own-server sessions (sess-*), not pool provisioning (pool-*)
  const isOwnServer = serverToken.deploySessionId && !serverToken.deploySessionId.startsWith('pool-')
  if (percent >= 30 && isOwnServer && serverToken.user?.email && serverToken.deploySessionId) {
    sendInstallProgressEmail(serverToken.user.email).catch(console.error)
    await appendStep(serverToken.deploySessionId, {
      id: 'email_deps',
      label: 'Progress update email sent',
      done: true,
      ts: Date.now(),
    })
  }

  return NextResponse.json({ ok: true })
}
