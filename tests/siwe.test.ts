import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as siwePost } from '@/app/api/auth/siwe/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => {
  return {
    getDb: async () => ({
      collection: (name: string) => {
        if (name === 'nonces') {
          return {
            findOne: vi.fn().mockImplementation(async ({ address }: any) => ({ address, nonce: 'NONCE', createdAtDt: new Date().toISOString() })),
            deleteOne: vi.fn().mockResolvedValue({})
          }
        }
        if (name === 'sessions') {
          return { updateOne: vi.fn().mockResolvedValue({}) }
        }
        return {}
      }
    })
  }
})

vi.mock('viem', async () => {
  return {
    verifyMessage: vi.fn().mockResolvedValue(true)
  }
})

function makePost(url: string, body: any) {
  return new NextRequest(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } as any })
}

describe('/api/auth/siwe', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects when nonce does not match', async () => {
    const body = { address: '0xabc', signature: '0xsig', message: 'Wrong message without nonce' }
    const res = await siwePost(makePost('http://localhost/api/auth/siwe', body) as any)
    expect(res.status).toBe(400)
  })

  it('succeeds with valid nonce and signature', async () => {
    const body = { address: '0xabc', signature: '0xsig', message: 'Sign me. Nonce: NONCE' }
    const res = await siwePost(makePost('http://localhost/api/auth/siwe', body) as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.ok).toBe(true)
  })
})


