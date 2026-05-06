import { handlers } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  try {
    return await handlers.GET(req, ctx)
  } catch (e) {
    console.error('[auth][route][GET][uncaught]', String(e), e instanceof Error ? e.stack : '')
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  try {
    return await handlers.POST(req, ctx)
  } catch (e) {
    console.error('[auth][route][POST][uncaught]', String(e), e instanceof Error ? e.stack : '')
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
