import './globals.css'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ToastHost } from '@/components/Toast'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Pump All‑in‑One',
  description: 'Launch & Priority Listing platform for Solana and BNB',
}

const WalletConnect = dynamic(() => import('@/components/WalletConnect'), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-6xl p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Pump AIO</div>
            <div className="flex items-center gap-3">
              <Nav />
              <WalletConnect />
            </div>
          </div>
          {children}
          <footer className="mt-10 border-t border-zinc-800 pt-4 text-xs text-zinc-500 flex items-center gap-4">
            <Link href="/status" className="hover:underline">Status</Link>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms</a>
          </footer>
        </div>
        <ToastHost />
      </body>
    </html>
  )
}


