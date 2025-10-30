import { Db, ObjectId } from 'mongodb'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { createMint, getMint } from '@solana/spl-token'
import { getSolanaKeypair } from './signers'
import * as Sentry from '@sentry/nextjs'

export type SolanaLaunchRequest = {
  _id: ObjectId
  tokenId: ObjectId
  chain: 'solana'
  mintAddress: string
  baseAmount: string
  quoteAmount: string
  status: 'queued' | 'processed' | 'failed'
}

export async function processSolanaLaunch(db: Db, lr: SolanaLaunchRequest, token: any): Promise<{ dexPairUrl: string, mintAddress: string }> {
  const signer: Keypair | null = getSolanaKeypair()
  const rpc = process.env.SOLANA_RPC_URL || ''
  const enabled = process.env.ENABLE_RAYDIUM_ONCHAIN === 'true'
  if (!signer || !rpc) {
    // Fallback placeholder when signer/rpc not configured
    const dexPairUrl = `https://dexscreener.com/solana/search?q=${encodeURIComponent(token.symbol)}`
    return { dexPairUrl, mintAddress: lr.mintAddress || '' }
  }

  try {
    const connection = new Connection(rpc, { commitment: 'confirmed' })
    // If mint already provided in request, skip creating new mint
    let mintPubkey: PublicKey
    if (lr.mintAddress && lr.mintAddress.length > 0) {
      mintPubkey = new PublicKey(lr.mintAddress)
    } else {
      // Minimal SPL mint creation (no initial supply here)
      const decimals = 9
      mintPubkey = await createMint(connection, signer, signer.publicKey, null, decimals)
      await db.collection('launchRequests').updateOne({ _id: lr._id }, { $set: { mintAddress: mintPubkey.toBase58() } })
      await db.collection('tokens').updateOne({ _id: token._id }, { $set: { mintAddress: mintPubkey.toBase58(), chain: 'solana' } })
    }
    const dexPairUrl = `https://dexscreener.com/solana/search?q=${encodeURIComponent(mintPubkey.toBase58())}`
    return { dexPairUrl, mintAddress: mintPubkey.toBase58() }
  } catch (e) {
    Sentry.captureException(e)
    // Mark failure is handled by caller; return placeholder
    const dexPairUrl = `https://dexscreener.com/solana/search?q=${encodeURIComponent(token.symbol)}`
    return { dexPairUrl, mintAddress: lr.mintAddress || '' }
  }
}


