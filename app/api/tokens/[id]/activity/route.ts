import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id || !ObjectId.isValid(id)) return new NextResponse('Invalid id', { status: 400 })
  const db = await getDb()
  const [orders, launches] = await Promise.all([
    db.collection('orders').find({ tokenId: new ObjectId(id) }).sort({ createdAt: -1 }).limit(100).toArray(),
    db.collection('launchRequests').find({ tokenId: new ObjectId(id) }).sort({ createdAt: -1 }).limit(50).toArray(),
  ])
  return NextResponse.json({ orders, launches })
}


