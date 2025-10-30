import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { logJson } from '@/lib/logger'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const body = await req.json().catch(() => null)
  if (!body || typeof body.address !== 'string') {
    logJson('warn', 'nonce_invalid_body', { rid: req.headers.get('x-request-id') })
    return new NextResponse('Invalid address', { status: 400 })
  }
  const address = body.address
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const db = await getDb()
  await db.collection('nonces').updateOne(
    { address },
    { $set: { address, nonce, createdAt: new Date().toISOString(), createdAtDt: new Date() } },
    { upsert: true }
  )
  const res = NextResponse.json({ nonce, message: `Sign in to Pump AIO. Nonce: ${nonce}` })
  logJson('info', 'nonce_ok', { rid: req.headers.get('x-request-id'), ms: Date.now() - t0, size: res.headers.get('content-length') })
  return res
}


