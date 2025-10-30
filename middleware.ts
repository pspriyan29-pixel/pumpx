import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logJson } from '@/lib/logger'

function getRpcHostsFromEnv(): string[] {
  const urls = [process.env.SOLANA_RPC_URL, process.env.BNB_RPC_URL]
    .concat((process.env.SOLANA_RPC_URLS || '').split(',').filter(Boolean))
    .concat((process.env.BNB_RPC_URLS || '').split(',').filter(Boolean))
    .filter(Boolean) as string[]
  const hosts = new Set<string>()
  for (const u of urls) {
    try { hosts.add(new URL(u).origin) } catch {}
  }
  return Array.from(hosts)
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security headers (basic)
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-DNS-Prefetch-Control', 'on')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Embedder-Policy', 'credentialless')

  // Request ID
  const rid = req.headers.get('x-request-id') || Math.random().toString(36).slice(2) + Date.now().toString(36)
  res.headers.set('x-request-id', rid)

  // Content-Security-Policy
  const self = "'self'"
  const rpcOrigins = getRpcHostsFromEnv()
  const defaultProviders = ['https://api.mainnet-beta.solana.com', 'https://rpc.helius.xyz', 'https://bsc-dataseed.binance.org']
  const connectList = Array.from(new Set([self, 'https:', ...rpcOrigins, ...defaultProviders])).join(' ')
  const csp = [
    `default-src ${self}`,
    `script-src ${self} 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net`,
    `style-src ${self} 'unsafe-inline'`,
    `img-src ${self} data: blob: https:`,
    `font-src ${self} data:`,
    `connect-src ${connectList}`,
    `frame-src ${self}`,
    `object-src 'none'`,
    `base-uri ${self}`,
    `form-action ${self}`,
    `upgrade-insecure-requests`,
  ].join('; ')
  res.headers.set('Content-Security-Policy', csp)

  if (process.env.NODE_ENV !== 'production') {
    logJson('info', 'request', { method: req.method, path: req.nextUrl.pathname, rid })
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


