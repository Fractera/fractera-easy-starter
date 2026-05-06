import { NextRequest, NextResponse } from 'next/server'
import { deployToServer } from '@/lib/deploy'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { ip, login, password, session_id, platform, serverToken } = await req.json()

  if (!ip || !login || !password || !session_id) {
    return NextResponse.json({ error: 'Missing ip, login, password or session_id' }, { status: 400 })
  }

  await deployToServer({ ip, login, password, session_id, platform, serverToken })

  return NextResponse.json({ session_id, status: 'installing' })
}
