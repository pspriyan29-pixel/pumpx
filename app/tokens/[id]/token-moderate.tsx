'use client'

import { useState } from 'react'

export default function AdminModerate({ id }: { id: string }) {
  const [featured, setFeatured] = useState(false)
  const [blacklisted, setBlacklisted] = useState(false)
  const [priorityLevel, setPriorityLevel] = useState<'standard'|'priority'|'premium'>('standard')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async () => {
    try {
      const token = localStorage.getItem('ADMIN_TOKEN') || ''
      const res = await fetch(`/api/tokens/${id}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ featured, blacklisted, priorityLevel })
      })
      if (!res.ok) throw new Error(await res.text())
      setMsg('Moderation saved'); setTimeout(() => setMsg(null), 1500)
    } catch (e: any) {
      setMsg(e.message ?? 'Failed')
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-3 space-y-2">
      <div className="text-xs text-zinc-500">Admin: Moderate Token</div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={blacklisted} onChange={(e) => setBlacklisted(e.target.checked)} /> Blacklist</label>
        <select value={priorityLevel} onChange={(e) => setPriorityLevel(e.target.value as any)} className="rounded-md border border-zinc-800 bg-zinc-900 p-1">
          <option value="standard">standard</option>
          <option value="priority">priority</option>
          <option value="premium">premium</option>
        </select>
        <button onClick={submit} className="rounded-md bg-white/10 px-3 py-1 hover:bg-white/15">Save</button>
      </div>
      {msg && <div className="text-xs text-zinc-400">{msg}</div>}
    </section>
  )
}


