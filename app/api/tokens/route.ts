import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { rateLimit } from '@/lib/ratelimit'
import { tokenCreateSchema } from '@/lib/schemas'
import { ensureWritesAllowed } from '@/lib/maintenance'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit
  try {
    const db = await getDb()
    const [items, total] = await Promise.all([
      db.collection('tokens')
        .find({ blacklisted: { $ne: true } }, { projection: { name: 1, symbol: 1, chain: 1, createdAt: 1, creator: 1, logoUrl: 1, featured: 1, priorityLevel: 1 } })
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('tokens').countDocuments({ blacklisted: { $ne: true } })
    ])
    const res = NextResponse.json({ items, total, page, limit })
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
    return res
  } catch (e: any) {
    return new NextResponse('Database not configured', { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try { ensureWritesAllowed() } catch (e: any) { return new NextResponse(e.message, { status: e.status || 503 }) }
  const ip = req.headers.get('x-forwarded-for') || 'ip:' + (req as any).ip || 'unknown'
  const rl = rateLimit(`tokens:post:${ip}`)
  if (!rl.ok) return new NextResponse('Too Many Requests', { status: 429 })
  const body = await req.json().catch(() => null)
  const parsed = tokenCreateSchema.safeParse(body)
  if (!parsed.success) return new NextResponse('Invalid payload', { status: 400 })
  const { name, symbol, chain, creator, description, logoUrl } = parsed.data
  const doc = {
    name: name.trim(),
    symbol: symbol.trim().toUpperCase(),
    chain,
    creator,
    description,
    logoUrl,
    createdAt: new Date().toISOString(),
    createdAtDt: new Date(),
  }
  const db = await getDb()
  await db.collection('tokens').insertOne(doc)
  return NextResponse.json({ ok: true })
}


