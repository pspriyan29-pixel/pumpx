import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id || !ObjectId.isValid(id)) return new NextResponse('Invalid id', { status: 400 })
  if (!isAdminAuthorized(req as any)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const dexPairUrl = body?.dexPairUrl
  if (!dexPairUrl || typeof dexPairUrl !== 'string') return new NextResponse('Invalid dexPairUrl', { status: 400 })
  const db = await getDb()
  await db.collection('tokens').updateOne({ _id: new ObjectId(id) }, { $set: { dexPairUrl } })
  return NextResponse.json({ ok: true })
}


