import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

// Stub verification: mark order as verified=true. Replace with on-chain checks later.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return new NextResponse('Invalid payload', { status: 400 })
  const { orderId } = body as { orderId: string }
  if (!orderId || !ObjectId.isValid(orderId)) return new NextResponse('Invalid orderId', { status: 400 })
  const db = await getDb()
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })
  if (!order) return new NextResponse('Not found', { status: 404 })
  await db.collection('orders').updateOne({ _id: new ObjectId(orderId) }, { $set: { status: 'verified', verifiedAt: new Date().toISOString() } })
  return NextResponse.json({ ok: true })
}


