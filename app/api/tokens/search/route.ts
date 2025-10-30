import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit
  const db = await getDb()
  const base: any = { blacklisted: { $ne: true } }
  const filter: any = q
    ? { $and: [ base, { $or: [ { name: { $regex: q, $options: 'i' } }, { symbol: { $regex: q, $options: 'i' } } ] } ] }
    : base
  const [items, total] = await Promise.all([
    db.collection('tokens').find(filter, { projection: { name: 1, symbol: 1, chain: 1, createdAt: 1, creator: 1, logoUrl: 1, featured: 1, priorityLevel: 1 } }).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection('tokens').countDocuments(filter)
  ])
  const res = NextResponse.json({ items, total, page, limit })
  res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=120')
  return res
}


