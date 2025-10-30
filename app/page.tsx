import Link from 'next/link'
import dynamic from 'next/dynamic'
import CopyButton from '@/components/CopyButton'

const DepositInfo = dynamic(() => import('@/components/DepositInfo'), { ssr: false })

export default async function HomePage() {
  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Pump All‑in‑One — Launch & Priority Listing</h1>
        <p className="text-zinc-300 max-w-3xl">Platform untuk pembuatan token, listing prioritas, dan verifikasi pembayaran sederhana. Terintegrasi Solana & BNB dengan arsitektur siap produksi.</p>
        <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
          <span className="rounded border border-zinc-800 px-2 py-1">MongoDB</span>
          <span className="rounded border border-zinc-800 px-2 py-1">Next.js App Router</span>
          <span className="rounded border border-zinc-800 px-2 py-1">Wallet SIWE/SIWS</span>
          <span className="rounded border border-zinc-800 px-2 py-1">Rate Limit & CSP</span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/tokens" className="rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900">
          <div className="text-lg font-semibold">Browse Tokens</div>
          <div className="text-zinc-400">View the list of created tokens.
          </div>
        </Link>

        <Link href="/create" className="rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900">
          <div className="text-lg font-semibold">Create Token</div>
          <div className="text-zinc-400">Start a new token launch.
          </div>
        </Link>

        <Link href="/launch" className="rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900">
          <div className="text-lg font-semibold">Priority Listing</div>
          <div className="text-zinc-400">Pay and submit proof to boost ranking.</div>
        </Link>

        <Link href="/status" className="rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900">
          <div className="text-lg font-semibold">System Status</div>
          <div className="text-zinc-400">Check readiness, DB, RPC, and signers.</div>
        </Link>
      </section>

      <DepositInfo />

      <section className="rounded-lg border border-zinc-800 p-4">
        <div className="font-semibold mb-2">Alamat Resmi Deposit/Withdrawal</div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md bg-zinc-900 p-3">
            <div className="text-zinc-400 text-xs mb-1">BNB (BSC)</div>
            <div className="flex items-center gap-2">
              <code className="break-all">0x10400B3d6cDf3C43688a341e732C2017A47014C5</code>
              <CopyButton text="0x10400B3d6cDf3C43688a341e732C2017A47014C5" />
            </div>
          </div>
          <div className="rounded-md bg-zinc-900 p-3">
            <div className="text-zinc-400 text-xs mb-1">Catatan</div>
            <div className="text-zinc-300 text-sm">Gunakan alamat di atas untuk deposit maupun withdrawal BNB. Pastikan jaringan BSC saat mengirim.</div>
          </div>
        </div>
      </section>
    </main>
  )
}


