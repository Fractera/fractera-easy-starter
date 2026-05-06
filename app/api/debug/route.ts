import { db } from '@/lib/db'
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? ''
  const authUrl = process.env.AUTH_URL ?? ''
  const nextauthUrl = process.env.NEXTAUTH_URL ?? ''

  // The host NextAuth actually sees (used for redirect_uri when trustHost:true)
  const requestHost = req.headers.get('host') ?? ''
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const computedBase = `${proto}://${requestHost}`
  const computedRedirectUri = `${computedBase}/api/auth/callback/google`

  const results: Record<string, unknown> = {
    google: {
      // First 40 chars — enough to see which Client ID is loaded without exposing full secret
      GOOGLE_CLIENT_ID_prefix: clientId ? clientId.slice(0, 40) + '…' : '❌ NOT SET',
      GOOGLE_CLIENT_ID_suffix: clientId ? '…' + clientId.slice(-20) : '❌ NOT SET',
      GOOGLE_CLIENT_SECRET_set: !!process.env.GOOGLE_CLIENT_SECRET,
    },
    auth_urls: {
      AUTH_URL: authUrl || '(not set — trustHost will use request host)',
      NEXTAUTH_URL: nextauthUrl || '(not set)',
      AUTH_SECRET_set: !!process.env.AUTH_SECRET,
    },
    redirect_uri: {
      request_host: requestHost,
      computed_base: computedBase,
      // This is the exact redirect_uri NextAuth sends to Google
      computed_redirect_uri: computedRedirectUri,
      note: 'This URI must be in Google Console → Authorized redirect URIs',
    },
    env: {
      RESEND_API_KEY_set: !!process.env.RESEND_API_KEY,
      DATABASE_URL_set: !!process.env.DATABASE_URL,
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

  return Response.json(results, {
    headers: { 'Content-Type': 'application/json' },
  })
}
