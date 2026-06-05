'use client'

import { useState, useEffect, useRef } from 'react'
import { ALL_STEPS, type Step } from './deploy-progress.steps'

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
  const [cancelling, setCancelling] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handleCancel() {
    const msg = installError
      ? 'Dismiss this failed deployment and reload? The broken server will be cleaned up.'
      : 'Cancel this deployment? You can start a new one immediately afterwards.'
    if (!confirm(msg)) return
    setCancelling(true)
    try {
      await fetch('/api/progress/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
    } catch {
      // idempotent — reload either way
    }
    window.location.reload()
  }

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let prevDoneCount = 0
    let prevActive: string | null = null

    const tick = async () => {
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
    }
    pollRef.current = setInterval(tick, 30000)
    tick()

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [sessionId])

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const currentStep = steps.find(s => s.id === activeStep)

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400 flex-1 truncate">
          {installError
            ? 'Deployment error — our team has been notified'
            : currentStep?.label ?? 'Starting installation…'}
          {!installError && activeStep && (
            <span className="text-gray-600 ml-2">— {Math.floor((now - stepStartedAt) / 1000)}s</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {cancelling ? '…' : installError ? 'Dismiss' : 'Cancel'}
          </button>
          <p className="text-sm text-gray-600">{progress}%</p>
        </div>
      </div>

      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${installError ? 'bg-red-500' : 'bg-green-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!installError && now - lastUpdateAt > 180000 && (
        <p className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded-lg px-3 py-2">
          Server has been silent for {Math.floor((now - lastUpdateAt) / 1000)}s — installation may still be running.
        </p>
      )}

      {installError && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-violet-300">Deployment error</p>
          <p className="text-sm text-violet-200/70 leading-relaxed">
            Our team has been notified and is fixing the issue manually.
            You will receive an email with your server details as soon as everything is ready.
          </p>
          <p className="text-xs text-violet-500">We apologize for the inconvenience.</p>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="self-start text-xs font-semibold text-violet-200 bg-violet-500/20 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 transition-colors"
          >
            {cancelling ? 'Dismissing…' : 'Dismiss and try again'}
          </button>
        </div>
      )}

      {/* Pulsing placeholder — URL will appear here after completion */}
      {!installError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-500/30 bg-orange-500/5">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
          <span className="text-sm text-orange-400 animate-pulse">
            Your site URL will appear here when ready
          </span>
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
