'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

type Step = { id: string; label: string; done: boolean }

const ALL_STEPS: Step[] = [
  { id: 'connect',      label: 'Connecting to server',              done: false },
  { id: 'apt_update',   label: 'Updating system',                   done: false },
  { id: 'apt_install',  label: 'Installing base tools',             done: false },
  { id: 'node_setup',   label: 'Preparing Node.js installer',       done: false },
  { id: 'node_install', label: 'Installing Node.js 20',             done: false },
  { id: 'pm2',          label: 'Installing PM2 process manager',    done: false },
  { id: 'clone',        label: 'Downloading Fractera',              done: false },
  { id: 'deps_root',    label: 'Installing dependencies (1/4)',     done: false },
  { id: 'deps_app',     label: 'Installing dependencies (2/4)',     done: false },
  { id: 'deps_bridge',  label: 'Installing dependencies (3/4)',     done: false },
  { id: 'deps_media',   label: 'Installing dependencies (4/4)',     done: false },
  { id: 'start_app',    label: 'Starting application',              done: false },
  { id: 'start_bridge', label: 'Starting Bridge',                   done: false },
  { id: 'start_media',  label: 'Starting media service',            done: false },
  { id: 'pm2_save',     label: 'Saving configuration',              done: false },
  { id: 'get_ip',       label: 'Detecting server IP',               done: false },
  { id: 'register',     label: 'Registering your domain',           done: false },
  { id: 'done',         label: 'Installation complete!',            done: false },
]

function generateSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function Tooltip({ text, children }: { text: React.ReactNode; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!visible) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [visible])

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <span onClick={() => setVisible(v => !v)} className="cursor-pointer inline-flex items-center">
        {children}
      </span>
      {visible && (
        <span className="absolute left-7 top-0 z-20 w-72 bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs text-gray-400 leading-relaxed shadow-xl">
          {text}
        </span>
      )}
    </span>
  )
}

function OrangeQ({ tooltip }: { tooltip: React.ReactNode }) {
  return (
    <Tooltip text={tooltip}>
      <span className="w-5 h-5 rounded-full border border-orange-500/60 text-orange-400 hover:text-orange-300 hover:border-orange-400 transition-colors text-xs font-bold inline-flex items-center justify-center shrink-0 ml-2">
        ?
      </span>
    </Tooltip>
  )
}

export function InstallForm() {
  const [ip, setIp] = useState('')
  const [login, setLogin] = useState('root')
  const [password, setPassword] = useState('')
  const [installing, setInstalling] = useState(false)
  const [steps, setSteps] = useState<Step[]>(ALL_STEPS)
  const [subdomain, setSubdomain] = useState('')
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const eventSourceRef = useRef<(() => void) | null>(null)

  function updateStep(id: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: true } : s))
    setActiveStep(id)
  }

  async function handleInstall() {
    if (!ip || !password) return
    setInstalling(true)
    setSteps(ALL_STEPS.map(s => ({ ...s, done: false })))
    setSubdomain('')
    setActiveStep(null)

    const session_id = generateSessionId()

    const res = await fetch('/api/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, login, password, session_id }),
    })

    if (!res.ok || !res.body) {
      toast.error('Could not connect to install server')
      setInstalling(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    eventSourceRef.current = () => reader.cancel()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        const eventLine = part.match(/^event: (\w+)$/m)
        const dataLine = part.match(/^data: (.+)$/m)
        if (!eventLine || !dataLine) continue

        const event = eventLine[1]
        const data = JSON.parse(dataLine[1])

        if (event === 'step') updateStep(data.id)
        if (event === 'done') {
          setSubdomain(data.subdomain)
          localStorage.setItem('fractera_domain', JSON.stringify({
            domain: data.subdomain,
            status: 'ready',
          }))
        }
        if (event === 'error') {
          toast.error(data.message)
          setInstalling(false)
          return
        }
      }
    }

    setInstalling(false)
  }

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const currentStep = steps.find(s => s.id === activeStep)

  const hostingTooltip = (
    <>
      Recommended hosting:{' '}
      <a
        href="https://contabo.com/en/vps/cloud-vps-10/?image=ubuntu.332&qty=1&contract=12&storage-type=cloud-vps-10-150-gb-ssd"
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-400 underline underline-offset-2"
      >
        Contabo Cloud VPS
      </a>
      {' '}— 4 vCPU, 8GB RAM, 150GB SSD, ~€3.60/month.
      <br /><br />
      Note: you must set your password during checkout. Copy it and paste it into the Password field below. If you forget it, follow the recovery instructions.
    </>
  )

  const passwordTooltip = (
    <>
      To recover your password on Contabo:
      <br /><br />
      Log in at{' '}
      <a href="https://my.contabo.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline underline-offset-2">
        my.contabo.com
      </a>
      {' '}(login and password were sent to your email at registration).
      <br /><br />
      Then follow: Control Panel → Your Services → Manage → Control → Manage → Reset Password → Password → Name (any) → Add new password → Create
    </>
  )

  return (
    <div className="w-full max-w-xl flex flex-col gap-6">

      {/* Form */}
      {!installing && !subdomain && (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500 uppercase tracking-widest flex items-center gap-0">
            Install Fractera on your server
            <OrangeQ tooltip={hostingTooltip} />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Server IP address (e.g. 109.199.105.213)"
              value={ip}
              onChange={e => setIp(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="text"
              placeholder="Login (usually: root)"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
            />
            <div className="flex flex-col gap-1.5">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
              />
              <div className="text-xs text-gray-600 flex items-center gap-1 px-1">
                Forgot your password?
                <OrangeQ tooltip={passwordTooltip} />
              </div>
            </div>
          </div>

          <button
            onClick={handleInstall}
            disabled={!ip || !password}
            className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Install Fractera
          </button>

          <p className="text-xs text-gray-600">
            Your credentials are used only for installation and are never stored on our servers.
          </p>
        </div>
      )}

      {/* Progress */}
      {installing && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{currentStep?.label ?? 'Preparing...'}</p>
            <p className="text-sm text-gray-600">{progress}%</p>
          </div>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                <span className={`text-sm transition-colors duration-500 ${
                  step.done ? 'text-green-400' : step.id === activeStep ? 'text-yellow-400' : 'text-gray-700'
                }`}>
                  {step.done ? '✓' : step.id === activeStep ? '…' : '○'}
                </span>
                <span className={`text-sm transition-colors duration-500 ${
                  step.done ? 'text-gray-300' : step.id === activeStep ? 'text-white' : 'text-gray-700'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {subdomain && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold text-green-400">Fractera installed!</p>
          <p className="text-sm text-gray-400">Your address is ready:</p>
          <a
            href={`https://${subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 underline underline-offset-2 text-base font-mono"
          >
            https://{subdomain}
          </a>
          <p className="text-xs text-gray-600">
            The first account you create will be the Administrator.
          </p>
        </div>
      )}
    </div>
  )
}
