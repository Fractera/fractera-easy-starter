'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { DeploySuccessToast } from './deploy-success-toast'
import { DeployProgressToast } from './deploy-progress-toast'

type Step = { id: string; label: string; done: boolean; skipped?: boolean }

const MAIN_STEPS: Step[] = [
  { id: 'connect',                 label: 'Connecting to server',               done: false },
  { id: 'wipe_start',             label: 'Cleaning previous installation',     done: false },
  { id: 'quota_check',            label: 'Checking DNS quota',                 done: false },
  { id: 'apt_update',             label: 'Updating system',                    done: false },
  { id: 'apt_install',            label: 'Installing base tools',              done: false },
  { id: 'node_install',           label: 'Installing Node.js 20',              done: false },
  { id: 'pm2',                    label: 'Installing PM2',                     done: false },
  { id: 'install_claude',         label: 'Installing Claude Code CLI',         done: false },
  { id: 'install_codex',          label: 'Installing Codex CLI',               done: false },
  { id: 'install_gemini',         label: 'Installing Gemini CLI',              done: false },
  { id: 'install_qwen',           label: 'Installing Qwen Code',               done: false },
  { id: 'install_kimi',           label: 'Installing Kimi Code',               done: false },
  { id: 'install_lightrag',       label: 'Installing LightRAG',                done: false },
  { id: 'build_lightrag_webui',   label: 'Building Company Brain UI',          done: false },
  { id: 'install_hermes',         label: 'Installing Hermes Agent',            done: false },
  { id: 'register',               label: 'Registering your domain',            done: false },
  { id: 'clone',                  label: 'Downloading Fractera',               done: false },
  { id: 'install_hermes_plugins', label: 'Installing Hermes memory plugins',   done: false },
  { id: 'install_hermes_skills',  label: 'Installing Hermes delegation skills', done: false },
  { id: 'install_hermes_theme',   label: 'Installing Hermes dashboard theme',  done: false },
  { id: 'hermes_docs_dir',        label: 'Preparing Hermes protected docs dir', done: false },
  { id: 'deps_root',              label: 'Installing dependencies (1/6)',      done: false },
  { id: 'deps_app',               label: 'Installing dependencies (2/6)',      done: false },
  { id: 'deps_app_native',        label: 'Installing native modules',          done: false },
  { id: 'deps_auth',              label: 'Installing dependencies (3/6)',      done: false },
  { id: 'deps_data',              label: 'Installing dependencies (4/6)',      done: false },
  { id: 'deps_bridges_app',       label: 'Installing dependencies (5/6)',      done: false },
  { id: 'deps_bridges_platforms', label: 'Installing dependencies (6/6)',      done: false },
  { id: 'prepare_secrets',        label: 'Generating security keys',           done: false },
  { id: 'prepare_env',            label: 'Writing environment configuration',  done: false },
  { id: 'build_app',              label: 'Building app',                       done: false },
  { id: 'build_auth',             label: 'Building auth',                      done: false },
  { id: 'build_bridges_app',      label: 'Building admin',                     done: false },
  { id: 'start_app',              label: 'Starting app service',               done: false },
  { id: 'start_auth',             label: 'Starting auth service',              done: false },
  { id: 'start_data',             label: 'Starting data service',              done: false },
  { id: 'start_admin',            label: 'Starting admin service',             done: false },
  { id: 'start_bridge',           label: 'Starting AI bridge service',         done: false },
  { id: 'start_rag',              label: 'Starting Company Brain (LightRAG)',  done: false },
  { id: 'start_hermes',           label: 'Starting Hermes Agent',              done: false },
  { id: 'install_hermes_webui',   label: 'Installing Hermes Chat UI',          done: false },
  { id: 'configure_nginx_http',   label: 'Configuring web server',             done: false },
  { id: 'health_check',           label: 'Verifying server is responding',     done: false },
  { id: 'nginx_domains',          label: 'Updating web server with real domains', done: false },
  { id: 'update_env',             label: 'Updating environment with real domains', done: false },
  { id: 'rebuild_app',            label: 'Rebuilding app with domain',         done: false },
  { id: 'rebuild_auth',           label: 'Rebuilding auth with domain',        done: false },
  { id: 'rebuild_bridges_app',    label: 'Rebuilding admin with domain',       done: false },
  { id: 'pm2_restart',            label: 'Restarting services',                done: false },
  { id: 'wait_dns',               label: 'Waiting for DNS to propagate',       done: false },
  { id: 'get_cf_cert',            label: 'Downloading Cloudflare SSL certificate', done: false },
  { id: 'ssl_cert',               label: 'Configuring HTTPS',                  done: false },
  { id: 'https_check',            label: 'Verifying HTTPS is working',         done: false },
]

