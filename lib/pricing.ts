export type PriorityLevel = 'standard' | 'priority' | 'premium'

export function getPricing() {
  const pStandard = Number(process.env.PRICING_STANDARD || 0)
  const pPriority = Number(process.env.PRICING_PRIORITY || 1)
  const pPremium = Number(process.env.PRICING_PREMIUM || 5)
  return {
    standard: pStandard,
    priority: pPriority,
    premium: pPremium,
  }
}

export function resolvePriorityByAmount(amount: number): PriorityLevel {
  const { premium, priority } = getPricing()
  if (amount >= premium) return 'premium'
  if (amount >= priority) return 'priority'
  return 'standard'
}


