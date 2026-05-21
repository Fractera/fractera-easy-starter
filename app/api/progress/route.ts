import { NextRequest, NextResponse } from 'next/server'
import { getProgress, appendStep, completeProgress, failProgress } from '@/lib/kv'
import { db } from '@/lib/db'
import { sendWelcomeEmail, sendDeployFailedEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const progress = await getProgress(session_id)
    if (!progress) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    return NextResponse.json(progress)
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Redis error', detail: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-install-secret')
  if (secret !== process.env.INSTALL_SCRIPT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { session_id, step, done, response, error } = body

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  if (error) {
    const errMsg = String(error)
    await failProgress(session_id, errMsg)

    const token = await db.serverToken.findFirst({
      where: { deploySessionId: session_id },
      include: { user: { select: { email: true } } },
    })
    if (token) {
      await db.serverToken.update({ where: { id: token.id }, data: { status: 'error', deployError: errMsg } })
      const poolServer = await db.vpsReserve.findFirst({
        where: { provisioningServerTokenId: token.id },
      })
      if (poolServer) {
        await db.vpsReserve.update({
          where: { id: poolServer.id },
          data: { status: 'available' },
        })
      }
    }

    // Notify the user their deployment failed — they may have closed the site
    // and are waiting for the domain promised in the install-started email.
    // Pool provisioning sessions (pool-*) have no end-user — skip those.
    if (token?.user?.email && !session_id.startsWith('pool-')) {
      try {
        await sendDeployFailedEmail(token.user.email, errMsg)
      } catch (e) {
        console.error('[progress] sendDeployFailedEmail failed', e)
      }
    }

    return NextResponse.json({ ok: true })
  }

  if (done && response) {
    const subdomain = response?.subdomain ?? null
    if (subdomain) {
      await completeProgress(session_id, subdomain)

      // Email pipeline: only for own-server deployments (sess-*).
      // Pool provisioning sessions (pool-*) are handled by the admin flow — do not touch.
      // Read status BEFORE updateMany so we know if ping already fired (status='active') or not ('pending').
      if (!session_id.startsWith('pool-')) {
        const token = await db.serverToken.findFirst({
          where: { deploySessionId: session_id },
          include: { user: { select: { email: true } } },
        })
        if (token?.user?.email) {
          await appendStep(session_id, { id: 'email_complete', label: 'Welcome email sent', done: true, ts: Date.now() })
          // If ping hasn't arrived yet (status still 'pending'), send welcome email as fallback.
          // If status is already 'active', ping route already sent it — skip to avoid duplicate.
          if (token.status === 'pending') {
            sendWelcomeEmail(
              token.user.email,
              subdomain,
              token.serverIp && token.serverPassword
                ? { ip: token.serverIp, password: token.serverPassword }
                : undefined
            ).catch(console.error)
          }
        }
      }

      await db.serverToken.updateMany({
        where: { deploySessionId: session_id, status: { not: 'offline' } },
        data: { subdomain, status: 'active' },
      })
    } else {
      const errMsg = 'Domain registration failed'
      await failProgress(session_id, errMsg)

      const token = await db.serverToken.findFirst({
        where: { deploySessionId: session_id },
        include: { user: { select: { email: true } } },
      })
      if (token) {
        await db.serverToken.update({ where: { id: token.id }, data: { status: 'error', deployError: errMsg } })
      } else {
        await db.serverToken.updateMany({
          where: { deploySessionId: session_id, status: { not: 'offline' } },
          data: { status: 'error', deployError: errMsg },
        })
      }
    }
    return NextResponse.json({ ok: true })
  }

  if (step) {
    await appendStep(session_id, { ...step, ts: step.ts ?? Date.now() })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
