'use client'

import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

export default function CreateTokenPage() {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [chain, setChain] = useState<'solana' | 'bnb'>('solana')
  const [creator, setCreator] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, symbol, chain, creator, description, logoUrl })
      })
      if (!res.ok) throw new Error(await res.text())
      setMessage('Token created')
      showToast('Token created', 'success')
      setName('')
      setSymbol('')
      setDescription('')
      setLogoUrl('')
    } catch (err: any) {
      setMessage(err.message ?? 'Failed')
      showToast(err.message ?? 'Failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try detect wallets to set creator hint only; actual connect is in header
    const eth = (window as any).ethereum
    const sol = (window as any).solana
    const load = async () => {
      try {
        if (chain === 'bnb' && eth) {
          const accounts = await eth.request({ method: 'eth_accounts' })
          if (accounts?.[0]) setCreator(accounts[0])
        } else if (chain === 'solana' && sol?.isPhantom) {
          const resp = await sol.connect({ onlyIfTrusted: true })
          if (resp?.publicKey) setCreator(resp.publicKey.toString())
        }
      } catch {}
    }
    load()
  }, [chain])

  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-semibold">Create Token</h2>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
                 className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Symbol</label>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)}
                 className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" rows={3} />
        </div>
        <div>
          <label className="block text-sm mb-1">Logo URL (optional)</label>
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                 className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1">Chain</label>
          <select value={chain} onChange={(e) => setChain(e.target.value as any)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none">
            <option value="solana">Solana</option>
            <option value="bnb">BNB Chain</option>
          </select>
        </div>
        <div className="text-xs text-zinc-500">Creator: {creator ? creator : 'connect wallet in header'}</div>
        <button disabled={loading} className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-50">
          {loading ? 'Creating…' : 'Create'}
        </button>
        {message && <div className="text-sm text-zinc-400">{message}</div>}
      </form>
    </main>
  )
}


