import { NextResponse } from 'next/server'
import { getTreasury } from '@/lib/config'

export async function GET() {
  return NextResponse.json({ treasury: getTreasury() })
}


