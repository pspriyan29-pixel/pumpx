import { Connection, PublicKey } from '@solana/web3.js'
import { createPublicClient, http, Hex } from 'viem'
import { getSolanaRpcUrls, getBnbRpcUrls } from './rpc'

type VerifyResult = { ok: boolean; reason?: string; slotOrBlock?: number }

export async function verifySolanaTxToTreasury(txSig: string, treasury: string, rpcUrl?: string): Promise<VerifyResult> {
  try {
    const urls = rpcUrl ? [rpcUrl] : getSolanaRpcUrls()
    if (urls.length === 0) return { ok: false, reason: 'no_rpc' }
    let lastErr: any
    for (const url of urls) {
      try {
        const connection = new Connection(url, { commitment: 'confirmed' })
        const tx = await connection.getTransaction(txSig, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' })
        if (!tx) { lastErr = 'tx_not_found'; continue }
        if (tx.meta && tx.meta.err) return { ok: false, reason: 'tx_error' }
        const treasuryKey = new PublicKey(treasury).toBase58()
        const keys = tx.transaction.message.getAccountKeys().staticAccountKeys.map(k => k.toBase58())
        const includesTreasury = keys.includes(treasuryKey)
        if (!includesTreasury) return { ok: false, reason: 'treasury_not_in_accounts' }
        return { ok: true, slotOrBlock: tx.slot }
      } catch (e) { lastErr = e }
    }
    return { ok: false, reason: typeof lastErr === 'string' ? lastErr : 'exception' }
  } catch (e) {
    return { ok: false, reason: 'exception' }
  }
}

export async function verifyEvmTxToTreasury(txHash: string, treasury: string, rpcUrl?: string): Promise<VerifyResult> {
  try {
    const urls = rpcUrl ? [rpcUrl] : getBnbRpcUrls()
    if (urls.length === 0) return { ok: false, reason: 'no_rpc' }
    let lastErr: any
    for (const url of urls) {
      try {
        const client = createPublicClient({ transport: http(url) })
        const receipt = await client.getTransactionReceipt({ hash: txHash as Hex })
        if (!receipt || receipt.status !== 'success') { lastErr = 'tx_failed_or_not_found'; continue }
        const tx = await client.getTransaction({ hash: txHash as Hex })
        const to = tx.to?.toLowerCase()
        if (!to) return { ok: false, reason: 'no_to_address' }
        if (to !== treasury.toLowerCase()) return { ok: false, reason: 'to_not_treasury' }
        return { ok: true, slotOrBlock: Number(receipt.blockNumber) }
      } catch (e) { lastErr = e }
    }
    return { ok: false, reason: typeof lastErr === 'string' ? lastErr : 'exception' }
  } catch (e) {
    return { ok: false, reason: 'exception' }
  }
}


