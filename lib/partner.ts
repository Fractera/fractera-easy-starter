import { db } from '@/lib/db'
import { generateSubdomain } from '@/lib/subdomain'

const MAX_ATTEMPTS = 12

export async function generateUniquePartnerSlug(): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = generateSubdomain()
    const taken = await db.partner.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!taken) return candidate
  }
  throw new Error('Could not generate unique partner slug after ' + MAX_ATTEMPTS + ' attempts')
}
