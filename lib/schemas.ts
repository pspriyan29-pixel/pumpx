import { z } from 'zod'

export const tokenCreateSchema = z.object({
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(16),
  chain: z.enum(['solana', 'bnb']).default('solana'),
  creator: z.string().optional(),
  description: z.string().max(500).optional().default(''),
  logoUrl: z.string().url().optional().or(z.literal('')).optional(),
})

export const orderCreateSchema = z.object({
  tokenId: z.string().min(1),
  chain: z.enum(['solana', 'bnb']),
  amount: z.number().nonnegative(),
  txHash: z.string().optional(),
  payer: z.string().optional(),
})

export const orderVerifyOnchainSchema = z.object({
  orderId: z.string().min(1),
  txHash: z.string().min(1),
})

export const launchSolanaSchema = z.object({
  tokenId: z.string().min(1),
  mintAddress: z.string().min(32),
  baseAmount: z.string().min(1),
  quoteAmount: z.string().min(1),
})

export const launchBnbSchema = z.object({
  tokenId: z.string().min(1),
  tokenAddress: z.string().min(42),
  baseAmount: z.string().min(1),
  quoteAmount: z.string().min(1),
})


