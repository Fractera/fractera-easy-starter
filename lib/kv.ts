import { kv } from '@vercel/kv'

export type ProgressStep = {
  id: string
  label: string
  done: boolean
  ts: number
}

export type InstallProgress = {
  session_id: string
  status: 'installing' | 'done' | 'error'
  steps: ProgressStep[]
  subdomain?: string
  error?: string
}

export async function initProgress(session_id: string): Promise<void> {
  const initial: InstallProgress = {
    session_id,
    status: 'installing',
    steps: [],
  }
  await kv.set(`progress:${session_id}`, JSON.stringify(initial), { ex: 3600 })
}

export async function appendStep(session_id: string, step: ProgressStep): Promise<void> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return
  const progress: InstallProgress = JSON.parse(raw)
  const existing = progress.steps.findIndex(s => s.id === step.id)
  if (existing >= 0) {
    progress.steps[existing] = step
  } else {
    progress.steps.push(step)
  }
  await kv.set(`progress:${session_id}`, JSON.stringify(progress), { ex: 3600 })
}

export async function completeProgress(session_id: string, subdomain: string): Promise<void> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return
  const progress: InstallProgress = JSON.parse(raw)
  progress.status = 'done'
  progress.subdomain = subdomain
  await kv.set(`progress:${session_id}`, JSON.stringify(progress), { ex: 86400 })
}

export async function failProgress(session_id: string, error: string): Promise<void> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return
  const progress: InstallProgress = JSON.parse(raw)
  progress.status = 'error'
  progress.error = error
  await kv.set(`progress:${session_id}`, JSON.stringify(progress), { ex: 3600 })
}

export async function getProgress(session_id: string): Promise<InstallProgress | null> {
  const raw = await kv.get<string>(`progress:${session_id}`)
  if (!raw) return null
  return JSON.parse(raw)
}