export function InstallFormMain({ onSubdomainReady, onInstallingChange }: {
  onSubdomainReady?: (subdomain: string) => void
  onInstallingChange?: (installing: boolean) => void
}) {
  const [ip, setIp] = useState('')
  const [login, setLogin] = useState('root')
  const [password, setPassword] = useState('')
  const [installing, setInstalling] = useState(false)
  const [steps, setSteps] = useState<Step[]>(MAIN_STEPS)
  const [subdomain, setSubdomain] = useState('')
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [installError, setInstallError] = useState<string | null>(null)
  const [stepStartedAt, setStepStartedAt] = useState<number>(Date.now())
  const [now, setNow] = useState<number>(Date.now())
  const [lastUpdateAt, setLastUpdateAt] = useState<number>(Date.now())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [successSubdomain, setSuccessSubdomain] = useState<string | null>(null)
  const [showProgressToast, setShowProgressToast] = useState(false)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const { data: session, status: sessionStatus } = useSession()

  useEffect(() => {
    if (!installing) return
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [installing])

  async function handleInstall() {
    if (!ip || !password) return
    setInstalling(true)
    setShowProgressToast(true)
    onInstallingChange?.(true)
    setSteps(MAIN_STEPS.map(s => ({ ...s, done: false })))
    setSubdomain('')
    setActiveStep('connect')
    setInstallError(null)
    const startTime = Date.now()
    setStepStartedAt(startTime)
    setLastUpdateAt(startTime)
    setNow(startTime)

    const session_id = `main-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    fetch('/api/install/main', {
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

        const newSteps = MAIN_STEPS.map(s => {
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
          setShowProgressToast(false)
          onInstallingChange?.(false)
          onSubdomainReady?.(progress.subdomain)
          setSuccessSubdomain(progress.subdomain)
        }

        if (progress.status === 'error') {
          clearInterval(pollRef.current!)
          setInstallError(progress.error ?? 'Installation failed')
          setShowProgressToast(false)
          setInstalling(false)
          onInstallingChange?.(false)
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
    setSteps(MAIN_STEPS.map(s => ({ ...s, done: false })))
    setActiveStep(null)
  }

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.min(99, Math.round((doneCount / steps.length) * 100))
  const currentStep = steps.find(s => s.id === activeStep)

  return (
    <>
    <div className="w-full max-w-xl flex flex-col gap-6">

      {!installing && !subdomain && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-widest text-white/60">
            Server credentials
          </p>

          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Server IP (e.g. 123.45.67.89)" value={ip}
              onChange={e => setIp(e.target.value)}
              className="border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/50 transition-colors bg-white/5" />
            <input type="text" placeholder="Login (default: root)" value={login}
              onChange={e => setLogin(e.target.value)}
              className="border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/50 transition-colors bg-white/5" />
            <input type="password" placeholder="Root password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/50 transition-colors bg-white/5" />
          </div>

          {session?.user?.email && (
            <div className="flex flex-col gap-3 bg-white/5 border border-white/15 rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Updates to</p>
                <p className="text-sm font-semibold text-white">{session.user.email}</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={emailConfirmed}
                  onChange={e => setEmailConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-indigo-500 cursor-pointer shrink-0" />
                <span className="text-sm text-white/70 leading-snug">I confirm updates will be sent to this email</span>
              </label>
            </div>
          )}

          {sessionStatus === 'unauthenticated' && (
            <p className="text-xs text-white/40">Sign in above to receive progress emails.</p>
          )}

          <button onClick={handleInstall}
            disabled={!ip || !password || (!!session?.user?.email && !emailConfirmed)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            Deploy Fractera →
          </button>

          <p className="text-xs text-white/30">Credentials are used once for deployment and not stored on our servers.</p>
        </div>
      )}

      {installing && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white">
              {installError ? 'Installation failed' : (currentStep?.label ?? 'Preparing...')}
              {!installError && activeStep && (
                <span className="text-white/40 ml-2 font-normal text-sm">
                  — {Math.floor((now - stepStartedAt) / 1000)}s
                </span>
              )}
            </p>
            <p className="text-base font-bold text-white">{progress}%</p>
          </div>

          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${installError ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }} />
          </div>

          {!installError && now - lastUpdateAt > 60000 && (
            <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              No updates for {Math.floor((now - lastUpdateAt) / 1000)}s — still running in background.
            </p>
          )}

          {installError && (
            <div className="flex flex-col gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400">Error details</p>
              <p className="text-xs text-red-300 break-all whitespace-pre-wrap font-mono">{installError}</p>
              <button onClick={reset}
                className="self-start text-xs text-white/60 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg">
                Try again
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5 mt-2 pr-1 overflow-y-auto" style={{ maxHeight: 250 }}>
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                <span className={`text-sm transition-colors duration-500 ${
                  step.done && step.skipped ? 'text-white/20'
                  : step.done ? 'text-green-400'
                  : step.id === activeStep && installError ? 'text-red-400'
                  : step.id === activeStep ? 'text-amber-400'
                  : 'text-white/20'
                }`}>
                  {step.done && step.skipped ? '—' : step.done ? '✓' : step.id === activeStep && installError ? '✗' : step.id === activeStep ? '…' : '○'}
                </span>
                <span className={`text-sm transition-colors duration-500 ${
                  step.done && step.skipped ? 'text-white/20'
                  : step.done ? 'text-white/70'
                  : step.id === activeStep ? 'text-white font-semibold'
                  : 'text-white/20'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subdomain && (
        <div className="flex flex-col gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-green-400">✓ Deployment complete</p>
          <a href={`https://${subdomain}`} target="_blank" rel="noopener noreferrer"
            className="text-base font-bold text-indigo-400 hover:text-indigo-300 break-all">
            ↗ https://{subdomain}
          </a>
        </div>
      )}

    </div>

    {showProgressToast && (
      <DeployProgressToast progress={progress} strings={{
        title: 'Deploying Fractera…',
        dashboardNote: 'You can close this window — installation continues in the background.',
        checkboxLabel: 'Hide progress bar',
        hideButton: 'Minimize',
      }} onHide={() => setShowProgressToast(false)} />
    )}

    {successSubdomain && (
      <DeploySuccessToast subdomain={successSubdomain} strings={{
        title: 'Your Fractera is live',
        siteLabel: 'Public site',
        adminLabel: 'Admin panel',
        dashboardNote: 'Bookmark the admin panel URL.',
        checkboxLabel: 'Got it',
        closeButton: 'Close',
      }} onClose={() => setSuccessSubdomain(null)} />
    )}
    </>
  )
}
