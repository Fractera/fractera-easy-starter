import { NextRequest, NextResponse, after } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { assignServerToQueued } from '@/lib/pool'
import { deployToServer } from '@/lib/deploy'
import { sendServerProvisionedEmail } from '@/lib/email'
import { initProgress } from '@/lib/kv'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { serverTokenId } = await req.json()
  if (!serverTokenId) return NextResponse.json({ error: 'serverTokenId required' }, { status: 400 })

  const serverToken = await db.serverToken.findUnique({
    where: { id: serverTokenId },
    include: { user: { select: { email: true } } },
  })
  if (!serverToken) return NextResponse.json({ error: 'ServerToken not found' }, { status: 404 })
  if (serverToken.status !== 'queued') return NextResponse.json({ error: 'ServerToken is not queued' }, { status: 400 })

  const { ip, login, password } = await assignServerToQueued(serverTokenId)

  const deploySessionId = serverToken.deploySessionId ?? `sess-admin-${Date.now()}`

  if (serverToken.user.email) {
    await sendServerProvisionedEmail(serverToken.user.email, ip, password)
  }

  after(async () => {
    try {
      await initProgress(deploySessionId)
      await deployToServer({
        ip,
        login,
        password,
        session_id: deploySessionId,
        platform: 'claude-code',
        serverToken: serverToken.token,
      })
    } catch (err) {
      console.error('[admin/assign] deploy error:', err)
    }
  })

  return NextResponse.json({ ok: true, ip })
}
