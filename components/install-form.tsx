'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useHeroContent } from '@/lib/i18n/context'
import { useLang } from '@/lib/i18n/use-lang'
import { DeploySuccessToast } from './deploy-success-toast'
import { DeployProgressToast } from './deploy-progress-toast'
import { buildUrls } from '@/lib/subdomain-helpers'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { SELECTABLE_COMPONENTS, ALL_COMPONENT_IDS, type ComponentId } from '@/lib/components-catalog'

import { ALL_STEPS, type Step } from './deploy-progress.steps'


export function InstallForm({ onSubdomainReady, onInstallingChange, onWhiteLabel, domainUrl }: {
  onSubdomainReady?: (subdomain: string) => void
  onInstallingChange?: (installing: boolean) => void
  onWhiteLabel?: (serverTokenId: string) => void
  // Referral domain link surfaced in the progress toast (from pricing-flow's
  // domainProviderSection — the same link as the left deploy-options container).
  domainUrl?: string
} = {}) {
  const lang = useLang()
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
  const [successSubdomain, setSuccessSubdomain] = useState<string | null>(null)
  const [showProgressToast, setShowProgressToast] = useState(false)
  const [detectedSubdomain, setDetectedSubdomain] = useState<string | null>(null)
  const [freeServerTokenId, setFreeServerTokenId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [destroying, setDestroying] = useState(false)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  // Security acknowledgment: the user must confirm they will change the server
  // password after deployment (Fractera never stores it). Always required —
  // gates the launch button regardless of login state.
  const [passwordAck, setPasswordAck] = useState(false)
  // Selective install (S3): full mode installs everything (default, sends no
  // `components`); custom mode sends the checked subset (may be empty = no AI).
  const [customMode, setCustomMode] = useState(false)
  const [selected, setSelected] = useState<ComponentId[]>(ALL_COMPONENT_IDS)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: session, status: sessionStatus } = useSession()

  // Reset email confirmation when server status changes away from 'fresh'
  useEffect(() => {
    if (serverStatus !== 'fresh') setEmailConfirmed(false)
  }, [serverStatus])

  // Tick every second while installing — for elapsed time and silence detection
  useEffect(() => {
    if (!installing) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [installing])

  // No auto-check on keystroke — user clicks Check button manually

  async function checkNow() {
    if (!ip || !login || !password) return
    setServerStatus('checking')
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
  }

  async function handleInstall() {
    if (!ip || !password) return
    setServerStatus('idle')
    setDetectedSubdomain(null)
    setStatusError(null)
    setInstalling(true)
    setShowProgressToast(true)
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
      // In custom mode send the explicit subset (even if empty → server-only);
      // in full mode omit `components` so bootstrap installs everything.
      body: JSON.stringify({ ip, login, password, session_id, ...(customMode ? { components: selected } : {}) }),
    }).catch(() => {})

    let prevDoneCount = 0
    let prevActive: string | null = null

    const tick = async () => {
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
          setShowProgressToast(false)
          onInstallingChange?.(false)
          onSubdomainReady?.(progress.subdomain)
          setSuccessSubdomain(progress.subdomain)
        }

        if (progress.status === 'error') {
          clearInterval(pollInterval)
          setInstallError(progress.error ?? 'Installation failed')
          setShowProgressToast(false)
          toast.error(progress.error ?? 'Installation failed', { duration: 10000 })
        }
      } catch {
        // Network error — retry next cycle
      }
    }
    const pollInterval = setInterval(tick, 30000)
    tick()

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
  const content = useHeroContent()
  const t = content.installForm

  return (
    <>
    <div className="w-full max-w-xl flex flex-col gap-6">

      {/* Form */}
      {!installing && !subdomain && (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-white font-bold uppercase tracking-widest">
            {t.title}
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={t.ipPlaceholder}
              value={ip}
              onChange={e => setIp(e.target.value)}
              className="bg-white/5 border border-white/40 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-white/70 transition-colors"
            />
            <input
              type="text"
              placeholder={t.loginPlaceholder}
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="bg-white/5 border border-white/40 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-white/70 transition-colors"
            />
            <div className="flex flex-col gap-1.5">
              <input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-white/5 border border-white/40 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-white/70 transition-colors"
              />
              <p className="text-xs text-white/75 leading-relaxed pl-1">{t.passwordHint}</p>
            </div>
          </div>

          {/* Component selection (S3) — full vs custom install */}
          <div className="flex flex-col gap-3 bg-white/[0.03] border border-white/15 rounded-xl p-4">
            <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
              <span className="text-sm text-white font-medium">
                {customMode ? t.componentSelect.customLabel : t.componentSelect.fullLabel}
              </span>
              {/* Switch ON = standard/full build (default — everything installed);
                  turning it OFF reveals the custom checkbox selection. Visual is
                  inverted from `customMode` so "all active" reads as ON. Effective
                  default is unchanged: customMode stays false → no `components` sent. */}
              <Switch checked={!customMode} onCheckedChange={(v) => setCustomMode(!v)} />
            </label>

            {customMode && (
              <div className="flex flex-col gap-4 pt-1">
                <p className="text-xs text-white/45 leading-relaxed">{t.componentSelect.customHint}</p>
                {(['agent', 'service'] as const).map(group => (
                  <div key={group} className="flex flex-col gap-2.5">
                    <p className="text-[11px] uppercase tracking-widest text-white/40">
                      {group === 'agent' ? t.componentSelect.agentsTitle : t.componentSelect.servicesTitle}
                    </p>
                    {SELECTABLE_COMPONENTS.filter(c => c.group === group).map(c => {
                      const it = t.componentSelect.items[c.id]
                      const on = selected.includes(c.id)
                      return (
                        <label key={c.id} className="flex items-start gap-3 cursor-pointer select-none">
                          <Checkbox
                            checked={on}
                            onCheckedChange={(v) =>
                              setSelected(prev => v ? [...new Set([...prev, c.id])] : prev.filter(x => x !== c.id))
                            }
                            className="mt-0.5"
                          />
                          <span className="flex flex-col">
                            <span className="text-sm text-white leading-snug">{it.name}</span>
                            <span className="text-xs text-white/40 leading-snug">{it.desc}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                ))}
                <p className="text-xs text-white/35 leading-relaxed border-t border-white/10 pt-2">
                  {t.componentSelect.coreNote}
                </p>
              </div>
            )}
          </div>

          {serverStatus === 'checking' && (
            <div className="flex items-center gap-2 text-base text-white font-medium">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.checking}
            </div>
          )}

          {serverStatus === 'installed' && (
            <div className="flex flex-col gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                <p className="text-sm font-semibold text-green-400">{t.alreadyInstalled}</p>
              </div>
              {detectedSubdomain && (() => {
                const u = buildUrls(detectedSubdomain)
                return (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-white font-bold uppercase tracking-widest">{t.yourDomains}</p>
                    <a href={u.appUrl} target="_blank" rel="noopener noreferrer"
                      className="text-base text-green-300 font-semibold hover:text-green-200 transition-colors">
                      ↗ {u.appLabel} <span className="text-white text-sm font-medium">site</span>
                    </a>
                    <a href={u.authUrl} target="_blank" rel="noopener noreferrer"
                      className="text-base text-green-300 font-semibold hover:text-green-200 transition-colors">
                      ↗ {u.mode === 'ip' ? `${u.ip}:3001` : `auth.${detectedSubdomain}`} <span className="text-white text-sm font-medium">login / register</span>
                    </a>
                    <a href={u.adminUrl} target="_blank" rel="noopener noreferrer"
                      className="text-base text-green-300 font-semibold hover:text-green-200 transition-colors">
                      ↗ {u.adminLabel} <span className="text-white text-sm font-medium">admin</span>
                    </a>
                    {u.mode === 'ip' && (
                      <p className="text-xs text-amber-300/90 leading-relaxed mt-1 pt-2 border-t border-green-500/20">
                        ⚠ Откройте ссылки в инкогнито (<code className="bg-white/10 px-1.5 rounded">Ctrl+Shift+N</code>).
                        Если браузер ругается «Небезопасно» — <strong>Дополнительно → Перейти на сайт</strong>.
                        Это HTTP без SSL — нормально пока не привязали свой домен.
                        После привязки в админ-панели → автоматически появится SSL и зелёный замок.
                      </p>
                    )}
                  </div>
                )
              })()}
              {onWhiteLabel && freeServerTokenId && (
                <button
                  onClick={() => onWhiteLabel(freeServerTokenId)}
                  className="text-xs text-white bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 transition-colors px-3 py-1.5 rounded-lg font-medium"
                >
                  {t.removeWhiteLabel}
                </button>
              )}

              <div className="flex flex-wrap gap-2 mt-1">
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
                  {destroying ? t.removing : t.deleteReinstall}
                </button>
              </div>
            </div>
          )}

          {serverStatus === 'fresh' && statusError && (
            <div className="flex items-center gap-3">
              <p className="text-xs text-yellow-600 px-1">{t.cantReach}</p>
              <button
                type="button"
                onClick={checkNow}
                className="text-xs font-semibold text-white border border-white/40 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                Check
              </button>
            </div>
          )}

          {/* Email confirmation — shown when server is ready to install */}
          {serverStatus === 'fresh' && (
            sessionStatus === 'loading' ? (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                Loading account info…
              </div>
            ) : session?.user?.email ? (
              <div className="flex flex-col gap-3 bg-white/[0.04] border border-white/20 rounded-xl p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-white/50 uppercase tracking-widest">{t.updatesTo}</p>
                  <p className="text-sm font-semibold text-white">{session.user.email}</p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <Checkbox
                    checked={emailConfirmed}
                    onCheckedChange={v => setEmailConfirmed(!!v)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-white leading-snug">
                    {t.emailConfirmCheck}
                  </span>
                </label>
                <p className="text-xs text-white/35 leading-relaxed">
                  {t.emailConfirmNote}
                </p>
              </div>
            ) : null
          )}

          {/* Check button — manual only, no auto-requests */}
          {serverStatus === 'idle' && ip && login && password && (
            <button
              type="button"
              onClick={checkNow}
              className="w-full border border-white/30 hover:border-white/50 text-white/70 hover:text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
            >
              {t.checking ? 'Check server' : 'Check server'}
            </button>
          )}

          {/* Security acknowledgment — Fractera never stores the password and has
              no way to reach the server after install; changing it is the user's
              own responsibility. Mandatory; gates the launch button. */}
          {(serverStatus === 'fresh' || serverStatus === 'idle') && (
            <div className="flex flex-col gap-3 bg-white/[0.04] border border-white/20 rounded-xl p-4">
              <p className="text-xs text-white/60 leading-relaxed">{t.security.note}</p>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <Checkbox
                  checked={passwordAck}
                  onCheckedChange={v => setPasswordAck(!!v)}
                  className="mt-0.5"
                />
                <span className="text-sm text-white leading-snug">{t.security.passwordAck}</span>
              </label>
            </div>
          )}

          {/* Launch is gated by the acknowledgment checkbox(es): passwordAck is
              always required; emailConfirmed is also required once the server is
              confirmed fresh and the account has an email. Until they are ticked
              the button stays in a clearly muted, non-interactive "passive"
              state (dimmed fill/border/text, no hover, not-allowed cursor). */}
          {(serverStatus === 'fresh' || serverStatus === 'idle') && (
            <button
              onClick={handleInstall}
              disabled={!ip || !password || !passwordAck || (serverStatus === 'fresh' && !!session?.user?.email && !emailConfirmed)}
              className="w-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/40 hover:border-white/60 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-white/[0.02] disabled:border-white/10 disabled:text-white/30 disabled:hover:bg-white/[0.02] disabled:hover:border-white/10"
            >
              {t.launchButton}
            </button>
          )}

          <p className="text-sm text-white">
            {t.credentials}
          </p>
        </div>
      )}

      {/* Progress */}
      {installing && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base text-white font-semibold">
              {installError ? t.installFailed : (currentStep?.label ?? t.preparing)}
              {!installError && activeStep && (
                <span className="text-white/60 ml-2">— {Math.floor((now - stepStartedAt) / 1000)}s</span>
              )}
            </p>
            <p className="text-base text-white font-bold">{progress}%</p>
          </div>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${installError ? 'bg-red-500' : 'bg-green-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Silence warning */}
          {!installError && installing && now - lastUpdateAt > 180000 && (
            <p className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded-lg px-3 py-2">
              {t.silentWarning.replace('{secs}', String(Math.floor((now - lastUpdateAt) / 1000)))}
            </p>
          )}

          {/* Error message */}
          {installError && (
            <div className="flex flex-col gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 font-medium">{t.errorDetails}</p>
              <p className="text-xs text-red-300 break-all whitespace-pre-wrap font-mono">{installError}</p>
              <button
                onClick={reset}
                className="self-start text-xs text-white bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg"
              >
                {t.tryAgain}
              </button>
              <p className="text-xs text-white/40 leading-relaxed">
                {lang === 'ru' ? 'или ' : 'or '}
                <a
                  href={`/${lang}/partners`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {lang === 'ru' ? 'запустите развёртывание через AI-агента (MCP)' : 'launch deployment via an AI agent (MCP)'}
                </a>
                {lang === 'ru' ? ' — он сможет сам устранить ошибку.' : ' — it can fix the error itself.'}
              </p>
            </div>
          )}

          {/* Steps list — fixed 250px viewport with vertical scroll so the
              install card doesn't grow with every reported step. New steps
              are appended at the bottom; we don't auto-scroll because the
              user usually wants to read the most-recent progress.
              Inline style (not Tailwind max-h-[250px]) — JIT-compiled
              arbitrary values were silently dropped in a previous build. */}
          <div
            className="flex flex-col gap-1.5 mt-2 pr-1 overflow-y-auto"
            style={{ maxHeight: 250 }}
          >
            {/* Selective install: fully hide steps for components the user did
                not select. Bootstrap reports those as "(skipped)" (done+skipped);
                we drop them from the list so the pipeline shows only what is
                actually being installed. They still count as done in the % above. */}
            {steps.filter(step => !(step.done && step.skipped)).map(step => (
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
                  step.done && step.skipped ? 'text-white/30' : step.done ? 'text-white' : step.id === activeStep ? 'text-white font-bold' : 'text-white/40'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>

    {showProgressToast && (
      <DeployProgressToast
        progress={progress}
        strings={t.progressToast}
        onHide={() => setShowProgressToast(false)}
        domainUrl={domainUrl}
        serverIp={ip}
      />
    )}

    {successSubdomain && (
      <DeploySuccessToast
        subdomain={successSubdomain}
        strings={t.successToast}
        onClose={() => setSuccessSubdomain(null)}
      />
    )}
    </>
  )
}
