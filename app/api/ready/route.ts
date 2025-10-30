import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSignerStatus, getSolanaPublicKeyBase58 } from '@/lib/signers'
import { getDexConfig } from '@/lib/dex'

export async function GET() {
  const checks: any = {
    env: {
      MONGODB_URI: Boolean(process.env.MONGODB_URI),
      MONGODB_DB: Boolean(process.env.MONGODB_DB),
      TREASURY_SOL_ADDRESS: Boolean(process.env.TREASURY_SOL_ADDRESS),
      TREASURY_BNB_ADDRESS: Boolean(process.env.TREASURY_BNB_ADDRESS),
      SOLANA_RPC_URL: Boolean(process.env.SOLANA_RPC_URL),
      BNB_RPC_URL: Boolean(process.env.BNB_RPC_URL),
      ADMIN_TOKEN: Boolean(process.env.ADMIN_TOKEN),
    },
    db: false,
    signers: undefined as any,
  }
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    checks.db = true
  } catch {
    checks.db = false
  }
  checks.signers = getSignerStatus()
  checks.signers.solana.pubkey = getSolanaPublicKeyBase58()
  const ok = checks.env.MONGODB_URI && checks.env.MONGODB_DB && checks.db
  const dex = getDexConfig()
  const onchain = { solanaEnabled: process.env.ENABLE_RAYDIUM_ONCHAIN === 'true' }
  return NextResponse.json({ ok, checks, dex, onchain })
}


