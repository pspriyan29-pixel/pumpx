import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import nacl from 'tweetnacl'
import { logJson } from '@/lib/logger'

function base58Decode(b58: string): Uint8Array {
  // Lightweight base58 decode for Phantom signatures/public keys
  const ALPH = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const map = new Uint8Array(256); for (let i = 0; i < ALPH.length; i++) map[ALPH.charCodeAt(i)] = i
  const bytes = [0]
  for (let i = 0; i < b58.length; i++) {
    let carry = map[b58.charCodeAt(i)]
    for (let j = 0; j < bytes.length; j++) {
      const x = bytes[j] * 58 + carry
      bytes[j] = x & 0xff
      carry = x >> 8
    }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8 }
  }
  for (let k = 0; k < b58.length && b58[k] === '1'; k++) bytes.push(0)
  return new Uint8Array(bytes.reverse())
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const body = await req.json().catch(() => null)
  if (!body) return new NextResponse('Invalid payload', { status: 400 })
  const { address, signature, message } = body as { address: string; signature: string; message: string }
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

  try {
    const ok = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      base58Decode(signature),
      base58Decode(address)
    )
    if (!ok) return new NextResponse('Bad signature', { status: 401 })
  } catch {
    return new NextResponse('Verify error', { status: 400 })
  }

  const session = {
    address,
    chain: 'solana',
    createdAt: new Date().toISOString(),
    createdAtDt: new Date(),
  }
  await db.collection('sessions').updateOne({ address, chain: 'solana' }, { $set: session }, { upsert: true })
  await db.collection('nonces').deleteOne({ address })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', Buffer.from(JSON.stringify(session)).toString('base64'), {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  logJson('info', 'siws_ok', { rid: req.headers.get('x-request-id'), ms: Date.now() - t0 })
  return res
}


