import { NextResponse } from 'next/server'
import { getSolanaPublicKeyBase58 } from '@/lib/signers'

export async function GET() {
  const pubkey = getSolanaPublicKeyBase58()
  return NextResponse.json({ pubkey, available: Boolean(pubkey) })
}


