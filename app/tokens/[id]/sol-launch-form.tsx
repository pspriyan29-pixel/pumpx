'use client'

import { useState } from 'react'

export default function SolLaunchForm({ tokenId }: { tokenId: string }) {
  const [mintAddress, setMintAddress] = useState('')
  const [baseAmount, setBaseAmount] = useState('')
  const [quoteAmount, setQuoteAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/launch/solana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, mintAddress, baseAmount, quoteAmount })
      })
      if (!res.ok) throw new Error(await res.text())
      setMsg('Launch request queued. Admin/worker will process on-chain.')
      setBaseAmount(''); setQuoteAmount('')
    } catch (e: any) {
      setMsg(e.message ?? 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-4 space-y-2">
      <div className="text-sm font-medium">Launch to DEX (Solana) — LP Params</div>
      <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1">Token Mint Address</label>
          <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} required
                 className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
        </div>
        <div>
          <label className="block text-xs mb-1">Base amount (your token)</label>
          <input value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} required
                 className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
        </div>
        <div>
          <label className="block text-xs mb-1">Quote amount (SOL/USDC)</label>
          <input value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} required
                 className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
        </div>
        <button disabled={loading} className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-50 sm:col-span-2">
          {loading ? 'Submitting…' : 'Queue Launch Request'}
        </button>
        {msg && <div className="sm:col-span-2 text-xs text-zinc-400">{msg}</div>}
      </form>
    </section>
  )
}


