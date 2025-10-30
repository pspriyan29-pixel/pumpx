import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { rateLimit } from '@/lib/ratelimit'

// Stub: validates priority payment, then records a placeholder Dex pair URL
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'ip:' + (req as any).ip || 'unknown'
  const rl = rateLimit(`launch:${ip}`)
  if (!rl.ok) return new NextResponse('Too Many Requests', { status: 429 })
  const body = await req.json().catch(() => null)
  if (!body) return new NextResponse('Invalid payload', { status: 400 })
  const { tokenId } = body as { tokenId: string }
  if (!tokenId || !ObjectId.isValid(tokenId)) return new NextResponse('Invalid tokenId', { status: 400 })

  const db = await getDb()
  const token = await db.collection('tokens').findOne({ _id: new ObjectId(tokenId) })
  if (!token) return new NextResponse('Token not found', { status: 404 })

  // Require at least priority tier before launch request
  if (!token.priorityLevel || token.priorityLevel === 'standard') {
    return new NextResponse('Priority required (priority or premium)', { status: 403 })
  }

  // Optional: ensure there exists a verified order for this token
  const verifiedOrder = await db.collection('orders').findOne({ tokenId: new ObjectId(tokenId), status: 'verified' })
  if (!verifiedOrder) {
    return new NextResponse('Verified payment required', { status: 403 })
  }

  // In real integration, create pair + add LP via chain SDK then store exact pair URL
  const placeholderPairUrl = `https://dexscreener.com/${token.chain === 'bnb' ? 'bsc' : 'solana'}/search?q=${encodeURIComponent(token.symbol)}`
  await db.collection('tokens').updateOne(
    { _id: new ObjectId(tokenId) },
    { $set: { dexPairUrl: placeholderPairUrl, launchedAt: new Date().toISOString() } }
  )

  return NextResponse.json({ ok: true, dexPairUrl: placeholderPairUrl })
}


