'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

type Step = { id: string; label: string; done: boolean }

const ALL_STEPS: Step[] = [
  { id: 'connect',      label: 'Подключаюсь к серверу',            done: false },
  { id: 'apt_update',   label: 'Обновляю систему',                  done: false },
  { id: 'apt_install',  label: 'Устанавливаю базовые инструменты',  done: false },
  { id: 'node_setup',   label: 'Подготавливаю Node.js',             done: false },
  { id: 'node_install', label: 'Устанавливаю Node.js 20',           done: false },
  { id: 'pm2',          label: 'Устанавливаю PM2',                  done: false },
  { id: 'clone',        label: 'Скачиваю Fractera',                 done: false },
  { id: 'deps_root',    label: 'Зависимости 1/4',                   done: false },
  { id: 'deps_app',     label: 'Зависимости 2/4',                   done: false },
  { id: 'deps_bridge',  label: 'Зависимости 3/4',                   done: false },
  { id: 'deps_media',   label: 'Зависимости 4/4',                   done: false },
  { id: 'start_app',    label: 'Запускаю приложение',               done: false },
  { id: 'start_bridge', label: 'Запускаю Bridge',                   done: false },
  { id: 'start_media',  label: 'Запускаю медиасервис',              done: false },
  { id: 'pm2_save',     label: 'Сохраняю конфигурацию',             done: false },
  { id: 'get_ip',       label: 'Определяю IP-адрес',                done: false },
  { id: 'register',     label: 'Регистрирую домен',                 done: false },
  { id: 'done',         label: 'Установка завершена',               done: false },
]

function generateSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
      toast.error('Не удалось подключиться к серверу установки')
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

  return (
    <div className="w-full max-w-xl flex flex-col gap-6">

      {/* Form */}
      {!installing && !subdomain && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 uppercase tracking-widest">Установить Fractera на сервер</p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="IP-адрес сервера (например: 109.199.105.213)"
              value={ip}
              onChange={e => setIp(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="text"
              placeholder="Логин (обычно: root)"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <button
            onClick={handleInstall}
            disabled={!ip || !password}
            className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Установить Fractera
          </button>

          <p className="text-xs text-gray-600">
            Данные используются только для установки и не сохраняются на наших серверах.
          </p>
        </div>
      )}

      {/* Progress */}
      {installing && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{currentStep?.label ?? 'Подготовка...'}</p>
            <p className="text-sm text-gray-600">{progress}%</p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps list */}
          <div className="flex flex-col gap-1.5 mt-2">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                <span className={`text-sm transition-colors duration-500 ${
                  step.done ? 'text-green-400' : step.id === activeStep ? 'text-yellow-400' : 'text-gray-700'
                }`}>
                  {step.done ? '✓' : step.id === activeStep ? '...' : '○'}
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
          <p className="text-lg font-semibold text-green-400">Fractera установлена!</p>
          <p className="text-sm text-gray-400">Ваш адрес готов:</p>
          <a
            href={`https://${subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 underline underline-offset-2 text-base font-mono"
          >
            https://{subdomain}
          </a>
          <p className="text-xs text-gray-600">
            Первый аккаунт который вы создадите станет Администратором.
          </p>
        </div>
      )}
    </div>
  )
}
