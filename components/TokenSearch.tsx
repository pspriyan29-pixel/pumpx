'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SkeletonCircle, SkeletonLine } from './Skeleton'

type Item = { _id: string; name: string; symbol: string; chain: 'solana' | 'bnb'; logoUrl?: string; priorityLevel?: string; featured?: boolean; createdAt: string; creator?: string }

export default function TokenSearch() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ items: Item[]; total: number; page: number; limit: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tokens/search?q=${encodeURIComponent(q)}&page=${page}&limit=20`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [q, page])

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => { setPage(1); setQ(e.target.value) }} placeholder="Search by name or symbol"
               className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      {loading && !data && (
        <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="p-3 flex items-center gap-3">
              <SkeletonCircle className="h-8 w-8" />
              <div className="flex-1 space-y-2">
                <SkeletonLine className="h-3 w-1/3" />
                <SkeletonLine className="h-2 w-1/4" />
              </div>
              <SkeletonLine className="h-2 w-24" />
            </li>
          ))}
        </ul>
      )}
      {data && (
        <>
          <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            {data.items.map((t: any) => (
              <li key={t._id} className="p-3">
                <Link href={`/tokens/${t._id}`} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {t.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.logoUrl} alt={t.symbol} className="h-8 w-8 rounded-full object-cover" />
                    ) : <div className="h-8 w-8 rounded-full bg-zinc-800" />}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span>{t.name} <span className="text-zinc-400">({t.symbol})</span></span>
                        {t.priorityLevel && t.priorityLevel !== 'standard' && (
                          <span className={`text-[10px] uppercase rounded px-1.5 py-0.5 ${t.priorityLevel === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                            {t.priorityLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">Chain: {t.chain} {t.creator ? `· ${t.creator.slice(0,6)}…${t.creator.slice(-4)}` : ''}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">{new Date(t.createdAt).toLocaleString()}</div>
                </Link>
              </li>
            ))}
            {data.items.length === 0 && <li className="p-3 text-zinc-500">No results</li>}
          </ul>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total: {data.total}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-md bg-white/10 px-2 py-1 disabled:opacity-50">Prev</button>
              <span>Page {page}</span>
              <button disabled={(data.page * data.limit) >= data.total} onClick={() => setPage((p) => p + 1)}
                      className="rounded-md bg-white/10 px-2 py-1 disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}


