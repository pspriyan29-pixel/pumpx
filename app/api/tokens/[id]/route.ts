import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id || !ObjectId.isValid(id)) return new NextResponse('Invalid id', { status: 400 })
  const db = await getDb()
  const token = await db.collection('tokens').findOne({ _id: new ObjectId(id) })
  if (!token) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json(token)
}


