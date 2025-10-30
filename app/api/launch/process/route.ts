import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { processSolanaLaunch } from '@/lib/solanaLaunch'
import { getSignerStatus } from '@/lib/signers'
import { isAdminAuthorized } from '@/lib/adminAuth'

// Simple admin-protected processor: marks queued launchRequests as processed and sets a placeholder dexPairUrl
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req as any)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const db = await getDb()
  const queued = await db.collection('launchRequests').find({ status: 'queued' }).limit(10).toArray()
  const signer = getSignerStatus()
  const hasSolana = signer.solana.available && Boolean(process.env.SOLANA_RPC_URL)
  const hasBnb = signer.bnb.available && Boolean(process.env.BNB_RPC_URL)
  for (const lr of queued) {
    const token = await db.collection('tokens').findOne({ _id: new ObjectId(lr.tokenId) })
    if (!token) {
      await db.collection('launchRequests').updateOne({ _id: lr._id }, { $set: { status: 'failed', reason: 'token_missing' } })
      continue
    }
    try {
      let pairUrl: string
      let mintAddress: string | undefined
      if (token.chain === 'solana') {
        if (!hasSolana) throw new Error('solana_signer_or_rpc_missing')
        const { dexPairUrl, mintAddress: mint } = await processSolanaLaunch(db, lr as any, token)
        pairUrl = dexPairUrl
        mintAddress = mint
      } else {
        if (!hasBnb) throw new Error('bnb_signer_or_rpc_missing')
        // TODO: implement real BNB LP create; until then, block
        throw new Error('bnb_launch_not_implemented')
      }
      await db.collection('tokens').updateOne({ _id: token._id }, { $set: { dexPairUrl: pairUrl, mintAddress } })
      await db.collection('launchRequests').updateOne({ _id: lr._id }, { $set: { status: 'processed', processedAt: new Date().toISOString(), dexPairUrl: pairUrl, mintAddress } })
    } catch (e: any) {
      await db.collection('launchRequests').updateOne({ _id: lr._id }, { $set: { status: 'failed', reason: e?.message ?? 'error' } })
    }
  }
  return NextResponse.json({ ok: true, processed: queued.length })
}


