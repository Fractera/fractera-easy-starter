'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { InfoTooltip } from '@/components/info-tooltip'

type Step = { id: string; label: string; done: boolean; skipped?: boolean }

const ALL_STEPS: Step[] = [
  { id: 'connect',              label: 'Connecting to server',                    done: false },
  { id: 'apt_update',           label: 'Updating system',                         done: false },
  { id: 'apt_install',          label: 'Installing base tools',                   done: false },
  { id: 'node_repo',            label: 'Adding Node.js repository',               done: false },
  { id: 'node_install',         label: 'Installing Node.js 20',                   done: false },
  { id: 'pm2',                  label: 'Installing PM2 process manager',          done: false },
  { id: 'clear_creds',          label: 'Clearing platform credentials',           done: false },
  { id: 'clone',                label: 'Downloading Fractera',                    done: false },
{ id: 'deps_root',            label: 'Installing dependencies (1/6)',           done: false },
  { id: 'deps_app',             label: 'Installing dependencies (2/6)',           done: false },
  { id: 'deps_app_native',      label: 'Installing native modules',               done: false },
  { id: 'deps_bridge',          label: 'Installing dependencies (3/6)',           done: false },
  { id: 'deps_auth',            label: 'Installing dependencies (4/6)',           done: false },
  { id: 'deps_bridges_app',     label: 'Installing dependencies (5/6)',           done: false },
  { id: 'deps_data',            label: 'Installing dependencies (6/6)',           done: false },
  { id: 'install_claude',       label: 'Claude Code',                             done: false },
  { id: 'install_codex',        label: 'Codex',                                   done: false },
  { id: 'install_gemini',       label: 'Gemini CLI',                              done: false },
  { id: 'install_qwen',         label: 'Qwen Code',                               done: false },
  { id: 'install_kimi',         label: 'Kimi Code',                               done: false },
  { id: 'prepare_secrets',      label: 'Generating security keys',                done: false },
  { id: 'prepare_env',          label: 'Writing environment configuration',       done: false },
  { id: 'build_app',            label: 'Building shell (production)',             done: false },
  { id: 'build_auth',           label: 'Building auth service',                   done: false },
  { id: 'build_bridges_app',    label: 'Building admin service',                  done: false },
  { id: 'start_app',            label: 'Starting shell service',                  done: false },
  { id: 'start_bridge',         label: 'Starting bridge service',                 done: false },
  { id: 'start_auth',           label: 'Starting auth service',                   done: false },
  { id: 'start_admin',          label: 'Starting admin service',                  done: false },
  { id: 'start_data',           label: 'Starting data service',                   done: false },
  { id: 'pm2_save',             label: 'Saving configuration',                    done: false },
  { id: 'configure_nginx_http', label: 'Configuring web server (HTTP)',           done: false },
  { id: 'health_check',         label: 'Verifying server is responding',          done: false },
  { id: 'register',             label: 'Registering your domain',                 done: false },
  { id: 'register_subdomains',  label: 'Registering auth / admin / data domains', done: false },
  { id: 'nginx_domains',        label: 'Updating web server with real domains',   done: false },
  { id: 'update_env',           label: 'Updating environment with real domains',  done: false },
  { id: 'rebuild_app',          label: 'Rebuilding shell with domain',            done: false },
  { id: 'rebuild_auth',         label: 'Rebuilding auth with domain',             done: false },
  { id: 'rebuild_bridges_app',  label: 'Rebuilding admin with domain',            done: false },
  { id: 'pm2_restart',          label: 'Restarting services with new config',     done: false },
  { id: 'install_certbot',      label: 'Installing SSL tools',                    done: false },
  { id: 'wait_dns',             label: 'Waiting for DNS to propagate',            done: false },
  { id: 'ssl_cert',             label: 'Getting SSL certificates (4 domains)',    done: false },
  { id: 'https_check',          label: 'Verifying HTTPS is working',              done: false },
]


