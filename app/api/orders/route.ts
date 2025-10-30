import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { logJson } from '@/lib/logger'
import { resolvePriorityByAmount } from '@/lib/pricing'
import { ObjectId } from 'mongodb'
import { rateLimit } from '@/lib/ratelimit'
import { orderCreateSchema } from '@/lib/schemas'
import { ensureWritesAllowed } from '@/lib/maintenance'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try { ensureWritesAllowed() } catch (e: any) { return new NextResponse(e.message, { status: e.status || 503 }) }
  const ip = req.headers.get('x-forwarded-for') || 'ip:' + (req as any).ip || 'unknown'
  const rl = rateLimit(`orders:post:${ip}`)
  if (!rl.ok) return new NextResponse('Too Many Requests', { status: 429 })
  const body = await req.json().catch(() => null)
  const parsed = orderCreateSchema.safeParse(body)
  if (!parsed.success) return new NextResponse('Invalid payload', { status: 400 })
  const { tokenId, chain, amount, txHash, payer } = parsed.data
  if (!tokenId || !ObjectId.isValid(tokenId)) return new NextResponse('Invalid tokenId', { status: 400 })
  if (chain !== 'solana' && chain !== 'bnb') return new NextResponse('Invalid chain', { status: 400 })
  if (typeof amount !== 'number' || amount < 0) return new NextResponse('Invalid amount', { status: 400 })

  const db = await getDb()
  const token = await db.collection('tokens').findOne({ _id: new ObjectId(tokenId) })
  if (!token) return new NextResponse('Token not found', { status: 404 })

  const priority = resolvePriorityByAmount(amount)
  const orderDoc = {
    tokenId: new ObjectId(tokenId),
    chain,
    amount,
    priority,
    txHash: txHash || null,
    payer: payer || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdAtDt: new Date(),
  }
  await db.collection('orders').insertOne(orderDoc)

  await db.collection('tokens').updateOne(
    { _id: new ObjectId(tokenId) },
    { $set: { priorityLevel: priority, featured: priority !== 'standard' } }
  )

  const res = NextResponse.json({ ok: true, priority })
  logJson('info', 'orders_post', { rid: req.headers.get('x-request-id'), ms: Date.now() - t0, tokenId, chain, priority })
  return res
}

export async function GET(req: NextRequest) {
  const t0 = Date.now()
  const ip = req.headers.get('x-forwarded-for') || 'ip:' + (req as any).ip || 'unknown'
  const rl = rateLimit(`orders:get:${ip}`)
  if (!rl.ok) return new NextResponse('Too Many Requests', { status: 429 })
  const { searchParams } = new URL(req.url)
  const tokenId = searchParams.get('tokenId')
  const db = await getDb()
  const query: any = {}
  if (tokenId && ObjectId.isValid(tokenId)) query.tokenId = new ObjectId(tokenId)
  const orders = await db.collection('orders').find(query).sort({ createdAt: -1 }).limit(100).toArray()
  const res = NextResponse.json(orders)
  logJson('info', 'orders_get', { rid: req.headers.get('x-request-id'), ms: Date.now() - t0, count: orders.length })
  return res
}


