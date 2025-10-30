import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req as any)) return new NextResponse('Unauthorized', { status: 401 })
  const db = await getDb()
  const items = await db.collection('launchRequests').find({}).sort({ createdAtDt: -1 }).limit(100).toArray()
  return NextResponse.json(items)
}


