import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as siwsPost } from '@/app/api/auth/siws/route'
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

vi.mock('tweetnacl', async () => {
  return {
    default: {
      sign: {
        detached: {
          verify: vi.fn().mockReturnValue(true)
        }
      }
    }
  }
})

function makePost(url: string, body: any) {
  return new NextRequest(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } as any })
}

describe('/api/auth/siws', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects when nonce does not match', async () => {
    const body = { address: 'Base58PubKey', signature: 'Base58Sig', message: 'Wrong message without nonce' }
    const res = await siwsPost(makePost('http://localhost/api/auth/siws', body) as any)
    expect(res.status).toBe(400)
  })

  it('succeeds with valid nonce and signature', async () => {
    const body = { address: '11111111111111111111111111111111', signature: '2', message: 'Sign me. Nonce: NONCE' }
    const res = await siwsPost(makePost('http://localhost/api/auth/siws', body) as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.ok).toBe(true)
  })
})


