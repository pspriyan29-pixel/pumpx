export type DexChoice = 'raydium'

export function getDexConfig() {
  const choice: DexChoice = (process.env.DEX_CHOICE as DexChoice) || 'raydium'
  const quote = process.env.SOL_QUOTE || 'USDC'
  const usdcMint = process.env.SOL_USDC_MINT || 'EPjFWdd5AufqSSqeM2q9p4wQFg6u'
  return { choice, quote, usdcMint }
}


