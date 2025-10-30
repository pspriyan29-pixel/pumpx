type Bucket = { tokens: number; updatedAt: number }

const buckets = new Map<string, Bucket>()

const WINDOW_MS = Number(process.env.RL_WINDOW_MS || 10_000) // 10s
const MAX_TOKENS = Number(process.env.RL_MAX_TOKENS || 20)

export function rateLimit(key: string): { ok: boolean; remaining: number } {
  const now = Date.now()
  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, updatedAt: now }
    buckets.set(key, bucket)
  }
  const elapsed = now - bucket.updatedAt
  const refill = Math.floor(elapsed / WINDOW_MS) * MAX_TOKENS
  if (refill > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill)
    bucket.updatedAt = now
  }
  if (bucket.tokens <= 0) {
    return { ok: false, remaining: 0 }
  }
  bucket.tokens -= 1
  return { ok: true, remaining: bucket.tokens }
}


