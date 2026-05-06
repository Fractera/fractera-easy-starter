'use client'

import { useState, useEffect, useRef } from 'react'

type Step = { id: string; label: string; done: boolean; skipped?: boolean }

const ALL_STEPS: Step[] = [
  { id: 'connect',              label: 'Connecting to server',                     done: false },
  { id: 'apt_update',           label: 'Updating system',                          done: false },
  { id: 'apt_install',          label: 'Installing base tools',                    done: false },
  { id: 'node_repo',            label: 'Adding Node.js repository',                done: false },
  { id: 'node_install',         label: 'Installing Node.js 20',                    done: false },
  { id: 'pm2',                  label: 'Installing PM2 process manager',           done: false },
  { id: 'clear_creds',          label: 'Clearing platform credentials',            done: false },
  { id: 'clone',                label: 'Downloading Fractera',                     done: false },
  { id: 'deps_root',            label: 'Installing dependencies (1/6)',            done: false },
  { id: 'deps_app',             label: 'Installing dependencies (2/6)',            done: false },
  { id: 'deps_app_native',      label: 'Installing native modules',                done: false },
  { id: 'deps_bridge',          label: 'Installing dependencies (3/6)',            done: false },
  { id: 'deps_auth',            label: 'Installing dependencies (4/6)',            done: false },
  { id: 'deps_bridges_app',     label: 'Installing dependencies (5/6)',            done: false },
  { id: 'deps_data',            label: 'Installing dependencies (6/6)',            done: false },
  { id: 'install_claude',       label: 'Claude Code',                              done: false },
  { id: 'install_codex',        label: 'Codex',                                    done: false },
  { id: 'install_gemini',       label: 'Gemini CLI',                               done: false },
  { id: 'install_qwen',         label: 'Qwen Code',                                done: false },
  { id: 'install_kimi',         label: 'Kimi Code',                                done: false },
  { id: 'prepare_secrets',      label: 'Generating security keys',                 done: false },
  { id: 'prepare_env',          label: 'Writing environment configuration',        done: false },
  { id: 'build_app',            label: 'Building shell (production)',              done: false },
  { id: 'build_auth',           label: 'Building auth service',                    done: false },
  { id: 'build_bridges_app',    label: 'Building admin service',                   done: false },
  { id: 'start_app',            label: 'Starting shell service',                   done: false },
  { id: 'start_bridge',         label: 'Starting bridge service',                  done: false },
  { id: 'start_auth',           label: 'Starting auth service',                    done: false },
  { id: 'start_admin',          label: 'Starting admin service',                   done: false },
  { id: 'start_data',           label: 'Starting data service',                    done: false },
  { id: 'pm2_save',             label: 'Saving configuration',                     done: false },
  { id: 'configure_nginx_http', label: 'Configuring web server (HTTP)',            done: false },
  { id: 'health_check',         label: 'Verifying server is responding',           done: false },
  { id: 'register',             label: 'Registering your domain',                  done: false },
  { id: 'register_subdomains',  label: 'Registering auth / admin / data domains',  done: false },
  { id: 'nginx_domains',        label: 'Updating web server with real domains',    done: false },
  { id: 'update_env',           label: 'Updating environment with real domains',   done: false },
  { id: 'rebuild_app',          label: 'Rebuilding shell with domain',             done: false },
  { id: 'rebuild_auth',         label: 'Rebuilding auth with domain',              done: false },
  { id: 'rebuild_bridges_app',  label: 'Rebuilding admin with domain',             done: false },
  { id: 'pm2_restart',          label: 'Restarting services with new config',      done: false },
  { id: 'install_certbot',      label: 'Installing SSL tools',                     done: false },
  { id: 'wait_dns',             label: 'Waiting for DNS to propagate',             done: false },
  { id: 'ssl_cert',             label: 'Getting SSL certificates (4 domains)',     done: false },
  { id: 'https_check',          label: 'Verifying HTTPS is working',              done: false },
]

interface Props {
  sessionId: string
  onComplete?: (subdomain: string) => void
  onError?: (message: string) => void
}

export function DeployProgress({ sessionId, onComplete, onError }: Props) {
  const [steps, setSteps] = useState<Step[]>(ALL_STEPS)
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [installError, setInstallError] = useState<string | null>(null)
  const [stepStartedAt, setStepStartedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [lastUpdateAt, setLastUpdateAt] = useState(Date.now())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let prevDoneCount = 0
    let prevActive: string | null = null

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress?session_id=${sessionId}`)
        if (!res.ok) return
        const progress = await res.json()

        const newSteps = ALL_STEPS.map(s => {
          const reported = progress.steps?.find((p: Step) => p.id === s.id)
          if (!reported) return s
          return { ...s, done: reported.done, skipped: reported.label?.includes('(skipped)') }
        })
        setSteps(newSteps)

        const doneCount = newSteps.filter(s => s.done).length
        const lastStep = progress.steps?.[progress.steps.length - 1]
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
          onComplete?.(progress.subdomain)
        }

        if (progress.status === 'error') {
          clearInterval(pollRef.current!)
          const msg = progress.error ?? 'Installation failed'
          setInstallError(msg)
          onError?.(msg)
        }
      } catch {
        // retry next cycle
      }
    }, 3000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [sessionId])

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const currentStep = steps.find(s => s.id === activeStep)

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {installError
            ? 'Installation failed'
            : currentStep?.label ?? 'Starting installation…'}
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

      {!installError && now - lastUpdateAt > 60000 && (
        <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
          Server has been silent for {Math.floor((now - lastUpdateAt) / 1000)}s — installation may still be running.
        </p>
      )}

      {installError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-400 font-medium mb-1">Error details:</p>
          <p className="text-xs text-red-300 break-all whitespace-pre-wrap font-mono">{installError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5 mt-2">
        {steps.map(step => (
          <div key={step.id} className="flex items-center gap-3">
            <span className={`text-sm transition-colors duration-500 ${
              step.done && step.skipped ? 'text-gray-600'
              : step.done ? 'text-green-400'
              : step.id === activeStep && installError ? 'text-red-400'
              : step.id === activeStep ? 'text-yellow-400'
              : 'text-gray-700'
            }`}>
              {step.done && step.skipped ? '—'
               : step.done ? '✓'
               : step.id === activeStep && installError ? '✗'
               : step.id === activeStep ? '…'
               : '○'}
            </span>
            <span className={`text-sm transition-colors duration-500 ${
              step.done && step.skipped ? 'text-gray-600'
              : step.done ? 'text-gray-300'
              : step.id === activeStep ? 'text-white'
              : 'text-gray-700'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
