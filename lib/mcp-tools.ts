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
]

const MAIN_OPTIONS = [
  {
    number: 1,
    provider: 'hetzner',
    name: 'Hetzner CX11',
    price: '~€3.29/month*',
    recommended: true,
    specs: '2 vCPU, 2GB RAM, 20GB SSD',
    note: 'Best price/performance. Reliable Linux VPS, EU/US locations. Takes ~5 minutes to create.',
  },
  {
    number: 2,
    provider: 'oracle',
    name: 'Oracle Cloud Always Free ARM',
    price: 'Free forever*',
    recommended: false,
    specs: '4 ARM vCPUs, 24GB RAM',
    note: 'Most powerful free option. Requires credit card for verification (no charge). Setup is more involved.',
  },
  {
    number: 3,
    provider: 'digitalocean',
    name: 'DigitalOcean Droplet',
    price: '~$6/month*',
    recommended: false,
    specs: '1 vCPU, 1GB RAM, 25GB SSD',
    note: 'Simple and reliable. Good if you already have a DigitalOcean account.',
  },
  {
    number: 4,
    provider: null,
    name: 'Show more options',
    price: null,
    note: 'See all supported providers',
  },
  {
    number: 5,
    provider: 'existing',
    name: 'I already have a server',
    price: null,
    note: 'Connect your existing Linux VPS (Ubuntu 22.04+)',
  },
]

const EXTENDED_OPTIONS = [
  ...MAIN_OPTIONS.filter(o => o.provider && o.provider !== 'existing'),
  {
    number: 4,
    provider: 'hostinger',
    name: 'Hostinger VPS',
    price: '~€4-5/month*',
    specs: '1-2 vCPU, 2-4GB RAM',
    note: 'Good price, user-friendly hPanel management.',
  },
  {
    number: 5,
    provider: 'fly',
    name: 'Fly.io',
    price: '~$5-8/month*',
    specs: 'Shared CPU, 256MB-1GB RAM',
    note: 'Automatic HTTPS, easy scaling, no SSH needed for basic ops.',
  },
  {
    number: 6,
    provider: 'gcp',
    name: 'Google Cloud (e2-micro)',
    price: '~$5-12/month*',
    specs: '2 vCPU shared, 1GB RAM',
    note: 'Free tier available. Suitable if you already use Google services.',
  },
  {
    number: 7,
    provider: 'existing',
    name: 'I already have a server',
    price: null,
    note: 'Connect your existing Linux VPS (Ubuntu 22.04+)',
  },
]

export function handleToolCall(name: string, args: Record<string, string | boolean>, baseUrl: string): unknown {
  if (name === 'get_hosting_options') {
    const extended = args.extended === true || args.extended === 'true'
    const options = extended ? EXTENDED_OPTIONS : MAIN_OPTIONS
    return {
      disclaimer: '* Prices are approximate and may differ from the provider\'s current rates. Always check the provider\'s website for up-to-date pricing.',
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

  return { error: `Unknown tool: ${name}` }
}
