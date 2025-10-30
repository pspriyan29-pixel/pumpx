'use client'

type Props = {
  chain: 'solana' | 'bnb'
  symbol: string
  pairUrl?: string | null
}

export default function DexscreenerEmbed({ chain, symbol, pairUrl }: Props) {
  // Prefer exact pair URL if present, else use search
  const url = pairUrl && pairUrl.length > 0
    ? pairUrl
    : `https://dexscreener.com/search?q=${encodeURIComponent(symbol)}`
  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <iframe
        src={url}
        className="w-full h-[600px]"
        title={`Dexscreener ${chain} ${symbol}`}
        allow="clipboard-write; clipboard-read"
      />
    </div>
  )
}


