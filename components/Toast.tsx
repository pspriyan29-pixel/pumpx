'use client'

import { useEffect, useState } from 'react'

type ToastItem = { id: number; message: string; type?: 'success' | 'error' }

let nextId = 1

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('toast', { detail: { id: nextId++, message, type } }))
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ToastItem>
      const item = ce.detail
      setItems((prev) => [...prev, item])
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== item.id)), 2000)
    }
    window.addEventListener('toast', handler as any)
    return () => window.removeEventListener('toast', handler as any)
  }, [])
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-2">
      {items.map((t) => (
        <div key={t.id}
             className={`pointer-events-auto rounded-md border px-3 py-2 text-sm shadow ${t.type === 'error' ? 'border-red-900 bg-red-950 text-red-200' : 'border-accent/30 bg-accent/10 text-accent'}`}> 
          {t.message}
        </div>
      ))}
    </div>
  )
}


