import { NextRequest, NextResponse } from 'next/server'
import { deployToServer } from '@/lib/deploy'
import { wipeServer } from '@/lib/wipe-script'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { initProgress, appendStep, failProgress } from '@/lib/kv'
import { sendInstallStartedEmail, sendRecoveryTokenEmail } from '@/lib/email'
import { releaseServersOnIp } from '@/lib/server-takeover'
import { serializeComponents, isComponentId, type ComponentId } from '@/lib/components-catalog'
import { isFrameworkId, resolveSlotRepoUrl, DEFAULT_FRAMEWORK } from '@/lib/frameworks-catalog'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { ip, login, password, session_id, platform, serverToken: existingToken, components, framework, repoUrl } = await req.json()

  if (!ip || !login || !password || !session_id) {
    return NextResponse.json({ error: 'Missing ip, login, password or session_id' }, { status: 400 })
  }

  // App-slot project (pivot 2026-06-16): the form sends `framework` (a curated
  // starter) and, for own-repo, `repoUrl`. We resolve the effective repo URL to clone
  // into the slot: own-repo → the user's URL; a preset (e.g. next) → its catalog repo;
  // fractera-pro → '' (no clone → keep the cloned reference app). Threaded into
  // deployToServer, which sanitizes + env-passes to bootstrap. Default stays byte-identical.
  const slotFramework = isFrameworkId(framework) ? framework : DEFAULT_FRAMEWORK
  const slotRepoUrl = resolveSlotRepoUrl(slotFramework, typeof repoUrl === 'string' ? repoUrl : undefined)

  // Selective install (S2). The form sends `components` ONLY in custom mode:
  //   - absent/undefined → full install (componentsArg stays undefined → bootstrap installs all)
  //   - array (possibly empty) → respect it; [] serializes to 'none' = CORE only (server, no AI)
  const componentsArg = Array.isArray(components)
    ? serializeComponents(components.filter(isComponentId) as ComponentId[])
    : undefined

  // For authenticated users: create a serverToken so the server appears in dashboard
  // and the email pipeline has a known recipient. Pool provisioning uses /api/pool/provision
  // and never hits this route — this block is own-server only.
  let tokenForBootstrap = existingToken ?? ''
  let serverIdForBootstrap = ''
  const session = await auth()
  const userEmail = session?.user?.email ?? null
  const userId = session?.user?.id ?? null

  if (userId && userEmail) {
    // Create free subscription (idempotent — reuse if one already exists and isn't cancelled)
    let sub = await db.subscription.findFirst({
      where: { userId, planId: 'free', status: { not: 'cancelled' } },
    })
    if (!sub) {
      sub = await db.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'free',
          status: 'active',
          planId: 'free',
          currentPeriodEnd: new Date('2099-01-01'),
        },
      })
    }

    const newToken = await db.serverToken.create({
      data: {
        userId,
        subscriptionId: sub.id,
        status: 'pending',
        deploySessionId: session_id,
        serverIp: ip,
        // Privacy: we never persist the real SSH password. Bootstrap uses it
        // in-memory once, then we forget it. Downstream wipe/destroy that
        // relied on this column will fail until refactored to a passwordless
        // path (server-side daemon, Contabo API, or user-initiated wipe).
        serverPassword: '*****',
        // IP-mode identifier: never DNS-resolved. Triggers HTTP IP:port
        // rendering in welcome email + dashboard.
        subdomain: `ip-${ip}`,
      },
    })
    tokenForBootstrap = newToken.token
    serverIdForBootstrap = newToken.id
  }

  // Step 1: init progress + send confirmation email BEFORE SSH so it always fires
  await initProgress(session_id)
  if (userEmail) {
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    await sendInstallStartedEmail(userEmail)
    // Best-effort recovery-token follow-up. The install-started email above
    // does not carry the token because the ServerToken row may not exist for
    // existing-token paths; but if we DO have a token now, send the recovery
    // email so the user can re-engage via MCP later if anything breaks.
    if (tokenForBootstrap) {
      try { await sendRecoveryTokenEmail(userEmail, tokenForBootstrap) } catch (err) {
        console.error('[install] recovery-token email failed', err)
      }
    }
  }

  // Step 2: wipe any previous installation BEFORE bootstrap runs. See
  // lib/wipe-script.ts for why this is mandatory (idempotency-check
  // soft_step bodies in bootstrap.sh silently skip work when stale
  // artifacts exist, causing 2-hour-frozen-at-57% deploys).
  await appendStep(session_id, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
  try {
    await wipeServer(ip, login, password)
    await appendStep(session_id, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
    // Takeover cleanup: the IP is now wiped, so any other server record still
    // pointing at it (a previous owner's phantom server) must disappear from
    // their dashboard. Best-effort — never abort the deploy on cleanup failure.
    try {
      await releaseServersOnIp(ip, tokenForBootstrap)
    } catch (err) {
      console.error('[install] releaseServersOnIp failed (continuing)', err)
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const wipeErr = `WIPE_FAILED: could not clean previous installation — ${errMsg}`
    await failProgress(session_id, wipeErr)
    return NextResponse.json({ error: wipeErr, recovery: 'mcp' }, { status: 500 })
  }

  // Step 3: SSH + upload bootstrap + launch (initProgress is idempotent — won't wipe email_start step)
  // Resolve the non-secret server id for the existing-token path too (MCP recovery / re-deploy),
  // so NEXT_PUBLIC_SERVER_ID is baked even when this route didn't just create the row.
  if (!serverIdForBootstrap && tokenForBootstrap) {
    const existing = await db.serverToken.findUnique({ where: { token: tokenForBootstrap }, select: { id: true } }).catch(() => null)
    if (existing) serverIdForBootstrap = existing.id
  }
  await deployToServer({
    ip, login, password, session_id, platform,
    serverToken: tokenForBootstrap, serverId: serverIdForBootstrap, components: componentsArg,
    // App-slot project (pivot 2026-06-16) — additive; default (fractera-pro/absent)
    // keeps the deploy byte-identical. deploy.ts sanitizes + env-passes to bootstrap.
    framework: slotFramework,
    repoUrl: slotRepoUrl || undefined,
  })

  return NextResponse.json({ session_id, status: 'installing' })
}
