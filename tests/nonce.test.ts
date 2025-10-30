import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as noncePost } from '@/app/api/auth/nonce/route'
import { NextRequest } from 'next/server'

function makePost(url: string, body: any) {
  return new NextRequest(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } as any })
}

vi.mock('@/lib/db', () => {
  return {
    getDb: async () => ({
      collection: () => ({
        updateOne: vi.fn().mockResolvedValue({})
      })
    })
  }
})

describe('/api/auth/nonce', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects missing address', async () => {
    const req = makePost('http://localhost/api/auth/nonce', {})
    const res = await noncePost(req as any)
    expect(res.status).toBe(400)
  })

  it('returns nonce for valid address', async () => {
    const req = makePost('http://localhost/api/auth/nonce', { address: '0xabc' })
    const res = await noncePost(req as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.nonce).toBeTruthy()
    expect(typeof json.message).toBe('string')
  })
})
