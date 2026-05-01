import { NextRequest } from 'next/server'
import { Client } from 'ssh2'
import { generateSubdomain } from '@/lib/subdomain'
import { createDnsRecord } from '@/lib/cloudflare'

export const maxDuration = 300

const STEPS = [
  { id: 'connect',      label: 'Connecting to server...' },
  { id: 'apt_update',   label: 'Updating system...' },
  { id: 'apt_install',  label: 'Installing base tools...' },
  { id: 'node_setup',   label: 'Preparing Node.js installer...' },
  { id: 'node_install', label: 'Installing Node.js 20...' },
  { id: 'pm2',          label: 'Installing PM2 process manager...' },
  { id: 'clone',        label: 'Downloading Fractera from GitHub...' },
  { id: 'deps_root',    label: 'Installing dependencies (1/4)...' },
  { id: 'deps_app',     label: 'Installing dependencies (2/4)...' },
  { id: 'deps_bridge',  label: 'Installing dependencies (3/4)...' },
  { id: 'deps_media',   label: 'Installing dependencies (4/4)...' },
  { id: 'start_app',    label: 'Starting application...' },
  { id: 'start_bridge', label: 'Starting Bridge...' },
  { id: 'start_media',  label: 'Starting media service...' },
  { id: 'pm2_save',     label: 'Saving configuration...' },
  { id: 'get_ip',       label: 'Detecting server IP...' },
  { id: 'register',     label: 'Registering your domain...' },
  { id: 'done',         label: 'Installation complete!' },
]

function send(controller: ReadableStreamDefaultController, event: string, data: object) {
  const encoded = new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  controller.enqueue(encoded)
}

function matchStep(line: string): string | null {
  if (line.includes('apt-get update') || line.includes('Get:') || line.includes('Fetched'))
    return 'apt_update'
  if (line.includes('apt-get install') || line.includes('Setting up'))
    return 'apt_install'
  if (line.includes('setup_20.x') || line.includes('nodesource'))
    return 'node_setup'
  if (line.includes('nodejs') && line.includes('install'))
    return 'node_install'
  if (line.includes('pm2') && line.includes('install'))
    return 'pm2'
  if (line.includes('git clone'))
    return 'clone'
  if (line.includes('npm install') && !line.includes('prefix'))
    return 'deps_root'
  if (line.includes('--prefix app'))
    return 'deps_app'
  if (line.includes('--prefix bridges'))
    return 'deps_bridge'
  if (line.includes('--prefix services'))
    return 'deps_media'
  if (line.includes('fractera-app'))
    return 'start_app'
  if (line.includes('fractera-bridge'))
    return 'start_bridge'
  if (line.includes('fractera-media'))
    return 'start_media'
  if (line.includes('pm2 save') || line.includes('pm2 startup'))
    return 'pm2_save'
  if (line.includes('ifconfig.me') || line.includes('SERVER_IP'))
    return 'get_ip'
  if (line.includes('fractera.ai/api/register') || line.includes('FRACTERA_READY'))
    return 'register'
  return null
}

export async function POST(req: NextRequest) {
  const { ip, login, password, session_id } = await req.json()

  if (!ip || !login || !password) {
    return new Response(JSON.stringify({ error: 'Missing ip, login or password' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const secret = process.env.INSTALL_SCRIPT_SECRET!
  const scriptUrl = `https://fractera.ai/api/script?provider=existing&session_id=${session_id}`
  const installCmd = `curl -fsSL "${scriptUrl}" | bash`

  const stream = new ReadableStream({
    start(controller) {
      const ssh = new Client()
      const completedSteps = new Set<string>()

      function markStep(id: string) {
        if (completedSteps.has(id)) return
        completedSteps.add(id)
        const step = STEPS.find(s => s.id === id)
        if (step) {
          send(controller, 'step', { id, label: step.label, done: true })
        }
      }

      send(controller, 'step', { id: 'connect', label: 'Connecting to server...', done: false })

      ssh.on('ready', () => {
        markStep('connect')

        ssh.exec(installCmd, (err, stream) => {
          if (err) {
            send(controller, 'error', { message: 'Failed to start installation: ' + err.message })
            controller.close()
            ssh.end()
            return
          }

          stream.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n')
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue
              const stepId = matchStep(trimmed)
              if (stepId) markStep(stepId)
              send(controller, 'log', { text: trimmed })
            }
          })

          stream.stderr.on('data', (data: Buffer) => {
            const lines = data.toString().split('\n')
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue
              const stepId = matchStep(trimmed)
              if (stepId) markStep(stepId)
            }
          })

          stream.on('close', async () => {
            markStep('done')
            const subdomain = generateSubdomain()
            try {
              await createDnsRecord(ip, subdomain)
              send(controller, 'done', { subdomain: `${subdomain}.fractera.ai` })
            } catch (e: unknown) {
              send(controller, 'error', { message: 'Failed to register domain: ' + String(e) })
            }
            controller.close()
            ssh.end()
          })
        })
      })

      ssh.on('error', (err) => {
        send(controller, 'error', { message: 'Connection error: ' + err.message })
        controller.close()
      })

      ssh.connect({
        host: ip,
        port: 22,
        username: login,
        password,
        readyTimeout: 30000,
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
