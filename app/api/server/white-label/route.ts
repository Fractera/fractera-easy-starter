import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '').trim()
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const serverToken = await db.serverToken.findUnique({ where: { token } })
  if (!serverToken) {
    return NextResponse.json({ error: 'Unknown token' }, { status: 401 })
  }

  return NextResponse.json({ white_label: serverToken.whiteLabelActive })
}
