import { describe, it, expect } from 'vitest'
import { GET as imgGet } from '../app/api/img/route'
import { NextRequest } from 'next/server'

function makeReq(url: string) {
  return new NextRequest(url)
}

describe('/api/img security', () => {
  it('rejects invalid protocol', async () => {
    const req = makeReq('http://localhost/api/img?url=ftp://example.com/x.png')
    const res = await imgGet(req as any)
    expect(res.status).toBe(400)
  })

  it('rejects non-whitelisted host', async () => {
    const req = makeReq('http://localhost/api/img?url=https://not-allowed.example.com/x.png')
    const res = await imgGet(req as any)
    expect([400, 502]).toContain(res.status)
  })
})
