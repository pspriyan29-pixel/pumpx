import { getPricing } from '@/lib/pricing'
import dynamic from 'next/dynamic'
import { getTreasury } from '@/lib/config'

export default async function LaunchPage() {
  const pricing = getPricing()
  const treasury = getTreasury()
  const DepositInfo = dynamic(() => import('@/components/DepositInfo'), { ssr: false })
  const OrderForm = dynamic(() => import('@/components/OrderForm'), { ssr: false })
  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Launch & Priority Listing</h1>
        <p className="text-zinc-300">Bayar lebih untuk prioritas tampil di daftar dan sorotan seperti pasar besar.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="font-semibold">Standard</div>
          <div className="text-2xl">{pricing.standard} <span className="text-sm">SOL/BNB</span></div>
          <ul className="mt-2 text-sm text-zinc-400 list-disc pl-5">
            <li>Listing biasa</li>
          </ul>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="font-semibold">Priority</div>
          <div className="text-2xl">{pricing.priority} <span className="text-sm">SOL/BNB</span></div>
          <ul className="mt-2 text-sm text-zinc-400 list-disc pl-5">
            <li>Badge PRIORITY, tampil lebih atas</li>
          </ul>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="font-semibold">Premium</div>
          <div className="text-2xl">{pricing.premium} <span className="text-sm">SOL/BNB</span></div>
          <ul className="mt-2 text-sm text-zinc-400 list-disc pl-5">
            <li>Badge PREMIUM, top of list</li>
          </ul>
        </div>
      </section>

      <DepositInfo />

      <section className="rounded-lg border border-zinc-800 p-4 space-y-3">
        <div className="font-semibold">Submit Payment Proof</div>
        <p className="text-sm text-zinc-400">Setelah transfer ke alamat di atas, kirim bukti untuk token Anda agar sistem menetapkan prioritas.</p>
        <div className="text-xs text-zinc-500">Send to Solana: {treasury.solana} · BNB: {treasury.bnb}</div>
        <OrderForm />
      </section>
    </main>
  )
}

function SubmitForm({ treasurySol, treasuryBnb }: { treasurySol: string; treasuryBnb: string }) {
  return (
    <form action="/api/orders" method="post" className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="__noop" value="1" />
      <div className="sm:col-span-1">
        <label className="block text-sm mb-1">Token ID</label>
        <input name="tokenId" required className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1">Chain</label>
        <select name="chain" className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none">
          <option value="solana">Solana</option>
          <option value="bnb">BNB</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Amount (SOL/BNB)</label>
        <input name="amount" type="number" step="any" required className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div>
        <label className="block text-sm mb-1">Tx Hash (optional)</label>
        <input name="txHash" className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm mb-1">Payer Address (optional)</label>
        <input name="payer" className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
      </div>
      <div className="sm:col-span-2 text-xs text-zinc-500">Send to Solana: {treasurySol} · BNB: {treasuryBnb}</div>
      <button formAction="#" onClick={(e) => e.preventDefault()} className="rounded-md bg-white/10 px-4 py-2 cursor-not-allowed opacity-60">Use the API via fetch in UI</button>
    </form>
  )
}


