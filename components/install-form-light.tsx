'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

type Step = { id: string; label: string; done: boolean; skipped?: boolean }

const LIGHT_STEPS: Step[] = [
  { id: 'connect',             label: 'Connecting to server',              done: false },
  { id: 'wipe_start',         label: 'Cleaning previous installation',     done: false },
  { id: 'apt_update',         label: 'Updating system',                    done: false },
  { id: 'apt_install',        label: 'Installing base tools',              done: false },
  { id: 'node_install',       label: 'Installing Node.js 20',              done: false },
  { id: 'pm2',                label: 'Installing PM2',                     done: false },
  { id: 'register',           label: 'Registering your domain',            done: false },
  { id: 'register_subdomains',label: 'Registering service subdomains',     done: false },
  { id: 'clone',              label: 'Downloading Fractera Light',         done: false },
  { id: 'deps_root',          label: 'Installing dependencies (1/4)',      done: false },
  { id: 'deps_app',           label: 'Installing dependencies (2/4)',      done: false },
  { id: 'deps_app_native',    label: 'Installing native modules',          done: false },
  { id: 'deps_auth',          label: 'Installing dependencies (3/5)',      done: false },
  { id: 'deps_data',          label: 'Installing dependencies (4/5)',      done: false },
  { id: 'deps_bridges_app',   label: 'Installing dependencies (5/5)',      done: false },
  { id: 'prepare_secrets',    label: 'Generating security keys',           done: false },
  { id: 'prepare_env',        label: 'Writing environment configuration',  done: false },
  { id: 'build_app',          label: 'Building app',                       done: false },
  { id: 'build_auth',         label: 'Building auth',                      done: false },
  { id: 'build_bridges_app',  label: 'Building admin',                     done: false },
  { id: 'start_app',          label: 'Starting app service',               done: false },
  { id: 'start_auth',         label: 'Starting auth service',              done: false },
  { id: 'start_data',         label: 'Starting data service',              done: false },
  { id: 'start_admin',        label: 'Starting admin service',             done: false },
  { id: 'configure_nginx_http',label: 'Configuring web server',            done: false },
  { id: 'health_check',       label: 'Verifying server is responding',     done: false },
  { id: 'nginx_domains',      label: 'Updating web server with real domains', done: false },
  { id: 'update_env',         label: 'Updating environment with real domains', done: false },
  { id: 'rebuild_app',        label: 'Rebuilding app with domain',         done: false },
  { id: 'rebuild_auth',       label: 'Rebuilding auth with domain',        done: false },
  { id: 'rebuild_bridges_app',label: 'Rebuilding admin with domain',       done: false },
  { id: 'pm2_restart',        label: 'Restarting services',                done: false },
  { id: 'wait_dns',           label: 'Waiting for DNS to propagate',       done: false },
  { id: 'get_cf_cert',        label: 'Downloading Cloudflare SSL certificate', done: false },
  { id: 'ssl_cert',           label: 'Configuring HTTPS',                  done: false },
  { id: 'https_check',        label: 'Verifying HTTPS is working',         done: false },
]

