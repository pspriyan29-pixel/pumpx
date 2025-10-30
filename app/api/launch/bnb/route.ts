import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { rateLimit } from '@/lib/ratelimit'
import { launchBnbSchema } from '@/lib/schemas'
import { ensureWritesAllowed } from '@/lib/maintenance'

// Records a BNB launch request with LP params; future worker will execute on-chain
export async function POST(req: NextRequest) {
  try { ensureWritesAllowed() } catch (e: any) { return new NextResponse(e.message, { status: e.status || 503 }) }
  const ip = req.headers.get('x-forwarded-for') || 'ip:' + (req as any).ip || 'unknown'
  const rl = rateLimit(`launch:bnb:${ip}`)
  if (!rl.ok) return new NextResponse('Too Many Requests', { status: 429 })

  const body = await req.json().catch(() => null)
  const parsed = launchBnbSchema.safeParse(body)
  if (!parsed.success) return new NextResponse('Invalid payload', { status: 400 })
  const { tokenId, tokenAddress, baseAmount, quoteAmount } = parsed.data
  if (!ObjectId.isValid(tokenId)) return new NextResponse('Invalid tokenId', { status: 400 })

  const db = await getDb()
  const token = await db.collection('tokens').findOne({ _id: new ObjectId(tokenId) })
  if (!token) return new NextResponse('Token not found', { status: 404 })
  if (token.chain !== 'bnb') return new NextResponse('Not a BNB token', { status: 400 })

  const verifiedOrder = await db.collection('orders').findOne({ tokenId: new ObjectId(tokenId), status: 'verified' })
  if (!verifiedOrder) return new NextResponse('Verified payment required', { status: 403 })

  const doc = {
    tokenId: new ObjectId(tokenId),
    chain: 'bnb',
    tokenAddress,
    baseAmount,
    quoteAmount,
    status: 'queued',
    createdAt: new Date().toISOString(),
    createdAtDt: new Date(),
  }
  await db.collection('launchRequests').insertOne(doc)
  await db.collection('tokens').updateOne({ _id: new ObjectId(tokenId) }, { $set: { launchRequestedAt: new Date().toISOString() } })
  return NextResponse.json({ ok: true })
}


