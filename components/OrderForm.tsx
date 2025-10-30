'use client'

import { useState } from 'react'
import { showToast } from './Toast'

export default function OrderForm() {
  const [tokenId, setTokenId] = useState('')
  const [chain, setChain] = useState<'solana' | 'bnb'>('solana')
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [payer, setPayer] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const createRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, chain, amount: Number(amount), txHash, payer })
      })
      if (!createRes.ok) throw new Error(await createRes.text())
      const created = await createRes.json()

      // Fetch latest orders and take the most recent one (simplified)
      const listRes = await fetch(`/api/orders?tokenId=${encodeURIComponent(tokenId)}`)
      const orders = await listRes.json()
      const order = orders?.[0]

      if (order && txHash) {
        const verRes = await fetch('/api/orders/verify/onchain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: String(order._id), txHash })
        })
        if (!verRes.ok) throw new Error(await verRes.text())
      }

      setMessage('Order submitted and verification attempted. If eligible, you can request launch now.')
      showToast('Order submitted', 'success')
      setTxHash('')
      setAmount('')
    } catch (e: any) {
      setMessage(e.message ?? 'Failed')
      showToast(e.message ?? 'Failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <label className="block text-sm mb-1">Token ID</label>
        <input value={tokenId} onChange={(e) => setTokenId(e.target.value)}
               required className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1">Chain</label>
        <select value={chain} onChange={(e) => setChain(e.target.value as any)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none">
          <option value="solana">Solana</option>
          <option value="bnb">BNB</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Amount (SOL/BNB)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="any" required
               className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1">Tx Hash</label>
        <input value={txHash} onChange={(e) => setTxHash(e.target.value)}
               className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm mb-1">Payer Address (optional)</label>
        <input value={payer} onChange={(e) => setPayer(e.target.value)}
               className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <button disabled={loading} className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-50">
        {loading ? 'Submitting…' : 'Submit & Verify'}
      </button>
      {message && <div className="sm:col-span-2 text-sm text-zinc-400">{message}</div>}
    </form>
  )
}


