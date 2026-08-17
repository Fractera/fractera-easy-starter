import { db } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

// Single owner of "send the welcome email exactly once, and never lose it".
//
// WHY THIS FILE EXISTS. Two independent triggers can finish a deploy — the
// server's first ping (app/api/server/ping) and the bootstrap's done callback
// (app/api/progress POST) — and they used to deduplicate through
// ServerToken.status. That is not deduplication, it is a lost message:
// ping/route.ts writes status='active' BEFORE it evaluates its own email
// condition, so whenever that condition failed (a falsy subdomain — reachable
// on the embed path, whose ServerToken is created with no subdomain at all),
// the ping skipped the email AND marked the row active, and then the fallback
// in progress/route.ts read 'active' instead of 'pending' and skipped as well.
// Nobody sent it, and nothing ever retried. That is the "sometimes the email
// does not arrive" report.
//
// Two properties, both mechanical:
//   1. The claim is ATOMIC — updateMany({ welcomeSentAt: null }) either wins
//      (count 1) or loses (count 0). The database decides, not a field the
//      other path mutates first.
//   2. A failed send RESETS the flag, which makes the retry free: bootstrap
//      installs a `*/15 * * * *` ping cron, so the next ping finds a null flag
//      and sends again. No queue, no cron of our own, no Resend webhook.

// Rows created before `welcomeSentAt` existed carry null, which would otherwise
// read as "never sent" and mail every long-running server on its next ping.
// They already received their welcome email under the old code, so the claim
// refuses to touch anything older than the deploy that introduced the flag.
const WELCOME_FLAG_SINCE = new Date('2026-08-17T00:00:00.000Z')

type WelcomeResult = 'sent' | 'skipped' | 'failed' | 'no-recipient'

/**
 * Claim and send the welcome email for one ServerToken. Safe to call from every
 * trigger, concurrently — at most one send happens per row, and a transient
 * failure leaves the row eligible for the next attempt.
 */
export async function sendWelcomeEmailOnce(serverTokenId: string): Promise<WelcomeResult> {
  // 1. Claim. Losing this race is the normal path for the second trigger.
  const claim = await db.serverToken.updateMany({
    where: {
      id: serverTokenId,
      welcomeSentAt: null,
      createdAt: { gte: WELCOME_FLAG_SINCE },
    },
    data: { welcomeSentAt: new Date() },
  })
  if (claim.count !== 1) return 'skipped'

  const release = () =>
    db.serverToken
      .updateMany({ where: { id: serverTokenId }, data: { welcomeSentAt: null } })
      .catch(err => console.error('[welcome-email] could not release the claim', err))

  try {
    const row = await db.serverToken.findUnique({
      where: { id: serverTokenId },
      select: {
        subdomain: true,
        serverIp: true,
        serverPassword: true,
        user: { select: { email: true } },
      },
    })
    if (!row?.user?.email) {
      await release()
      return 'no-recipient'
    }

    // The address the email links to. `subdomain` is authoritative when set
    // (a real custom domain, or the synthetic `ip-<IP>` form), and the bare IP
    // on the row is the fallback — so a ping that arrived without a payload can
    // no longer suppress the email, which is the second half of the old defect.
    const target = row.subdomain || (row.serverIp ? `ip-${row.serverIp}` : '')
    if (!target) {
      await release()
      return 'no-recipient'
    }

    await sendWelcomeEmail(
      row.user.email,
      target,
      row.serverIp && row.serverPassword
        ? { ip: row.serverIp, password: row.serverPassword }
        : undefined
    )
    return 'sent'
  } catch (err) {
    console.error('[welcome-email] send failed — releasing for the next ping', err)
    await release()
    return 'failed'
  }
}
