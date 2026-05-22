import { getProgress, initProgress, appendStep, failProgress } from '@/lib/kv'
import { db } from '@/lib/db'
import { wipeServer } from '@/lib/wipe-script'
import { deployToServer } from '@/lib/deploy'
import { sendInstallStartedEmail, sendDeployFailedEmail, sendRecoveryTokenEmail } from '@/lib/email'

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

export const MCP_TOOLS = [
  {
    name: 'register_and_deploy',
    description:
      'Register a new Fractera user and start the deployment of their server in one atomic call. Use this AFTER you have collected the user\'s email (entered twice for typo protection), server IP, and root password. Creates the User row (or reuses an existing one with the same email), creates a free Subscription, creates a ServerToken, wipes any previous installation on the target server, and launches bootstrap. Returns session_id (for check_status polling) and server_token (so the user can recover via retry_deploy if anything breaks).',
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
      'Check the current installation progress. Call this every 20-30 seconds after register_and_deploy or retry_deploy returns. Returns the current step, the list of completed steps (~44 total in a full bootstrap), and whether installation is done or failed.',
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
      'Retry a failed deployment using a server_token (from the failure email, the deploy-progress UI, or the dashboard). Wipes the previous broken install and runs a fresh deploy on the SAME server. Returns a new session_id — poll with check_status. Use this when the user reports a failed deploy or pastes a server_token.',
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

export async function handleToolCall(
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
            : 'Installation in progress. Keep polling every 20-30 seconds. Stream each newly-completed step to the user so they see continuous progress.',
    }
  }

  if (name === 'register_and_deploy') {
    const email = String(args.email ?? '').trim().toLowerCase()
    const ip = String(args.ip ?? '').trim()
    const password = String(args.password ?? '')
    const login = (typeof args.login === 'string' && args.login.trim()) ? args.login.trim() : 'root'
    const TAG = `[mcp:reg ${ip}]`
    console.log(`${TAG} called email=${email} login=${login}`)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { status: 'error', message: 'Invalid email. Ask the user to type a valid email twice for confirmation.' }
    }
    if (!ip) return { status: 'error', message: 'Missing IP address. Ask the user for their server IP (four groups of digits, e.g. 185.10.20.30).' }
    if (!password) return { status: 'error', message: 'Missing password. Ask the user for the root password of their server.' }

    // Idempotency guard. If the agent calls this tool twice for the same IP
    // (e.g. it thought the first call timed out and retried), do NOT launch a
    // second parallel bootstrap — two bootstraps on the same VPS race for
    // apt/npm/nginx and reliably kill each other. Find any non-terminal
    // ServerToken for this IP whose progress was updated recently and return
    // its identifiers instead.
    console.log(`${TAG} idempotency check`)
    const recentTokens = await db.serverToken.findMany({
      where: {
        serverIp: ip,
        status: { in: ['pending', 'provisioning', 'queued'] },
        deploySessionId: { not: null },
      },
      select: { token: true, deploySessionId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    for (const candidate of recentTokens) {
      if (!candidate.deploySessionId) continue
      const progress = await getProgress(candidate.deploySessionId)
      if (!progress) continue
      if (progress.status === 'installing') {
        const lastTs = progress.steps?.length ? progress.steps[progress.steps.length - 1].ts : 0
        const ageMs = Date.now() - lastTs
        // 20-min freshness window. Bootstrap reports at least once every few
        // minutes; if the last step is older than 20 min, the deploy is dead
        // and we should let the retry path through.
        if (ageMs < 20 * 60 * 1000) {
          console.log(`${TAG} idempotent return — active session ${candidate.deploySessionId} age=${ageMs}ms`)
          return {
            status: 'installing',
            session_id: candidate.deploySessionId,
            server_token: candidate.token,
            dashboard_url: 'https://fractera.ai/dashboard',
            message:
              'A deploy is already running for this server (started recently). Returning the existing session_id and server_token — do NOT call register_and_deploy again. Poll check_status(session_id) every 25-30 seconds and stream progress to the user.',
          }
        }
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
    const session_id = `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

    // 4. Init progress + welcome-start email (best effort — email failure must
    // not block the deploy launch).
    //
    // IMPORTANT: everything below runs SYNCHRONOUSLY inside the request
    // lifecycle. We tried backgrounding wipe+deploy via `void (async ...)()`
    // to make the MCP response snappier — that completely broke MCP deploys
    // because Vercel freezes serverless functions the moment the HTTP
    // response is returned. The "background" task never ran. Keep wipe +
    // deployToServer awaited.
    //
    // The total latency (30-60s) is acceptable: main flow /api/install does
    // the exact same thing and has worked in production for hundreds of
    // deploys. The "slow response triggers AI retry" problem is handled by
    // the IP-idempotency guard above + the hard rule in mcp-prompt.ts.
    await initProgress(session_id)
    await appendStep(session_id, { id: 'email_start', label: 'Confirmation email sent', done: true, ts: Date.now() })
    console.log(`${TAG} progress initialised — sending start + recovery-token emails`)
    // Both emails go out NOW, before the long wipe+SSH work, so they ALWAYS
    // arrive even if Vercel kills the function later. Previously the
    // recovery-token email was sent at the very end of register_and_deploy —
    // after wipe (30s) + deployToServer (5-30s SFTP) — and observed to be
    // dropped intermittently because the runtime was near maxDuration or
    // Resend was slow. Order here: install-started first (transactional
    // confirmation), then recovery-token (session_id + server_token).
    try { await sendInstallStartedEmail(email) } catch (err) { console.error(`${TAG} install-started email failed`, err) }
    try { await sendRecoveryTokenEmail(email, serverToken.token) } catch (err) { console.error(`${TAG} recovery-token email failed`, err) }

    // 5. Wipe (mandatory before bootstrap — see lib/wipe-script.ts for why)
    console.log(`${TAG} wipe start`)
    await appendStep(session_id, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
    try {
      await wipeServer(ip, login, password)
      await appendStep(session_id, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
      console.log(`${TAG} wipe done`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`${TAG} wipe failed:`, errMsg)
      const wipeErr = `WIPE_FAILED: ${errMsg}`
      await failProgress(session_id, wipeErr)
      await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: wipeErr } })
      try { await sendDeployFailedEmail(email, wipeErr, serverToken.token) } catch {}
      return {
        status: 'error',
        message: `Could not connect to the server (${errMsg}). Most likely the IP or password is wrong. Ask the user to double-check both and call retry_deploy(server_token, ip=..., password=...) with the corrected values.`,
        session_id,
        server_token: serverToken.token,
      }
    }

    // 6. Launch bootstrap. deployToServer SSHes in, uploads bootstrap.sh, and
    // launches it detached via `setsid ... &` — resolves quickly (~5 seconds).
    // The bootstrap then runs ~5-10 minutes ON THE CUSTOMER'S SERVER and
    // reports steps via /api/progress. The customer's server is what runs
    // the slow work, not this Vercel function.
    console.log(`${TAG} deployToServer start`)
    try {
      await deployToServer({
        ip,
        login,
        password,
        session_id,
        serverToken: serverToken.token,
      })
      console.log(`${TAG} deployToServer done — bootstrap uploaded and launched`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`${TAG} deployToServer failed:`, errMsg)
      await failProgress(session_id, errMsg)
      await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: errMsg } })
      try { await sendDeployFailedEmail(email, errMsg, serverToken.token) } catch {}
      return {
        status: 'error',
        message: `Deploy launch failed: ${errMsg}. Offer the user to retry with retry_deploy(server_token).`,
        session_id,
        server_token: serverToken.token,
      }
    }

    // (recovery-token email already sent before wipe — see step 4 above)

    return {
      status: 'installing',
      session_id,
      server_token: serverToken.token,
      dashboard_url: `https://fractera.ai/dashboard`,
      message:
        `Registration accepted. The bootstrap is now running on the customer's VPS — it takes 8 to 14 minutes (usually around 10).\n\n` +
        `WRITE YOUR REPLY TO THE USER EXACTLY LIKE THIS (translate to the user's language; keep the two identifiers verbatim inside code blocks; do not paraphrase or shorten):\n\n` +
        `---\n` +
        `Your deploy is running. Here are your two identifiers — save them; they are also being emailed to you right now:\n\n` +
        `\`\`\`\n` +
        `SESSION_ID:   ${session_id}\n` +
        `SERVER_TOKEN: ${serverToken.token}\n` +
        `\`\`\`\n\n` +
        `All updates from here onward go to your email:\n` +
        `- A confirmation email has just been sent.\n` +
        `- A second email with these identifiers (recovery token) is on its way — check it now, including spam.\n` +
        `- A welcome email with the final HTTPS URL of your server will arrive in 8-14 minutes.\n` +
        `- If anything fails, a failure email will arrive with the same recovery token.\n\n` +
        `You can safely close this chat. Bootstrap continues server-side and does not depend on this conversation.\n\n` +
        `If you want to come back later and check progress from here, just paste the SESSION_ID above and ask "what's the status" — I will check it once and report.\n` +
        `---\n\n` +
        `IMPORTANT RULES FOR THE AGENT (you):\n` +
        `1. Do NOT poll check_status automatically. The user's email is the source of truth. Polling 8-14 minutes of progress is wasted bandwidth and chat context — the user does not need it.\n` +
        `2. Only call check_status when the user explicitly asks (e.g. "what's the status", "did it finish", "any progress"). Then make ONE call with the SESSION_ID and report. Do NOT enter a polling loop.\n` +
        `3. Do NOT call register_and_deploy again. The deploy is already running. A retry only after the user explicitly reports a failure email AND wants to redo it — and then use retry_deploy(server_token), not register_and_deploy.`,
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

    const newSessionId = `mcp-retry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await initProgress(newSessionId)
    await appendStep(newSessionId, { id: 'retry_start', label: 'MCP retry initiated', done: true, ts: Date.now() })

    try {
      await db.serverToken.update({
        where: { id: record.id },
        data: { deploySessionId: newSessionId, status: 'pending', deployError: null },
      })
    } catch (err) {
      console.error('[mcp:retry_deploy] failed to update ServerToken', err)
    }

    await appendStep(newSessionId, { id: 'wipe_start', label: 'Cleaning previous installation', done: false, ts: Date.now() })
    try {
      await wipeServer(ip, loginOverride, password)
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
        try { await sendDeployFailedEmail(record.user.email, `WIPE_FAILED: ${errMsg}`, server_token) } catch {}
      }
      return {
        status: 'error',
        message: `Wipe failed: ${errMsg}. The most common cause is wrong credentials. Ask the user to confirm ip + password and call retry_deploy again with fresh values.`,
        session_id: newSessionId,
      }
    }

    try {
      await deployToServer({
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
        try { await sendDeployFailedEmail(record.user.email, errMsg, server_token) } catch {}
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