export function InstallForm({ onSubdomainReady, onInstallingChange }: { onSubdomainReady?: (subdomain: string) => void; onInstallingChange?: (installing: boolean) => void } = {}) {
  const [ip, setIp] = useState('')
  const [login, setLogin] = useState('root')
  const [password, setPassword] = useState('')
  const [installing, setInstalling] = useState(false)
  const [steps, setSteps] = useState<Step[]>(ALL_STEPS)
  const [subdomain, setSubdomain] = useState('')
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [installError, setInstallError] = useState<string | null>(null)
  const [stepStartedAt, setStepStartedAt] = useState<number>(Date.now())
  const [now, setNow] = useState<number>(Date.now())
  const [lastUpdateAt, setLastUpdateAt] = useState<number>(Date.now())
  const eventSourceRef = useRef<(() => void) | null>(null)
  const [serverStatus, setServerStatus] = useState<'idle' | 'checking' | 'fresh' | 'installed'>('idle')
  const [detectedSubdomain, setDetectedSubdomain] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [destroying, setDestroying] = useState(false)
  const [renewingSsl, setRenewingSsl] = useState(false)
  const [sslRenewResult, setSslRenewResult] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tick every second while installing — for elapsed time and silence detection
  useEffect(() => {
    if (!installing) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [installing])

  // Auto-check server status when credentials are filled
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (ip.length < 4 || login.length < 2 || password.length < 4) {
      setServerStatus('idle')
      setDetectedSubdomain(null)
      setStatusError(null)
      return
    }

    setServerStatus('checking')

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip, login, password }),
        })
        if (!res.ok) { setServerStatus('fresh'); return }
        const data = await res.json()
        if (data.installed) {
          setDetectedSubdomain(data.subdomain ?? null)
          setServerStatus('installed')
          if (data.subdomain) onSubdomainReady?.(data.subdomain)
        } else {
          setStatusError(data.sshError ?? null)
          setServerStatus('fresh')
        }
      } catch {
        setServerStatus('fresh')
      }
    }, 800)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [ip, login, password])

  async function handleInstall() {
    if (!ip || !password) return
    setServerStatus('idle')
    setDetectedSubdomain(null)
    setStatusError(null)
    setInstalling(true)
    onInstallingChange?.(true)
    setSteps(ALL_STEPS.map(s => ({ ...s, done: false })))
    setSubdomain('')
    setActiveStep('connect')
    setInstallError(null)
    const startTime = Date.now()
    setStepStartedAt(startTime)
    setLastUpdateAt(startTime)
    setNow(startTime)

    const session_id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    fetch('/api/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, login, password, session_id }),
    }).catch(() => {})

    let prevDoneCount = 0
    let prevActive: string | null = null

    const pollInterval = setInterval(async () => {
      try {
        const pollRes = await fetch(`/api/progress?session_id=${session_id}`)
        if (!pollRes.ok) return

        const progress = await pollRes.json()

        const newSteps = ALL_STEPS.map(s => {
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
          clearInterval(pollInterval)
          setSubdomain(progress.subdomain)
          localStorage.setItem('fractera_domain', JSON.stringify({
            domain: progress.subdomain,
            status: 'ready',
          }))
          setInstalling(false)
          onInstallingChange?.(false)
          onSubdomainReady?.(progress.subdomain)
        }

        if (progress.status === 'error') {
          clearInterval(pollInterval)
          setInstallError(progress.error ?? 'Installation failed')
          toast.error(progress.error ?? 'Installation failed', { duration: 10000 })
        }
      } catch {
        // Network error — retry next cycle
      }
    }, 3000)

    eventSourceRef.current = () => clearInterval(pollInterval)
  }

  function reset() {
    setInstalling(false)
    setInstallError(null)
    setSteps(ALL_STEPS.map(s => ({ ...s, done: false })))
    setActiveStep(null)
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
            <InfoTooltip text={hostingTooltip} />
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
                <InfoTooltip text={passwordTooltip} />
              </div>
            </div>
          </div>

          {serverStatus === 'checking' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              Checking server...
            </div>
          )}

          {serverStatus === 'installed' && (
            <div className="flex flex-col gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                <p className="text-sm font-semibold text-green-400">Fractera is already installed on this server</p>
              </div>
              {detectedSubdomain && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Your domains</p>
                  <a href={`https://${detectedSubdomain}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-green-300 hover:text-green-200 transition-colors">
                    ↗ {detectedSubdomain} <span className="text-gray-600 text-xs">site</span>
                  </a>
                  <a href={`https://auth.${detectedSubdomain}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-green-300 hover:text-green-200 transition-colors">
                    ↗ auth.{detectedSubdomain} <span className="text-gray-600 text-xs">login / register</span>
                  </a>
                  <a href={`https://admin.${detectedSubdomain}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-green-300 hover:text-green-200 transition-colors">
                    ↗ admin.{detectedSubdomain} <span className="text-gray-600 text-xs">admin</span>
                  </a>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  onClick={async () => {
                    if (renewingSsl) return
                    setRenewingSsl(true)
                    setSslRenewResult(null)
                    try {
                      const res = await fetch('/api/renew-ssl', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ip: ip.trim(), login: login.trim(), password }),
                      })
                      const data = await res.json()
                      setSslRenewResult(data.ok ? '✓ SSL renewed' : `✗ ${data.error ?? 'failed'}`)
                    } catch {
                      setSslRenewResult('✗ Connection error')
                    } finally {
                      setRenewingSsl(false)
                    }
                  }}
                  disabled={renewingSsl}
                  className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/60 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  {renewingSsl ? 'Renewing SSL…' : 'Renew SSL certificates'}
                </button>
                <button
                  onClick={async () => {
                    if (destroying) return
                    setDestroying(true)
                    try {
                      await fetch('/api/destroy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ip: ip.trim(), login: login.trim(), password, domain: detectedSubdomain ?? undefined }),
                      })
                      localStorage.removeItem('fractera_domain')
                      setServerStatus('fresh')
                      setDetectedSubdomain(null)
                      onSubdomainReady?.('')
                    } catch {
                      setServerStatus('fresh')
                      setDetectedSubdomain(null)
                    } finally {
                      setDestroying(false)
                    }
                  }}
                  disabled={destroying}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/60 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  {destroying ? 'Removing…' : 'Delete and reinstall fresh'}
                </button>
              </div>
              {sslRenewResult && (
                <p className={`text-xs px-1 ${sslRenewResult.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {sslRenewResult}
                </p>
              )}
            </div>
          )}

          {(serverStatus === 'fresh' || serverStatus === 'idle') && (
            <button
              onClick={handleInstall}
              disabled={!ip || !password}
              className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Install Fractera
            </button>
          )}

{serverStatus === 'fresh' && statusError && (
            <p className="text-xs text-yellow-600 px-1">
              Could not reach server. You can still try installing.
            </p>
          )}

          <p className="text-xs text-gray-600">
            Your credentials are used only for installation and are never stored on our servers.
          </p>
        </div>
      )}

      {/* Progress */}
      {installing && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {installError ? 'Installation failed' : (currentStep?.label ?? 'Preparing...')}
              {!installError && activeStep && (
                <span className="text-gray-600 ml-2">— {Math.floor((now - stepStartedAt) / 1000)}s</span>
              )}
            </p>
            <p className="text-sm text-gray-600">{progress}%</p>
          </div>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${installError ? 'bg-red-500' : 'bg-green-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Silence warning */}
          {!installError && installing && now - lastUpdateAt > 60000 && (
            <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
              Server has been silent for {Math.floor((now - lastUpdateAt) / 1000)}s. The installation may still be running, or the server may be unreachable.
            </p>
          )}

          {/* Error message */}
          {installError && (
            <div className="flex flex-col gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 font-medium">Error details:</p>
              <p className="text-xs text-red-300 break-all whitespace-pre-wrap font-mono">{installError}</p>
              <button
                onClick={reset}
                className="self-start text-xs text-white bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg"
              >
                Try again
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5 mt-2">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                <span className={`text-sm transition-colors duration-500 ${
                  step.done && step.skipped
                    ? 'text-gray-600'
                    : step.done
                    ? 'text-green-400'
                    : step.id === activeStep && installError
                    ? 'text-red-400'
                    : step.id === activeStep
                    ? 'text-yellow-400'
                    : 'text-gray-700'
                }`}>
                  {step.done && step.skipped ? '—' : step.done ? '✓' : step.id === activeStep && installError ? '✗' : step.id === activeStep ? '…' : '○'}
                </span>
                <span className={`text-sm transition-colors duration-500 ${
                  step.done && step.skipped ? 'text-gray-600' : step.done ? 'text-gray-300' : step.id === activeStep ? 'text-white' : 'text-gray-700'
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
