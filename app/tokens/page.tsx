import { getDb } from '@/lib/db'
import Link from 'next/link'
import dynamic from 'next/dynamic'

type Token = {
  _id?: string
  name: string
  symbol: string
  chain: 'solana' | 'bnb'
  creator?: string | null
  description?: string
  logoUrl?: string
  createdAt: string
  priorityLevel?: 'standard' | 'priority' | 'premium'
  featured?: boolean
}

export default async function TokensPage() {
  let tokens: Token[] = []
  let loadError: string | null = null
  try {
    const db = await getDb()
    tokens = await db.collection<Token>('tokens')
      .find({}, { projection: { name: 1, symbol: 1, chain: 1, createdAt: 1, creator: 1, logoUrl: 1, featured: 1, priorityLevel: 1 } })
      .sort({ featured: -1, createdAt: -1 })
      .limit(50)
      .toArray()
  } catch (e: any) {
    loadError = 'Database tidak tersedia. Mohon setel MONGODB_URI & MONGODB_DB.'
  }

  const TokenSearch = dynamic(() => import('@/components/TokenSearch'), { ssr: false })

  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-semibold">Tokens</h2>
      {/** Client search/pagination */}
      <TokenSearch />
      {loadError && (
        <div className="rounded-md border border-red-900 bg-red-950 p-3 text-sm text-red-300">{loadError}</div>
      )}
      <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {tokens.map((t) => (
          <li key={(t as any)._id} className="p-4">
            <Link href={`/tokens/${(t as any)._id}`} className="flex items-center justify-between gap-4 hover:opacity-90">
              <div className="flex items-center gap-3">
                {t.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/img?url=${encodeURIComponent(t.logoUrl)}`} alt={t.symbol} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-800" />)
                }
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span>{t.name} <span className="text-zinc-400">({t.symbol})</span></span>
                    {t.priorityLevel && t.priorityLevel !== 'standard' && (
                      <span className={`text-[10px] uppercase rounded px-1.5 py-0.5 ${t.priorityLevel === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                        {t.priorityLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">Chain: {t.chain} {t.creator ? `· ${t.creator.slice(0,6)}…${t.creator.slice(-4)}` : ''} · {formatRelative(t.createdAt)}</div>
                </div>
              </div>
              <div className="text-xs text-zinc-500">{new Date(t.createdAt).toLocaleString()}</div>
            </Link>
          </li>
        ))}
        {tokens.length === 0 && (
          <li className="p-6 text-zinc-400 text-center">Belum ada token. Mulai dengan <Link className="underline" href="/create">Create Token</Link>.</li>
        )}
      </ul>
    </main>
  )
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}


