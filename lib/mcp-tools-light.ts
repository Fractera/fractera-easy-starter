import { after } from 'next/server'
import { getProgress, initProgress, appendStep, failProgress } from '@/lib/kv'
import { db } from '@/lib/db'
import { wipeServerLight } from '@/lib/wipe-script-light'
import { deployLightToServer } from '@/lib/deploy-light'
import { sendLightInstallStartedEmail, sendLightDeployFailedEmail, sendLightRecoveryTokenEmail } from '@/lib/email'
import { findActiveDeployForIp } from '@/lib/deploy-lock'

// Default partner-VPS recommendation surfaced when the user says they don't
// have a server yet. Static for now; future MCP-per-partner URLs (e.g.
// fractera.ai/api/mcp?ref=<slug>) will override this via baseUrl / args.
const DEFAULT_VPS_PROVIDER = {
  name: 'Contabo',
  price: '~€3.60/mo',
  url: 'https://contabo.com/en/vps/cloud-vps-10/?image=ubuntu.332&qty=1&contract=12&storage-type=cloud-vps-10-150-gb-ssd',
  os: 'Ubuntu 24.04',
  specs: '4 vCPU / 6 GB RAM',
}

export const MCP_TOOLS_LIGHT = [
  {
    name: 'register_and_deploy',
    description:
      'Register a new Fractera Light user and start the deployment of their private backend in one atomic call. Fractera Light is a sovereign backend (NextAuth + database + media storage + git sync) WITHOUT any AI agents on the server — no Hermes, no LightRAG, no coding platforms. Use this AFTER you have collected the user\'s email (entered twice for typo protection), server IP, and root password. Creates the User row (or reuses an existing one with the same email), creates a free Subscription, creates a ServerToken, wipes any previous installation on the target server (main Fractera or Light), and launches bootstrap-light.sh. Returns session_id (for check_status polling) and server_token (so the user can recover via retry_deploy if anything breaks).',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'The email the user typed (and confirmed by re-typing). Welcome / failure emails go here.',
        },
        ip: {
          type: 'string',
          description: 'IPv4 address of the user\'s VPS, e.g. 185.10.20.30.',
        },
        password: {
          type: 'string',
          description: 'Root password for the VPS.',
        },
        login: {
          type: 'string',
          description: 'Optional — defaults to "root". Override only if the VPS provider gave a non-root username.',
        },
      },
      required: ['email', 'ip', 'password'],
    },
  },
  {
    name: 'check_status',
    description:
      'Check the current installation progress. ONE-SHOT only — call once when the user explicitly asks how the deploy is going, do not poll on a timer. Returns the current step, the list of completed steps (~25 total in a Light bootstrap), and whether installation is done or failed.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'The session_id returned by register_and_deploy or retry_deploy.' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'get_subdomain',
    description:
      'Return the assigned subdomain (and full HTTPS URL) once installation is complete. Poll this once after check_status reports status="done".',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: 'The session_id used during installation.' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'retry_deploy',
    description:
      'Retry a failed Fractera Light deployment using a server_token (from the failure email, the deploy-progress UI, or the dashboard). Wipes the previous broken install (both main Fractera and Light artifacts are cleaned) and runs a fresh Light deploy on the SAME server. Returns a new session_id — call check_status ONCE when the user asks for status. Use this when the user reports a failed Light deploy or pastes a server_token.',
    inputSchema: {
      type: 'object',
      properties: {
        server_token: {
          type: 'string',
          description: 'The unique server token the user received in the deploy-failure email, the active deploy UI, or the dashboard. Acts as the authorisation for this retry.',
        },
        ip: {
          type: 'string',
          description: 'Optional — only pass if the user discovered the original IP was wrong (e.g. typo). Otherwise the stored IP is used.',
        },
        login: {
          type: 'string',
          description: 'Optional — Linux user, defaults to root.',
        },
        password: {
          type: 'string',
          description: 'Optional — only pass if the user discovered the original password was wrong. Otherwise the stored password is used.',
        },
      },
      required: ['server_token'],
    },
  },
  {
    name: 'get_vps_recommendation',
    description:
      'Return a single recommended VPS provider for users who do not yet have a server. Call this ONLY when the user explicitly says they have no server. The user buys the VPS at this provider and comes back with IP + password.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

export async function handleToolCallLight(
  name: string,
  args: Record<string, unknown>,
  baseUrl: string,
): Promise<unknown> {
  void baseUrl

  if (name === 'get_vps_recommendation') {
    return {
      provider: DEFAULT_VPS_PROVIDER,
      note:
        'Recommend Contabo as the default VPS. Tell the user the price and what to order (Ubuntu 24.04, 4 vCPU / 6 GB RAM). Ask them to come back with the server IP and the root password.',
    }
  }

  if (name === 'get_subdomain') {
    const session_id = String(args.session_id ?? '').trim()
    if (!session_id) return { status: 'error', message: 'Missing session_id' }
    const progress = await getProgress(session_id)
    if (!progress) {
      return { status: 'unknown', message: 'No installation found for this session_id. It may have expired or never existed.' }
    }
    if (progress.status === 'done' && progress.subdomain) {
      return { status: 'complete', subdomain: progress.subdomain, url: `https://${progress.subdomain}` }
    }
    if (progress.status === 'error') {
      return { status: 'error', message: progress.error ?? 'Unknown deploy error' }
    }
    return { status: 'pending', message: 'Installation is still running. Keep checking with check_status until status becomes "done".' }
  }

  if (name === 'check_status') {
    const session_id = String(args.session_id ?? '').trim()
    if (!session_id) return { status: 'error', message: 'Missing session_id' }
    const progress = await getProgress(session_id)
    if (!progress) {
      return {
        status: 'unknown',
        message: 'No installation found for this session_id. It may have expired (TTL 1h while installing, 24h after completion).',
      }
    }
    const steps = progress.steps ?? []
    const doneCount = steps.filter(s => s.done).length
    const lastStep = steps[steps.length - 1]
    return {
      session_id,
      status: progress.status,
      subdomain: progress.subdomain ?? null,
      error: progress.error ?? null,
      step_count: steps.length,
      done_count: doneCount,
      current_step: lastStep ? { label: lastStep.label, done: lastStep.done } : null,
      steps,
      hint:
        progress.status === 'done'
          ? `Installation complete. Subdomain: ${progress.subdomain}. Tell the user.`
          : progress.status === 'error'
            ? `Installation failed: ${progress.error}. Offer the user to retry — if they agree, call retry_deploy with the server_token.`
            : 'Installation in progress. ONE-SHOT call only — report the current step and stop. Do NOT poll on a timer; email + dashboard are the authoritative status channels.',
    }
  }

  if (name === 'register_and_deploy') {
    const email = String(args.email ?? '').trim().toLowerCase()
    const ip = String(args.ip ?? '').trim()
    const password = String(args.password ?? '')
    const login = (typeof args.login === 'string' && args.login.trim()) ? args.login.trim() : 'root'
    const TAG = `[mcp-light:reg ${ip}]`
    console.log(`${TAG} called email=${email} login=${login}`)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { status: 'error', message: 'Invalid email. Ask the user to type a valid email twice for confirmation.' }
    }
    if (!ip) return { status: 'error', message: 'Missing IP address. Ask the user for their server IP (four groups of digits, e.g. 185.10.20.30).' }
    if (!password) return { status: 'error', message: 'Missing password. Ask the user for the root password of their server.' }

    console.log(`${TAG} idempotency check`)
    const activeDeploy = await findActiveDeployForIp(ip)
    if (activeDeploy) {
      console.log(`${TAG} idempotent return — active session ${activeDeploy.sessionId} age=${activeDeploy.ageMs}ms`)
      return {
        status: 'installing',
        session_id: activeDeploy.sessionId,
        server_token: activeDeploy.serverToken,
        dashboard_url: 'https://fractera.ai/dashboard',
        message:
          'A deploy is already running for this server (started recently). Returning the existing session_id and server_token — do NOT call register_and_deploy again. Poll check_status(session_id) every 25-30 seconds and stream progress to the user.',
      }
    }

    // 1. User row — find-or-create by email
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email },
    })

    // 2. Free Subscription — reuse existing free if any, else create
    let sub = await db.subscription.findFirst({
      where: { userId: user.id, planId: 'free', status: { not: 'cancelled' } },
    })
    if (!sub) {
      sub = await db.subscription.create({
        data: {
          userId: user.id,
          stripeCustomerId: 'free',
          status: 'active',
          planId: 'free',
          currentPeriodEnd: new Date('2099-01-01'),
        },
      })
    }

    // 3. New session id + ServerToken
    // Prefix MUST start with `light-` — /api/progress (frozen) uses
    // session_id.startsWith('light-') to pick sendLightWelcomeEmail over
    // the main sendWelcomeEmail (which mentions Hermes / Brain / 5 AI
    // platforms — none of which exist in a Light server).
    const session_id = `light-mcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    console.log(`${TAG} session_id=${session_id} — creating ServerToken`)
    const serverToken = await db.serverToken.create({
      data: {
        userId: user.id,
        subscriptionId: sub.id,
        status: 'pending',
        deploySessionId: session_id,
        serverIp: ip,
        serverPassword: password,
      },
    })

    // 4. Init progress + 2 emails (instant). Everything below this block runs
    // SYNCHRONOUSLY before we return the MCP response — must complete in <60s
    // because Claude.ai / Codex MCP clients hard-cut a tool call at ~60s.
    // Heavy work (wipe + SSH/SFTP upload) is moved to after() below.
    await initProgress(session_id)
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    // Mark wipe_start now (done:false) so the very next check_status reports
    // "wipe in progress" rather than "no work scheduled".
    await appendStep(session_id, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
    console.log(`${TAG} progress initialised — sending start + recovery-token emails`)
    try { await sendLightInstallStartedEmail(email) } catch (err) { console.error(`${TAG} install-started email failed`, err) }
    try { await sendLightRecoveryTokenEmail(email, serverToken.token) } catch (err) { console.error(`${TAG} recovery-token email failed`, err) }

    // 5. Schedule wipe + deploy AFTER the HTTP response is sent.
    //
    // Why next/server `after()` and not `void (async ...)()`:
    //   - Vercel serverless functions freeze the moment the response is
    //     returned. An unawaited promise (`void (async ...)()`) is killed
    //     mid-execution — we saw this in commit 57fcc48 → reverted in fab8928.
    //   - `after()` is the Next.js-supported way to keep work alive past the
    //     response. Vercel honors it via the platform-level waitUntil() and
    //     keeps the function running up to maxDuration (300s for this route).
    //
    // All failures inside the after() body are surfaced via the same
    // channels the main-flow deploy uses: failProgress() sets status='error'
    // in Redis, ServerToken.status='error', sendLightDeployFailedEmail() fires.
    // The agent / dashboard / UI poller all see the failure on their next
    // check_status / progress fetch.
    const bgTag = `[mcp-light:bg ${ip} ${session_id.slice(-7)}]`
    after(async () => {
      console.log(`${bgTag} background work started`)
      try {
        try {
          await wipeServerLight(ip, login, password)
          await appendStep(session_id, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
          console.log(`${bgTag} wipe done`)
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error(`${bgTag} wipe failed:`, errMsg)
          const wipeErr = `WIPE_FAILED: ${errMsg}`
          await failProgress(session_id, wipeErr)
          await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: wipeErr } })
          try { await sendLightDeployFailedEmail(email, wipeErr, serverToken.token) } catch {}
          return
        }

        try {
          await deployLightToServer({
            ip,
            login,
            password,
            session_id,
            serverToken: serverToken.token,
          })
          console.log(`${bgTag} deployLightToServer done — bootstrap-light uploaded and launched`)
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error(`${bgTag} deployLightToServer failed:`, errMsg)
          await failProgress(session_id, errMsg)
          await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: errMsg } })
          try { await sendLightDeployFailedEmail(email, errMsg, serverToken.token) } catch {}
        }
      } catch (err) {
        // Outer safety net — anything not caught above must still leave the
        // ServerToken + Redis in a sane state, not status='installing' forever.
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`${bgTag} outer catch:`, errMsg)
        try { await failProgress(session_id, errMsg) } catch {}
        try {
          await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: errMsg } })
        } catch {}
      }
    })

    return {
      status: 'installing',
      session_id,
      server_token: serverToken.token,
      dashboard_url: `https://fractera.ai/dashboard`,
      message:
        `Registration accepted. The Fractera Light bootstrap is now running on the customer's VPS — it takes 6 to 10 minutes (Light is faster than the main Fractera install because no AI agents, no Hermes, no LightRAG are deployed).\n\n` +
        `WRITE YOUR REPLY TO THE USER EXACTLY LIKE THIS (translate to the user's language; keep the two identifiers verbatim inside code blocks; do not paraphrase or shorten):\n\n` +
        `---\n` +
        `Your Fractera Light deploy is running. Here are your two identifiers — save them; they are also being emailed to you right now:\n\n` +
        `\`\`\`\n` +
        `SESSION_ID:   ${session_id}\n` +
        `SERVER_TOKEN: ${serverToken.token}\n` +
        `\`\`\`\n\n` +
        `All updates from here onward go to your email:\n` +
        `- A confirmation email has just been sent.\n` +
        `- A second email with these identifiers (recovery token) is on its way — check it now, including spam.\n` +
        `- A welcome email with the final HTTPS URL of your Light backend will arrive in 6-10 minutes.\n` +
        `- If anything fails, a failure email will arrive with the same recovery token.\n\n` +
        `You can safely close this chat. Bootstrap continues server-side and does not depend on this conversation.\n\n` +
        `If you want to come back later and check progress from here, just paste the SESSION_ID above and ask "what's the status" — I will check it once and report.\n` +
        `---\n\n` +
        `IMPORTANT RULES FOR THE AGENT (you):\n` +
        `1. Do NOT poll check_status automatically. The user's email is the source of truth. Polling 8-14 minutes of progress is wasted bandwidth and chat context — the user does not need it.\n` +
        `2. Only call check_status when the user explicitly asks (e.g. "what's the status", "did it finish", "any progress"). Then make ONE call with the SESSION_ID and report. Do NOT enter a polling loop.\n` +
        `3. Do NOT call register_and_deploy again. The deploy is already running. A retry only after the user explicitly reports a failure email AND wants to redo it — and then use retry_deploy(server_token), not register_and_deploy.\n` +
        `4. NEVER tell the user the deploy is stuck, hung, frozen, or failed just because a tool call returned slowly or as an error to you. The deploy runs on the customer's server independently of this chat — the chat layer is unreliable, the server is reliable. If you are unsure, tell the user verbatim (translated to their language): "I cannot tell the server state from this chat. Please open https://fractera.ai/dashboard — it is the authoritative source of truth. If you want, paste the SESSION_ID and I will read Redis progress once." Do NOT speculate failures.`,
    }
  }

  if (name === 'retry_deploy') {
    const server_token = String(args.server_token ?? '').trim()
    if (!server_token) {
      return { status: 'error', message: 'Missing server_token. Ask the user to paste the token from the failure email, the deploy UI or the dashboard.' }
    }

    const record = await db.serverToken.findUnique({
      where: { token: server_token },
      select: {
        id: true,
        status: true,
        serverIp: true,
        serverPassword: true,
        userId: true,
        user: { select: { email: true } },
      },
    })
    if (!record) {
      return { status: 'error', message: 'No server found for this token. Double-check the token from the failure email.' }
    }
    if (record.status === 'active') {
      return { status: 'already_active', message: 'This server is already active and running. No retry needed.' }
    }
    if (!record.serverIp) {
      return { status: 'error', message: 'No server IP on record. Ask the user to provide the IP via the "ip" argument.' }
    }

    const ipOverride = typeof args.ip === 'string' && args.ip.trim() ? args.ip.trim() : null
    const passwordOverride = typeof args.password === 'string' && args.password.trim() ? args.password.trim() : null
    const loginOverride = typeof args.login === 'string' && args.login.trim() ? args.login.trim() : 'root'

    const ip = ipOverride ?? record.serverIp
    const password = passwordOverride ?? record.serverPassword
    if (!password) {
      return { status: 'error', message: 'No server password on record. Ask the user to provide the root password via the "password" argument.' }
    }

    const newSessionId = `light-mcp-retry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await initProgress(newSessionId)
    await appendStep(newSessionId, { id: 'retry_start', label: 'MCP retry initiated', done: true, ts: Date.now() })

    try {
      await db.serverToken.update({
        where: { id: record.id },
        data: { deploySessionId: newSessionId, status: 'pending', deployError: null },
      })
    } catch (err) {
      console.error('[mcp-light:retry_deploy] failed to update ServerToken', err)
    }

    await appendStep(newSessionId, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
    try {
      await wipeServerLight(ip, loginOverride, password)
      await appendStep(newSessionId, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      await failProgress(newSessionId, `WIPE_FAILED: ${errMsg}`)
      try {
        await db.serverToken.update({
          where: { id: record.id },
          data: { status: 'error', deployError: `WIPE_FAILED: ${errMsg}` },
        })
      } catch {}
      if (record.user?.email) {
        try { await sendLightDeployFailedEmail(record.user.email, `WIPE_FAILED: ${errMsg}`, server_token) } catch {}
      }
      return {
        status: 'error',
        message: `Wipe failed: ${errMsg}. The most common cause is wrong credentials. Ask the user to confirm ip + password and call retry_deploy again with fresh values.`,
        session_id: newSessionId,
      }
    }

    try {
      await deployLightToServer({
        ip,
        login: loginOverride,
        password,
        session_id: newSessionId,
        serverToken: server_token,
      })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      await failProgress(newSessionId, errMsg)
      try {
        await db.serverToken.update({
          where: { id: record.id },
          data: { status: 'error', deployError: errMsg },
        })
      } catch {}
      if (record.user?.email) {
        try { await sendLightDeployFailedEmail(record.user.email, errMsg, server_token) } catch {}
      }
      return {
        status: 'error',
        message: `Deploy launch failed: ${errMsg}.`,
        session_id: newSessionId,
      }
    }

    return {
      status: 'retry_started',
      session_id: newSessionId,
      server_token,
      message: 'Retry deploy started. Poll check_status(session_id) every 25-30 seconds until status becomes "done" or "error".',
    }
  }

  return { error: `Unknown tool: ${name}` }
}
