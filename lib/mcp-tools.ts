import { after } from 'next/server'
import { getProgress, initProgress, appendStep, failProgress } from '@/lib/kv'
import { db } from '@/lib/db'
import { wipeServer } from '@/lib/wipe-script'
import { deployToServer } from '@/lib/deploy'
import { sendInstallStartedEmail, sendDeployFailedEmail, sendRecoveryTokenEmail } from '@/lib/email'
import { releaseServersOnIp } from '@/lib/server-takeover'
import { serializeComponents, isComponentId, ALL_COMPONENT_IDS, type ComponentId } from '@/lib/components-catalog'
import { getSectionList, getSection, type InfoLang } from '@/lib/project-info/content'

// Turn the agent-supplied components value into the bootstrap arg string.
//   undefined / not an array  → undefined  → deploy installs everything (default)
//   array (possibly empty)    → 'all' | 'none' | csv  (empty = CORE only, no AI)
function resolveMcpComponents(raw: unknown): string | undefined {
  if (!Array.isArray(raw)) return undefined
  return serializeComponents(raw.filter(isComponentId) as ComponentId[])
}

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
      'Register a new Fractera user and start the deployment of their server in one atomic call. Use this AFTER you have collected the user\'s email (entered twice for typo protection), server IP, and root password. Creates the User row (or reuses an existing one with the same email), creates a free Subscription, creates a ServerToken, wipes any previous installation on the target server, and launches bootstrap. The deploy is IP-first (phase-1): the server comes up on plain HTTP at http://<IP>:3002 in 8-14 minutes; it does NOT get a domain or HTTPS cert here (that is an optional later step inside the workspace). Returns session_id (for a single on-demand check_status read — do not poll) and server_token (so the user can recover via retry_deploy if anything breaks). Call this AT MOST ONCE per conversation.',
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
        components: {
          type: 'array',
          items: {
            type: 'string',
            enum: ALL_COMPONENT_IDS,
          },
          description:
            'Optional — which AI tools to install (lets the user save money on a smaller server). OMIT this to install the full recommended set (5 coding agents + Memory + Brain). Pass a subset of ["claude-code","codex","gemini-cli","qwen-code","kimi-code","memory","brain"] to install only those. Pass an empty array [] for a plain server with NO AI at all (just database + sign-in). The server, database, storage, sign-in and Admin panel are always installed regardless.',
        },
      },
      required: ['email', 'ip', 'password'],
    },
  },
  {
    name: 'check_status',
    description:
      'Read the current installation progress ONCE, on demand. Call this only when the user explicitly asks how the deploy is going (e.g. "what is the status", "did it finish") — never on a timer and never in a polling loop. The deploy takes 8-14 minutes and the authoritative status channels are the email pipeline + the dashboard; one read on request is enough. Returns the current step, the list of completed steps (~44 total in a full bootstrap), and whether installation is done or failed.',
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
      'Return the final entry address of the server once installation is complete. In phase-1 (IP-first) this is a plain-HTTP Admin URL of the form http://<IP>:3002 — the server has NO domain and NO HTTPS cert yet (attaching a custom domain with HTTPS is an optional later step the user does inside Admin -> Personal Domain). Call this once after check_status reports status="done".',
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
        components: {
          type: 'array',
          items: {
            type: 'string',
            enum: ALL_COMPONENT_IDS,
          },
          description:
            'Optional — same meaning as in register_and_deploy. OMIT to reinstall the full recommended toolset. Pass a subset (or [] for none) only if the user wants to change which AI tools are installed on this retry.',
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
  {
    name: 'get_project_info',
    description:
      'Project reference / help desk about Fractera. Use this to answer ANY user question about what Fractera is, how it works, its architecture, components, modes, data ownership, pricing, use cases, partner program, etc. — especially while a deploy is running and the user wants to learn more. TOKEN-ECONOMY: call with NO arguments first to get the lightweight list of section ids+titles, then call again with a single `section` id to fetch just that section. NEVER try to fetch everything at once; pull only the section(s) relevant to the user question. Set `lang:"ru"` for Russian-speaking users.',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: 'A section id from the list returned when called with no section. Omit to get the list (table of contents) first.',
        },
        lang: {
          type: 'string',
          enum: ['en', 'ru'],
          description: 'Language of the returned content. Defaults to "en". Use "ru" for Russian-speaking users.',
        },
      },
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

  if (name === 'get_project_info') {
    const lang: InfoLang = args.lang === 'ru' ? 'ru' : 'en'
    const section = typeof args.section === 'string' ? args.section.trim() : ''
    if (!section) {
      // Lightweight table of contents — call again with one `section` id.
      return {
        sections: getSectionList().map(({ id, title, titleRu }) => ({
          id,
          title: lang === 'ru' ? (titleRu ?? title) : title,
        })),
        note:
          'This is the list of available sections (table of contents). To answer the user, call get_project_info again with a single `section` id — fetch ONLY the section(s) relevant to the question, never all of them. For purpose/use-case questions, combine the section content with your general knowledge to help the user find how Fractera fits their case; for architecture/facts, answer strictly from the section content. For COUNTRY-SPECIFIC questions (laws, data residency, local providers) use the section id pattern "sovereignty-<country>" — currently only "sovereignty-russia" exists; if the user asks about another country, answer from general sections and say country-specific guidance is only available for Russia so far.',
      }
    }
    const found = getSection(section, lang)
    if (!found) {
      return {
        status: 'not_found',
        message: `No section "${section}". Call get_project_info with no section to get the valid list.`,
      }
    }
    return { id: found.id, title: found.title, body: found.body }
  }

  if (name === 'get_subdomain') {
    const session_id = String(args.session_id ?? '').trim()
    if (!session_id) return { status: 'error', message: 'Missing session_id' }
    const progress = await getProgress(session_id)
    if (!progress) {
      return { status: 'unknown', message: 'No installation found for this session_id. It may have expired or never existed.' }
    }
    if (progress.status === 'done' && progress.subdomain) {
      // Phase-1 is IP-first: the server is live on plain HTTP at http://<IP>:3002
      // (Admin). It has NO domain and NO TLS cert yet — that is a separate later
      // step in Admin → Personal Domain. `progress.subdomain` is the `ip-<IP>`
      // form (or a bare IP on legacy records); strip the prefix and build the
      // insecure URL. Never emit https:// here — there is no cert in phase-1.
      const sd = progress.subdomain
      const ip = sd.startsWith('ip-') ? sd.slice(3) : sd
      const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)
      const url = isIp ? `http://${ip}:3002` : `https://admin.${sd}`
      return {
        status: 'complete',
        subdomain: sd,
        url,
        note: isIp
          ? 'The workspace is live on plain HTTP at this address (Admin). HTTPS and a custom domain are an optional later step the user runs inside Admin -> Personal Domain.'
          : undefined,
      }
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
          ? `Installation complete. The workspace is live on plain HTTP — call get_subdomain(session_id) to get the exact http://<IP>:3002 address, then tell the user. Do NOT promise HTTPS or a domain: phase-1 is IP-only; a custom domain + HTTPS is an optional later step inside Admin -> Personal Domain.`
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
    const components = resolveMcpComponents(args.components) // undefined => install all
    const TAG = `[mcp:reg ${ip}]`
    console.log(`${TAG} called email=${email} login=${login} components=${components ?? 'all'}`)

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
        // Privacy: never persist the real SSH password (see install/route.ts).
        serverPassword: '*****',
        // IP-mode (phase-1) identifier — MUST mirror install/route.ts:59. This
        // `ip-<IP>` seed is load-bearing: bootstrap's completion ping carries the
        // BARE IP, and ping/route.ts only keeps the DB value when it is already
        // "meaningful" (startsWith('ip-') or a real domain). Without this seed the
        // first ping adopts the bare IP, sendWelcomeEmail() sees isIpMode=false,
        // and the welcome email + dashboard render broken https://<bare-IP> links
        // for a server that only speaks plain HTTP. MCP is phase-1 / IP-first only
        // (no domain, no cert — that is the Admin → Personal Domain wizard later).
        subdomain: `ip-${ip}`,
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
    try { await sendInstallStartedEmail(email) } catch (err) { console.error(`${TAG} install-started email failed`, err) }
    try { await sendRecoveryTokenEmail(email, serverToken.token) } catch (err) { console.error(`${TAG} recovery-token email failed`, err) }

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
    // in Redis, ServerToken.status='error', sendDeployFailedEmail() fires.
    // The agent / dashboard / UI poller all see the failure on their next
    // check_status / progress fetch.
    const bgTag = `[mcp:bg ${ip} ${session_id.slice(-7)}]`
    after(async () => {
      console.log(`${bgTag} background work started`)
      try {
        try {
          await wipeServer(ip, login, password)
          await appendStep(session_id, { id: 'wipe_start', label: 'Previous installation cleaned', done: true, ts: Date.now() })
          console.log(`${bgTag} wipe done`)
          // Takeover cleanup (mirror install/route.ts:94): the IP is now wiped, so
          // any other ServerToken still pointing at it (a previous owner's phantom)
          // must disappear from their dashboard. Best-effort — never abort on failure.
          try {
            await releaseServersOnIp(ip, serverToken.token)
          } catch (err) {
            console.error(`${bgTag} releaseServersOnIp failed (continuing)`, err)
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error(`${bgTag} wipe failed:`, errMsg)
          const wipeErr = `WIPE_FAILED: ${errMsg}`
          await failProgress(session_id, wipeErr)
          await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: wipeErr } })
          try { await sendDeployFailedEmail(email, wipeErr, serverToken.token) } catch {}
          return
        }

        try {
          await deployToServer({
            ip,
            login,
            password,
            session_id,
            serverToken: serverToken.token,
            serverId: serverToken.id,
            components, // undefined => install all (default)
          })
          console.log(`${bgTag} deployToServer done — bootstrap uploaded and launched`)
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error(`${bgTag} deployToServer failed:`, errMsg)
          await failProgress(session_id, errMsg)
          await db.serverToken.update({ where: { id: serverToken.id }, data: { status: 'error', deployError: errMsg } })
          try { await sendDeployFailedEmail(email, errMsg, serverToken.token) } catch {}
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
        `- A welcome email with the address of your server (the form http://<your-IP>:3002) will arrive in 8-14 minutes. The server runs on plain HTTP at first; attaching your own domain with HTTPS is an optional later step you do inside the workspace (Admin -> Personal Domain).\n` +
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
    const components = resolveMcpComponents(args.components) // undefined => reinstall full set

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
        // Re-seed the `ip-<IP>` subdomain (phase-1). A retry always wipes and
        // re-runs bootstrap, which lands the server back in INSECURE/IP mode
        // (FRACTERA_IP_NODOMAIN_MODE=true) — so the record must carry the
        // `ip-<IP>` form again, otherwise the completion ping adopts the bare IP
        // and the welcome email renders broken https://<bare-IP> links. Same
        // load-bearing reason as register_and_deploy / install/route.ts:59.
        data: { deploySessionId: newSessionId, status: 'pending', deployError: null, subdomain: `ip-${ip}` },
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
        serverId: record.id,
        components, // undefined => reinstall full set
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
