import { NextRequest, NextResponse } from 'next/server'
import { getProgress, appendStep, completeProgress, failProgress } from '@/lib/kv'
import { db } from '@/lib/db'
import { sendDeployFailedEmail } from '@/lib/email'
import { sendWelcomeEmailOnce } from '@/lib/welcome-email'

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
    // Surface the ServerToken on every poll so the UI can show it during the
    // deploy (not only on error). The user saves it for future MCP recovery.
    // Lookup is cheap and only runs for sessions that have a known progress
    // record. Skip pool-* sessions — those have no end-user ServerToken.
    if (!session_id.startsWith('pool-')) {
      try {
        const token = await db.serverToken.findFirst({
          where: { deploySessionId: session_id },
          select: { token: true },
        })
        if (token) {
          return NextResponse.json({ ...progress, server_token: token.token })
        }
      } catch (e) {
        console.error('[progress] server_token lookup failed', e)
      }
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
        await sendDeployFailedEmail(token.user.email, errMsg, token.token)
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

      // The address this callback carries is the freshest one, and the email helper
      // reads the row to build its links — so the row is written FIRST, once, and
      // both the email path and the plain completion path share that single write.
      await db.serverToken.updateMany({
        where: { deploySessionId: session_id, status: { not: 'offline' } },
        data: { subdomain, status: 'active' },
      })

      // Email pipeline: only for own-server deployments (sess-*).
      // Pool provisioning sessions (pool-*) are handled by the admin flow — do not touch.
      if (!session_id.startsWith('pool-')) {
        const token = await db.serverToken.findFirst({
          where: { deploySessionId: session_id },
          select: { id: true, user: { select: { email: true } } },
        })
        if (token?.user?.email) {
          // Deduplication is the claim inside the helper (ServerToken.welcomeSentAt),
          // NOT a status comparison. The old `if (token.status === 'pending')` test
          // was the defect: ping/route.ts flips status to 'active' before evaluating
          // its own send condition, so when that condition failed this fallback saw
          // 'active', concluded "ping already sent it", and skipped — leaving nobody
          // to send the email at all. Awaited, so Vercel cannot freeze it mid-send.
          const result = await sendWelcomeEmailOnce(token.id)
          if (result === 'sent') {
            await appendStep(session_id, { id: 'email_complete', label: 'Welcome email sent', done: true, ts: Date.now() })
          }
        }
      }
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
