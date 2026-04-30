export const MCP_TOOLS = [
  {
    name: 'get_hosting_options',
    description: 'Returns list of VPS hosting providers with prices and recommendations',
    inputSchema: {
      type: 'object',
      properties: {},
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
          enum: ['hetzner', 'digitalocean', 'oracle'],
          description: 'The VPS provider the user chose',
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

export function handleToolCall(name: string, args: Record<string, string>, baseUrl: string): unknown {
  if (name === 'get_hosting_options') {
    return {
      options: [
        {
          provider: 'hetzner',
          name: 'Hetzner CX11',
          price: '€3.29/month',
          recommended: true,
          specs: '2 vCPU, 2GB RAM, 20GB SSD',
          note: 'Best price/performance. Reliable Linux VPS, EU/US locations. Takes ~5 minutes to create.',
        },
        {
          provider: 'oracle',
          name: 'Oracle Cloud Always Free ARM',
          price: 'Free forever',
          recommended: false,
          specs: '4 ARM vCPUs, 24GB RAM',
          note: 'Best free option — powerful enough for Fractera + future AI features. Requires credit card for verification (no charge). Setup is more involved.',
        },
        {
          provider: 'digitalocean',
          name: 'DigitalOcean Droplet',
          price: '$6/month',
          recommended: false,
          specs: '1 vCPU, 1GB RAM, 25GB SSD',
          note: 'Simple and reliable. Good if you already have a DigitalOcean account.',
        },
      ],
    }
  }

  if (name === 'generate_install_command') {
    const { provider, session_id } = args
    const scriptUrl = `${baseUrl}/api/script?provider=${provider}&session_id=${session_id}`
    return {
      command: `curl -fsSL "${scriptUrl}" | sudo bash`,
      session_id,
      note: 'Tell the user to copy this command, paste it into their server terminal, and press Enter. The installation takes about 5 minutes.',
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
