import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyMessage } from 'viem'
import { logJson } from '@/lib/logger'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const body = await req.json().catch(() => null)
  if (!body) return new NextResponse('Invalid payload', { status: 400 })
  const { address, signature, message } = body as { address: `0x${string}`; signature: `0x${string}`; message: string }
  if (!address || !signature || !message) return new NextResponse('Missing fields', { status: 400 })

  const db = await getDb()
  const nonceDoc = await db.collection('nonces').findOne({ address })
  if (!nonceDoc) return new NextResponse('Nonce not found', { status: 400 })
  if (!message.includes(nonceDoc.nonce)) return new NextResponse('Invalid nonce', { status: 400 })
  // TTL enforcement (defense-in-depth) 10 minutes
  const ageMs = Date.now() - new Date(nonceDoc.createdAtDt).getTime()
  if (ageMs > 10 * 60 * 1000) return new NextResponse('Nonce expired', { status: 400 })

  // Domain binding (optional if set)
  const expectedDomain = process.env.EXPECTED_SIGNIN_DOMAIN
  if (expectedDomain && !message.includes(expectedDomain)) {
    return new NextResponse('Domain mismatch', { status: 400 })
  }

  const ok = await verifyMessage({ address, message, signature })
  if (!ok) return new NextResponse('Bad signature', { status: 401 })

  const session = { address, chain: 'bnb' as const, createdAt: new Date().toISOString(), createdAtDt: new Date() }
  await db.collection('sessions').updateOne({ address, chain: 'bnb' }, { $set: session }, { upsert: true })
  await db.collection('nonces').deleteOne({ address })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', Buffer.from(JSON.stringify(session)).toString('base64'), {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  logJson('info', 'siwe_ok', { rid: req.headers.get('x-request-id'), ms: Date.now() - t0 })
  return res
}


