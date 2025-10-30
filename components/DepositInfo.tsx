'use client'

import { useEffect, useState } from 'react'
import CopyButton from './CopyButton'

type Treasury = { solana: string; bnb: string }

export default function DepositInfo() {
  const [treasury, setTreasury] = useState<Treasury | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => setTreasury(d.treasury))
      .catch(() => setTreasury({ solana: '', bnb: '' }))
  }, [])

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  if (!treasury) return null

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <div className="mb-2 text-lg font-semibold">Deposit Addresses</div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-zinc-400">Solana (SOL):</div>
          <div className="flex items-center gap-2">
            <code className="rounded bg-zinc-900 px-2 py-1">{treasury.solana}</code>
            <CopyButton text={treasury.solana} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-zinc-400">BNB (BSC):</div>
          <div className="flex items-center gap-2">
            <code className="rounded bg-zinc-900 px-2 py-1">{treasury.bnb}</code>
            <CopyButton text={treasury.bnb} />
          </div>
        </div>
      </div>
    </section>
  )
}


