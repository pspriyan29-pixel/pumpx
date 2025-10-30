import { Keypair } from '@solana/web3.js'

export type SignerStatus = {
  solana: { available: boolean }
  bnb: { available: boolean }
}

export function getSignerStatus(): SignerStatus {
  return {
    solana: { available: Boolean(process.env.SOLANA_SIGNER_SECRET) },
    bnb: { available: Boolean(process.env.BNB_SIGNER_SECRET) },
  }
}

export function getSolanaKeypair(): Keypair | null {
  const secret = process.env.SOLANA_SIGNER_SECRET
  if (!secret) return null
  try {
    // Accept comma-separated numeric array or base58 string
    if (/^[0-9,\s]+$/.test(secret)) {
      const arr = secret.split(',').map((x) => Number(x.trim()))
      return Keypair.fromSecretKey(Uint8Array.from(arr))
    }
    // Base58 not decoded here to avoid heavy deps; recommend numeric array format
    return null
  } catch {
    return null
  }
}

export function hasBnbSigner(): boolean {
  return Boolean(process.env.BNB_SIGNER_SECRET)
}

export function getSolanaPublicKeyBase58(): string | null {
  const kp = getSolanaKeypair()
  return kp ? kp.publicKey.toBase58() : null
}


