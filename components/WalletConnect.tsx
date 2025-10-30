'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    solana?: any
    ethereum?: any
  }
}

type Chain = 'solana' | 'bnb'

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null)
  const [chain, setChain] = useState<Chain | null>(null)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    // Try eager connect Phantom
    const eager = async () => {
      // Load session state
      try {
        const me = await fetch('/api/auth/me').then((r) => r.json())
        if (me?.session?.address) setSignedIn(true)
      } catch {}
      if (window.solana?.isPhantom) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true })
          if (resp?.publicKey) {
            setAddress(resp.publicKey.toString())
            setChain('solana')
          }
        } catch {}
      }
    }
    eager()
  }, [])

  const connectPhantom = async () => {
    if (!window.solana?.isPhantom) {
      window.open('https://phantom.app/', '_blank')
      return
    }
    const resp = await window.solana.connect()
    setAddress(resp.publicKey.toString())
    setChain('solana')
  }

  const signInSolana = async () => {
    if (!window.solana?.isPhantom || !address) return
    const nonceRes = await fetch('/api/auth/nonce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address }) })
    if (!nonceRes.ok) return
    const { message } = await nonceRes.json()
    const signed = await window.solana.signMessage(new TextEncoder().encode(message), 'utf8')
    const toBase64 = (bytes: Uint8Array) => {
      let binary = ''
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null as unknown as any, Array.from(bytes.slice(i, i + chunk)) as any)
      }
      return btoa(binary)
    }
    const sigBase58 = signed?.signature ? toBase64(signed.signature) : signed
    const res = await fetch('/api/auth/siws', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, signature: sigBase58, message }) })
    if (res.ok) setSignedIn(true)
  }

  const connectMetaMask = async () => {
    const eth = window.ethereum
    if (!eth) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    const accounts = await eth.request({ method: 'eth_requestAccounts' })
    if (accounts && accounts[0]) {
      setAddress(accounts[0])
      setChain('bnb')
    }
  }

  const signInBnb = async () => {
    const eth = window.ethereum
    if (!eth || !address) return
    const nonceRes = await fetch('/api/auth/nonce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address }) })
    if (!nonceRes.ok) return
    const { message } = await nonceRes.json()
    const signature = await eth.request({ method: 'personal_sign', params: [message, address] })
    const res = await fetch('/api/auth/siwe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, signature, message }) })
    if (res.ok) setSignedIn(true)
  }

  const disconnect = () => {
    setAddress(null)
    setChain(null)
    setSignedIn(false)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setSignedIn(false)
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <>
          <span className="text-xs text-zinc-400 hidden sm:inline">{chain?.toUpperCase()}</span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          {chain === 'solana' && !signedIn && (
            <button onClick={signInSolana} className="text-xs text-zinc-300 underline">Sign in</button>
          )}
          {chain === 'bnb' && !signedIn && (
            <button onClick={signInBnb} className="text-xs text-zinc-300 underline">Sign in</button>
          )}
          {signedIn && (
            <button onClick={logout} className="text-xs text-zinc-300 underline">Logout</button>
          )}
          <button onClick={disconnect} className="text-xs text-zinc-300 underline">
            Disconnect
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={connectPhantom} className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/15">
            Connect Phantom
          </button>
          <button onClick={connectMetaMask} className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/15">
            Connect MetaMask
          </button>
        </div>
      )}
    </div>
  )
}


