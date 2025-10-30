import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getTreasury } from '@/lib/config'
import { verifySolanaTxToTreasury, verifyEvmTxToTreasury } from '@/lib/verify'
import { rateLimit } from '@/lib/ratelimit'
import { orderVerifyOnchainSchema } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'ip:' + (req as any).ip || 'unknown'
  const rl = rateLimit(`orders:verify:${ip}`)
  if (!rl.ok) return new NextResponse('Too Many Requests', { status: 429 })
  const body = await req.json().catch(() => null)
  const parsed = orderVerifyOnchainSchema.safeParse(body)
  if (!parsed.success) return new NextResponse('Invalid payload', { status: 400 })
  const { orderId, txHash } = parsed.data
  if (!ObjectId.isValid(orderId)) return new NextResponse('Invalid orderId', { status: 400 })

  const db = await getDb()
  const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) })
  if (!order) return new NextResponse('Order not found', { status: 404 })

  const treasury = getTreasury()
  let result: { ok: boolean; reason?: string; slotOrBlock?: number }
  if (order.chain === 'solana') {
    const rpc = process.env.SOLANA_RPC_URL || ''
    if (!rpc) return new NextResponse('Missing SOLANA_RPC_URL', { status: 500 })
    result = await verifySolanaTxToTreasury(txHash, treasury.solana, rpc)
  } else {
    const rpc = process.env.BNB_RPC_URL || ''
    if (!rpc) return new NextResponse('Missing BNB_RPC_URL', { status: 500 })
    result = await verifyEvmTxToTreasury(txHash, treasury.bnb, rpc)
  }

  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 })

  await db.collection('orders').updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { status: 'verified', verifiedAt: new Date().toISOString(), verifiedRef: result.slotOrBlock, txHash } }
  )

  return NextResponse.json({ ok: true })
}


