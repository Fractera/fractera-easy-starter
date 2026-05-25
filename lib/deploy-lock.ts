import { db } from '@/lib/db'
import { getProgress } from '@/lib/kv'

export interface ActiveDeploy {
  sessionId: string
  serverToken: string
  ageMs: number
}

const DEPLOY_FRESHNESS_MS = 20 * 60 * 1000

export async function findActiveDeployForIp(ip: string): Promise<ActiveDeploy | null> {
  const recentTokens = await db.serverToken.findMany({
    where: {
      serverIp: ip,
      status: { in: ['pending', 'provisioning', 'queued'] },
      deploySessionId: { not: null },
    },
    select: { token: true, deploySessionId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  for (const candidate of recentTokens) {
    if (!candidate.deploySessionId) continue
    const progress = await getProgress(candidate.deploySessionId)
    if (!progress) continue
    if (progress.status === 'installing') {
      const lastTs = progress.steps?.length ? progress.steps[progress.steps.length - 1].ts : 0
      const ageMs = Date.now() - lastTs
      if (ageMs < DEPLOY_FRESHNESS_MS) {
        return {
          sessionId: candidate.deploySessionId,
          serverToken: candidate.token,
          ageMs,
        }
      }
    }
  }

  return null
}
