import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  mintAddress: z.string().min(32),
  baseAmount: z.string().min(1),
  quoteAmount: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new NextResponse('Invalid payload', { status: 400 })
  const { mintAddress, baseAmount, quoteAmount } = parsed.data
  const rpc = process.env.SOLANA_RPC_URL || ''
  const signerReady = Boolean(process.env.SOLANA_SIGNER_SECRET)
  const onchainEnabled = process.env.ENABLE_RAYDIUM_ONCHAIN === 'true'
  const quote = process.env.SOL_QUOTE || 'USDC'
  const usdcMint = process.env.SOL_USDC_MINT || ''
  return NextResponse.json({
    ok: true,
    params: { mintAddress, baseAmount, quoteAmount, quote, usdcMint },
    environment: { rpc: Boolean(rpc), signerReady, onchainEnabled },
    note: 'This is a preview only. No transaction is sent here.'
  })
}


