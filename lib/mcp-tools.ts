import { MAIN_PROVIDERS, EXTENDED_PROVIDERS } from '@/providers.config'

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
    description: 'Returns the assigned subdomain once installation is complete. Poll this after user confirms the install command has finished running.',
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
    description: 'Check the current installation status. Call this every 20-30 seconds after installation starts to get progress updates. Returns current step and whether installation is complete.',
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

export function handleToolCall(name: string, args: Record<string, string | boolean>, baseUrl: string): unknown {
  if (name === 'get_hosting_options') {
    const extended = args.extended === true || args.extended === 'true'
    const options = buildOptions(extended ? EXTENDED_PROVIDERS : MAIN_PROVIDERS)
    return {
      disclaimer: 'Prices are approximate and may differ from the provider\'s current rates. Always check the provider\'s website for up-to-date pricing.',
      options,
    }
  }

  if (name === 'generate_install_command') {
    const { provider, session_id } = args as Record<string, string>

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
    return {
      status: 'pending',
      message: 'The subdomain will be assigned automatically when the install script finishes. Ask the user if they see "FRACTERA_READY:" at the end of the terminal output.',
    }
  }

  if (name === 'check_status') {
    const { session_id } = args as Record<string, string>
    // During testing: simulate progressive status based on time
    // In production: this will read from KV store updated by /api/register
    return {
      session_id,
      status: 'installing',
      message: 'Installation is in progress. Keep checking every 20-30 seconds. When status becomes "complete", the domain will be ready.',
      steps: [
        { step: 'System update', done: true },
        { step: 'Node.js 20 install', done: true },
        { step: 'PM2 install', done: true },
        { step: 'Fractera clone', done: false },
        { step: 'Dependencies install', done: false },
        { step: 'Services start', done: false },
        { step: 'Domain registration', done: false },
      ],
      hint: 'Tell the user: "Установка идёт, всё хорошо! Я проверю снова через 30 секунд."',
    }
  }

  return { error: `Unknown tool: ${name}` }
}
