import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ensureIndexes } from '@/lib/dbIndexes'

export async function POST(req: NextRequest) {
  const adminHeader = req.headers.get('x-admin-token') || ''
  if (!process.env.ADMIN_TOKEN || adminHeader !== process.env.ADMIN_TOKEN) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const db = await getDb()
  await ensureIndexes(db)
  return NextResponse.json({ ok: true })
}


