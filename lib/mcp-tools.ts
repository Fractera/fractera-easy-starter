import { MAIN_PROVIDERS, EXTENDED_PROVIDERS } from '@/providers.config'
import { getProgress, initProgress, appendStep, failProgress } from '@/lib/kv'
import { db } from '@/lib/db'
import { wipeServer } from '@/lib/wipe-script'
import { deployToServer } from '@/lib/deploy'

export const MCP_TOOLS = [
  {
    name: 'get_hosting_options',
    description: 'Returns list of VPS hosting providers with prices and recommendations. Pass extended=true to get the full list.',
    inputSchema: {
      type: 'object',
      properties: {
        extended: {
          type: 'boolean',
          description: 'If true, returns the full list of all supported providers',
        },
      },
      required: [],
    },
  },
  {
    name: 'generate_install_command',
    description: 'Generates a one-line curl command for the user to run on their server',
    inputSchema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['hetzner', 'digitalocean', 'oracle', 'existing'],
          description: 'The VPS provider the user chose, or "existing" if they already have a server',
        },
        session_id: {
          type: 'string',
          description: 'Unique session identifier for this installation',
        },
      },
      required: ['provider', 'session_id'],
    },
  },
  {
    name: 'get_subdomain',
    description: 'Returns the assigned subdomain once installation is complete. Poll this after the user confirms the install command has finished running. Returns status: pending while installing, complete with subdomain when done.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session_id used during installation',
        },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'check_status',
    description: 'Check the current installation status. Call this every 20-30 seconds after installation starts to get progress updates. Returns current step, the list of completed steps, and whether installation is complete or failed.',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: {
          type: 'string',
          description: 'The session_id used during installation',
        },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'retry_deploy',
    description: 'Retry a failed deployment. Pass the server_token the user got from the failure email or dashboard. The tool wipes the previous broken installation and runs a fresh deploy on the same server. Returns a new session_id — poll progress with check_status. Use this when the user reports a failed deploy or pasted a server_token.',
    inputSchema: {
      type: 'object',
      properties: {
        server_token: {
          type: 'string',
          description: 'The unique server token the user received in the deploy-failure email or dashboard. Acts as the authorisation for this retry.',
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
]

const SPECIAL_OPTIONS = [
  { number: 0, provider: 'show_more', name: 'Show more options', url: null, price: null, specs: null, note: 'See all supported providers' },
  { number: 0, provider: 'existing', name: 'I already have a server', url: null, price: null, specs: null, note: 'Connect your existing Linux VPS (Ubuntu 22.04+)' },
]

function buildOptions(providers: typeof MAIN_PROVIDERS) {
  return [
    ...providers.map((p, i) => ({ number: i + 1, ...p })),
    { ...SPECIAL_OPTIONS[0], number: providers.length + 1 },
    { ...SPECIAL_OPTIONS[1], number: providers.length + 2 },
  ]
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  baseUrl: string,
): Promise<unknown> {
  void baseUrl

  if (name === 'get_hosting_options') {
    const extended = args.extended === true || args.extended === 'true'
    const options = buildOptions(extended ? EXTENDED_PROVIDERS : MAIN_PROVIDERS)
    return {
      disclaimer: 'Prices are approximate and may differ from the provider\'s current rates. Always check the provider\'s website for up-to-date pricing.',
      options,
    }
  }

  if (name === 'generate_install_command') {
    const provider = String(args.provider ?? '')
    const session_id = String(args.session_id ?? '')

    if (provider === 'existing') {
      const scriptUrl = `https://fractera.ai/api/script?provider=existing&session_id=${session_id}`
      return {
        command: `curl -fsSL "${scriptUrl}" | sudo bash`,
        session_id,
        note: 'The user already has a server. Ask them for: 1) the server IP address, 2) confirm it runs Ubuntu 22.04+ with root or sudo access. Then tell them to open their terminal (SSH or provider console) and run this command.',
      }
    }

    const scriptUrl = `https://fractera.ai/api/script?provider=${provider}&session_id=${session_id}`
    return {
      command: `curl -fsSL "${scriptUrl}" | sudo bash`,
      session_id,
      note: 'IMPORTANT: Before showing this command, first explain to the user HOW to open their server terminal (use the provider-specific instructions from Step 8). Only then show the command and tell them to copy-paste it and press Enter. Installation takes about 5 minutes.',
    }
  }

  if (name === 'get_subdomain') {
    const session_id = String(args.session_id ?? '')
    if (!session_id) return { status: 'error', message: 'Missing session_id' }
    const progress = await getProgress(session_id)
    if (!progress) {
      return {
        status: 'unknown',
        message: 'No installation found for this session_id. It may have expired (TTL 1h while installing, 24h after completion) or never existed.',
      }
    }
    if (progress.status === 'done' && progress.subdomain) {
      return { status: 'complete', subdomain: progress.subdomain, url: `https://${progress.subdomain}` }
    }
    if (progress.status === 'error') {
      return { status: 'error', message: progress.error ?? 'Unknown deploy error' }
    }
    return {
      status: 'pending',
      message: 'Installation is still running. Keep checking with check_status until status becomes "done".',
    }
  }

  if (name === 'check_status') {
    const session_id = String(args.session_id ?? '')
    if (!session_id) return { status: 'error', message: 'Missing session_id' }
    const progress = await getProgress(session_id)
    if (!progress) {
      return {
        status: 'unknown',
        message: 'No installation found for this session_id. It may have expired or never existed. If the user is sure they deployed, ask them to re-check the failure email for the correct session_id or server_token.',
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
            ? `Installation failed with: ${progress.error}. Ask the user if they want to retry — if yes, call retry_deploy with the server_token.`
            : 'Installation in progress. Keep polling every 20-30 seconds.',
    }
  }

  if (name === 'retry_deploy') {
    const server_token = String(args.server_token ?? '').trim()
    if (!server_token) {
      return { status: 'error', message: 'Missing server_token. Ask the user to paste the token from the failure email or their dashboard.' }
    }

    const record = await db.serverToken.findUnique({
      where: { token: server_token },
      select: {
        id: true,
        status: true,
        serverIp: true,
        serverPassword: true,
        subscriptionId: true,
      },
    })
    if (!record) {
      return { status: 'error', message: 'No server found for this token. Double-check the token from the failure email.' }
    }
    if (record.status === 'active') {
      return { status: 'already_active', message: 'This server is already active and running. No retry needed.' }
    }
    if (!record.serverIp) {
      return { status: 'error', message: 'No server IP on record for this token. Ask the user to provide the IP manually via the install form.' }
    }

    const ipOverride = typeof args.ip === 'string' && args.ip.trim() ? args.ip.trim() : null
    const passwordOverride = typeof args.password === 'string' && args.password.trim() ? args.password.trim() : null
    const loginOverride = typeof args.login === 'string' && args.login.trim() ? args.login.trim() : 'root'

    const ip = ipOverride ?? record.serverIp
    const password = passwordOverride ?? record.serverPassword
    if (!password) {
      return { status: 'error', message: 'No server password on record. Ask the user to provide the root password as the "password" argument.' }
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
      return {
        status: 'error',
        message: `Wipe failed: ${errMsg}. The most common cause is wrong credentials. Ask the user to provide fresh ip/login/password and call retry_deploy again with those values.`,
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
      return {
        status: 'error',
        message: `Deploy launch failed: ${errMsg}.`,
        session_id: newSessionId,
      }
    }

    return {
      status: 'retry_started',
      session_id: newSessionId,
      message: 'Retry deploy started. Poll check_status with this session_id every 20-30 seconds until status becomes "done" or "error".',
    }
  }

  return { error: `Unknown tool: ${name}` }
}
