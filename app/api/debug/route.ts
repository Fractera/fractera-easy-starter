import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_prefix: process.env.DATABASE_URL?.slice(0, 20) ?? null,
    },
  }

  try {
    await db.$queryRaw`SELECT 1 as ok`
    results.db = 'connected'
  } catch (e) {
    results.db = 'error'
    results.dbError = String(e)
  }

  try {
    const userCount = await db.user.count()
    results.userCount = userCount
  } catch (e) {
    results.userCountError = String(e)
  }

  return Response.json(results)
}
