import { Redis } from '@upstash/redis'
import { getProgress } from '@/lib/kv'

const kv = Redis.fromEnv()

export interface ActiveDeploy {
  sessionId: string
  serverToken: string
  ageMs: number
}

const DEPLOY_FRESHNESS_MS = 20 * 60 * 1000
const LOCK_TTL_SECONDS = 20 * 60

export async function findActiveDeployForIp(ip: string): Promise<ActiveDeploy | null> {
  const lockKey = `deploy-lock:${ip}`
  const existingSessionId = await kv.get<string>(lockKey)

  if (existingSessionId) {
    const progress = await getProgress(existingSessionId)
    if (progress && progress.status === 'installing') {
      const lastTs = progress.steps?.length ? progress.steps[progress.steps.length - 1].ts : 0
      const ageMs = Date.now() - lastTs
      if (ageMs < DEPLOY_FRESHNESS_MS) {
        return {
          sessionId: existingSessionId,
          serverToken: '',
          ageMs,
        }
      }
    }
  }

  return null
}

export async function acquireDeployLock(ip: string, sessionId: string): Promise<boolean> {
  const lockKey = `deploy-lock:${ip}`
  const result = await kv.set(lockKey, sessionId, { ex: LOCK_TTL_SECONDS, nx: true })
  if (result === 'OK') return true

  const active = await findActiveDeployForIp(ip)
  if (active) return false

  await kv.set(lockKey, sessionId, { ex: LOCK_TTL_SECONDS })
  return true
}

export async function releaseDeployLock(ip: string): Promise<void> {
  await kv.del(`deploy-lock:${ip}`)
}
