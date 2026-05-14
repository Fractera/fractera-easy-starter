import { NextRequest, NextResponse } from 'next/server'
import { deployToServer } from '@/lib/deploy'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appendStep } from '@/lib/kv'
import { sendInstallStartedEmail } from '@/lib/email'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { ip, login, password, session_id, platform, serverToken: existingToken } = await req.json()

  if (!ip || !login || !password || !session_id) {
    return NextResponse.json({ error: 'Missing ip, login, password or session_id' }, { status: 400 })
  }

  // For authenticated users: create a serverToken so the server appears in dashboard
  // and the email pipeline has a known recipient. Pool provisioning uses /api/pool/provision
  // and never hits this route — this block is own-server only.
  let tokenForBootstrap = existingToken ?? ''
  const session = await auth()
  const userEmail = session?.user?.email ?? null
  const userId = session?.user?.id ?? null

  if (userId && userEmail) {
    const newToken = await db.serverToken.create({
      data: {
        userId,
        status: 'pending',
        deploySessionId: session_id,
        serverIp: ip,
        serverPassword: password,
      },
    })
    tokenForBootstrap = newToken.token
  }

  // SSH + upload bootstrap + launch (also calls initProgress internally)
  await deployToServer({ ip, login, password, session_id, platform, serverToken: tokenForBootstrap })

  // Mark email_start step and send first pipeline email (after initProgress runs inside deployToServer)
  if (userEmail) {
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    sendInstallStartedEmail(userEmail).catch(console.error)
  }

  return NextResponse.json({ session_id, status: 'installing' })
}
