export function getSolanaRpcUrls(): string[] {
  const multi = process.env.SOLANA_RPC_URLS
  if (multi) return multi.split(',').map(s => s.trim()).filter(Boolean)
  const single = process.env.SOLANA_RPC_URL
  return single ? [single] : []
}

export function getBnbRpcUrls(): string[] {
  const multi = process.env.BNB_RPC_URLS
  if (multi) return multi.split(',').map(s => s.trim()).filter(Boolean)
  const single = process.env.BNB_RPC_URL
  return single ? [single] : []
}

export async function fetchWithRetry(url: string, init?: RequestInit, attempts = 3, baseDelayMs = 250): Promise<Response> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 7000)
      const res = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(t)
      if (res.ok) return res
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastErr = e
    }
    await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, i)))
  }
  throw lastErr
}


