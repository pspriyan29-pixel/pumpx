'use client'

import { useState } from 'react'

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }
  return (
    <button onClick={onCopy}
            className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-accent/50">
      {copied ? 'Copied' : label}
    </button>
  )
}


