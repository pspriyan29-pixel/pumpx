'use client'

import { useEffect, useState } from 'react'

export default function TokenActivity({ tokenId }: { tokenId: string }) {
  const [data, setData] = useState<{ orders: any[]; launches: any[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/tokens/${tokenId}/activity`).then(async (r) => {
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    }).then(setData).catch((e) => setError(e.message))
  }, [tokenId])

  if (error) return <div className="text-sm text-red-400">{error}</div>
  if (!data) return <div className="text-sm text-zinc-400">Loading activity…</div>

  return (
    <section className="rounded-lg border border-zinc-800 p-4 space-y-3">
      <div className="font-semibold">Activity</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-zinc-400 mb-1">Payments</div>
          <ul className="text-xs divide-y divide-zinc-800 rounded border border-zinc-800">
            {data.orders.map((o) => (
              <li key={String(o._id)} className="p-2 flex items-center justify-between">
                <span>{o.priority?.toUpperCase?.() || 'STANDARD'} · {o.amount} {o.chain === 'solana' ? 'SOL' : 'BNB'}</span>
                <span className="text-zinc-500">{new Date(o.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {data.orders.length === 0 && <li className="p-2 text-zinc-500">No payments</li>}
          </ul>
        </div>
        <div>
          <div className="text-sm text-zinc-400 mb-1">Launch Requests</div>
          <ul className="text-xs divide-y divide-zinc-800 rounded border border-zinc-800">
            {data.launches.map((l) => (
              <li key={String(l._id)} className="p-2 flex items-center justify-between">
                <span>{l.chain.toUpperCase()} · {l.status.toUpperCase()}</span>
                <span className="text-zinc-500">{new Date(l.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {data.launches.length === 0 && <li className="p-2 text-zinc-500">No launch requests</li>}
          </ul>
        </div>
      </div>
    </section>
  )
}