export function InstallFormLight({ onSubdomainReady }: {
  onSubdomainReady?: (subdomain: string) => void
} = {}) {
  const [ip, setIp] = useState('')
  const [login, setLogin] = useState('root')
  const [password, setPassword] = useState('')
  const [installing, setInstalling] = useState(false)
  const [steps, setSteps] = useState<Step[]>(LIGHT_STEPS)
  const [subdomain, setSubdomain] = useState('')
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [installError, setInstallError] = useState<string | null>(null)
  const [stepStartedAt, setStepStartedAt] = useState<number>(Date.now())
  const [now, setNow] = useState<number>(Date.now())
  const [lastUpdateAt, setLastUpdateAt] = useState<number>(Date.now())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!installing) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [installing])

  async function handleInstall() {
    if (!ip || !password) return
    setInstalling(true)
    setSteps(LIGHT_STEPS.map(s => ({ ...s, done: false })))
    setSubdomain('')
    setActiveStep('connect')
    setInstallError(null)
    const startTime = Date.now()
    setStepStartedAt(startTime)
    setLastUpdateAt(startTime)
    setNow(startTime)

    const session_id = `light-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    fetch('/api/install/light', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, login, password, session_id }),
    }).catch(() => {})

    let prevDoneCount = 0
    let prevActive: string | null = null

    pollRef.current = setInterval(async () => {
      try {
        const pollRes = await fetch(`/api/progress?session_id=${session_id}`)
        if (!pollRes.ok) return
        const progress = await pollRes.json()

        const newSteps = LIGHT_STEPS.map(s => {
          const reported = progress.steps.find((p: Step) => p.id === s.id)
          if (!reported) return s
          const skipped = typeof reported.label === 'string' && reported.label.includes('(skipped)')
          return { ...s, done: reported.done, skipped }
        })
        setSteps(newSteps)

        const doneCount = newSteps.filter(s => s.done).length
        const lastStep = progress.steps[progress.steps.length - 1]
        const newActive = lastStep && !lastStep.done ? lastStep.id : null

        if (doneCount !== prevDoneCount || newActive !== prevActive) {
          setLastUpdateAt(Date.now())
          if (newActive !== prevActive) setStepStartedAt(Date.now())
          prevDoneCount = doneCount
          prevActive = newActive
        }
        setActiveStep(newActive)

        if (progress.status === 'done' && progress.subdomain) {
          clearInterval(pollRef.current!)
          setSubdomain(progress.subdomain)
          setInstalling(false)
          onSubdomainReady?.(progress.subdomain)
        }

        if (progress.status === 'error') {
          clearInterval(pollRef.current!)
          setInstallError(progress.error ?? 'Installation failed')
          toast.error(progress.error ?? 'Installation failed', { duration: 10000 })
        }
      } catch {
        // retry next cycle
      }
    }, 3000)
  }

  function reset() {
    setInstalling(false)
    setInstallError(null)
    setSteps(LIGHT_STEPS.map(s => ({ ...s, done: false })))
    setActiveStep(null)
  }

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.min(99, Math.round((doneCount / steps.length) * 100))
  const currentStep = steps.find(s => s.id === activeStep)

  if (subdomain) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-xl">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <p className="text-base font-semibold text-gray-900">Your backend is live</p>
        </div>
        <div className="flex flex-col gap-3 bg-green-50 border border-green-200 rounded-xl p-5">
          <a href={`https://${subdomain}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col gap-0.5 group">
            <span className="text-sm font-semibold text-green-700 group-hover:text-green-600 transition-colors">
              ↗ {subdomain}
            </span>
            <span className="text-xs text-gray-500">Your public site</span>
          </a>
          <a href={`https://admin.${subdomain}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col gap-0.5 group">
            <span className="text-sm font-semibold text-green-700 group-hover:text-green-600 transition-colors">
              ↗ admin.{subdomain}
            </span>
            <span className="text-xs text-gray-500">Admin panel — sign in to manage your site</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-6">

      {!installing && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-700">
            Deploy your backend
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Server IP address"
              value={ip}
              onChange={e => setIp(e.target.value)}
              className="border border-gray-300 rounded-xl px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-600 transition-colors bg-white"
            />
            <input
              type="text"
              placeholder="Login (default: root)"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="border border-gray-300 rounded-xl px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-600 transition-colors bg-white"
            />
            <input
              type="password"
              placeholder="SSH password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-gray-300 rounded-xl px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-600 transition-colors bg-white"
            />
          </div>

          <button
            onClick={handleInstall}
            disabled={!ip || !password}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Deploy Fractera Light
          </button>

          <p className="text-xs text-gray-400">
            Ubuntu 22.04 / 24.04 · root access required · ~10 min install
          </p>
        </div>
      )}

      {installing && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-gray-900">
              {installError ? 'Installation failed' : (currentStep?.label ?? 'Preparing…')}
              {!installError && activeStep && (
                <span className="text-gray-400 ml-2 font-normal text-sm">
                  — {Math.floor((now - stepStartedAt) / 1000)}s
                </span>
              )}
            </p>
            <p className="text-base font-bold text-gray-900">{progress}%</p>
          </div>

          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${installError ? 'bg-red-500' : 'bg-gray-900'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {!installError && now - lastUpdateAt > 60000 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No updates for {Math.floor((now - lastUpdateAt) / 1000)}s — the step may be running a long operation.
            </p>
          )}

          {installError && (
            <div className="flex flex-col gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700">Error details</p>
              <p className="text-xs text-red-600 break-all whitespace-pre-wrap font-mono">{installError}</p>
              <button
                onClick={reset}
                className="self-start text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-lg"
              >
                Try again
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5 mt-2 pr-1 overflow-y-auto" style={{ maxHeight: 250 }}>
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                <span className={`text-sm transition-colors duration-500 ${
                  step.done && step.skipped ? 'text-gray-300'
                  : step.done ? 'text-green-500'
                  : step.id === activeStep && installError ? 'text-red-500'
                  : step.id === activeStep ? 'text-amber-500'
                  : 'text-gray-300'
                }`}>
                  {step.done && step.skipped ? '—' : step.done ? '✓' : step.id === activeStep && installError ? '✗' : step.id === activeStep ? '…' : '○'}
                </span>
                <span className={`text-sm transition-colors duration-500 ${
                  step.done && step.skipped ? 'text-gray-300'
                  : step.done ? 'text-gray-700'
                  : step.id === activeStep ? 'text-gray-900 font-semibold'
                  : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
