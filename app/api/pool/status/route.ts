import { NextResponse } from 'next/server'
import { getPoolStatus } from '@/lib/pool'

export async function GET() {
  const status = await getPoolStatus()
  return NextResponse.json(status)
}
