'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [queue, setQueue] = useState<any[] | null>(null)

  const call = async (path: string, opts?: RequestInit) => {
    try {
      setMsg(null)
      const token = localStorage.getItem('ADMIN_TOKEN') || ''
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'x-admin-token': token, ...(opts?.headers || {}) },
        ...(opts || {}),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json().catch(() => ({}))
      return data
    } catch (e: any) {
      setMsg(e.message ?? 'Failed')
      throw e
    }
  }

  const issue = async () => {
    const data = await call('/api/admin/issue-token')
    if (data?.token) {
      setJwt(data.token)
      setMsg('JWT issued. Saved to localStorage as ADMIN_BEARER.')
      localStorage.setItem('ADMIN_BEARER', data.token)
    }
  }

  const initIdx = async () => {
    await call('/api/admin/init-indexes')
    setMsg('Indexes initialized')
  }

  const processLaunch = async () => {
    const bearer = localStorage.getItem('ADMIN_BEARER') || ''
    const res = await fetch('/api/launch/process', {
      method: 'POST',
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
    })
    if (!res.ok) setMsg(await res.text())
    else setMsg('Launch queue processed')
  }

  const loadQueue = async () => {
    const bearer = localStorage.getItem('ADMIN_BEARER') || ''
    const res = await fetch('/api/launch/queue', {
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
    })
    if (!res.ok) { setMsg(await res.text()); return }
    setQueue(await res.json())
  }

  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin</h2>
      <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
        <div className="text-sm text-zinc-300">Admin secrets</div>
        <div className="text-xs text-zinc-500">Set `ADMIN_TOKEN` in localStorage (DevTools) to use header-based admin, atau keluarkan JWT dan gunakan Bearer untuk endpoint admin.</div>
        <div className="flex items-center gap-2">
          <button onClick={issue} className="rounded-md bg-white/10 px-3 py-2 hover:bg-white/15">Issue JWT</button>
          <button onClick={initIdx} className="rounded-md bg-white/10 px-3 py-2 hover:bg-white/15">Init Indexes</button>
          <button onClick={processLaunch} className="rounded-md bg-white/10 px-3 py-2 hover:bg-white/15">Process Launch Queue</button>
          <button onClick={loadQueue} className="rounded-md bg-white/10 px-3 py-2 hover:bg-white/15">List Queue</button>
        </div>
        {jwt && (
          <div className="text-xs break-all text-zinc-400">JWT: {jwt}</div>
        )}
        {msg && <div className="text-xs text-zinc-400">{msg}</div>}
      </div>
      {queue && (
        <div className="rounded-lg border border-zinc-800 p-4 space-y-2">
          <div className="text-sm text-zinc-300">Launch Queue</div>
          <pre className="text-xs overflow-auto text-zinc-400">{JSON.stringify(queue, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}


