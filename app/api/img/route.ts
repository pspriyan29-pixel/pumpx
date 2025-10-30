import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = (process.env.IMG_PROXY_WHITELIST || '').split(',').map((h) => h.trim()).filter(Boolean)
const DEFAULT_ALLOWED = ['i.imgur.com', 'images.unsplash.com', 'cdn.jsdelivr.net', 'raw.githubusercontent.com']
const HOST_WHITELIST = new Set([...(ALLOWED_HOSTS.length ? ALLOWED_HOSTS : DEFAULT_ALLOWED)])

const MAX_BYTES = 2 * 1024 * 1024 // 2MB
const FETCH_TIMEOUT_MS = 5000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || ''
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return new NextResponse('Invalid protocol', { status: 400 })
    if (!HOST_WHITELIST.has(parsed.host)) return new NextResponse('Host not allowed', { status: 400 })

    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(t)
    if (!res.ok) return new NextResponse('Upstream error', { status: 502 })

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const reader = res.body?.getReader()
    if (!reader) return new NextResponse('No body', { status: 502 })

    let received = 0
    const chunks: Uint8Array[] = []
    // Read with size limit
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        received += value.byteLength
        if (received > MAX_BYTES) return new NextResponse('Too large', { status: 413 })
        chunks.push(value)
      }
    }
    const buf = Buffer.concat(chunks)
    const resp = new NextResponse(buf, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      }
    })
    return resp
  } catch (e) {
    const msg = (e as any)?.name === 'AbortError' ? 'Timeout' : 'Bad URL'
    return new NextResponse(msg, { status: 400 })
  }
}


