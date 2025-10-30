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
  if (!body || typeof body !== 'object') return new NextResponse('Invalid body', { status: 400 })
  const { featured, blacklisted, priorityLevel } = body as { featured?: boolean; blacklisted?: boolean; priorityLevel?: 'standard'|'priority'|'premium' }
  const update: any = {}
  if (typeof featured === 'boolean') update.featured = featured
  if (typeof blacklisted === 'boolean') update.blacklisted = blacklisted
  if (priorityLevel === 'standard' || priorityLevel === 'priority' || priorityLevel === 'premium') update.priorityLevel = priorityLevel
  if (Object.keys(update).length === 0) return new NextResponse('Nothing to update', { status: 400 })
  const db = await getDb()
  await db.collection('tokens').updateOne({ _id: new ObjectId(id) }, { $set: update })
  return NextResponse.json({ ok: true })
}


