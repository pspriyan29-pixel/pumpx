import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('rateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('limits after MAX_TOKENS', async () => {
    process.env.RL_WINDOW_MS = '100000'
    process.env.RL_MAX_TOKENS = '3'
    const { rateLimit } = await import('@/lib/ratelimit')
    const key = 'test:key'
    expect(rateLimit(key).ok).toBe(true)
    expect(rateLimit(key).ok).toBe(true)
    expect(rateLimit(key).ok).toBe(true)
    expect(rateLimit(key).ok).toBe(false)
  })
})


