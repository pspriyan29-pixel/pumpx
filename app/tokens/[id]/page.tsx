import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'
import dynamic from 'next/dynamic'
import Link from 'next/link'

export default async function TokenDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  if (!ObjectId.isValid(id)) {
    return (
      <main className="space-y-6">
        <div className="text-zinc-400">Invalid token id.</div>
      </main>
    )
  }
  const db = await getDb()
  const token = await db.collection('tokens').findOne({ _id: new ObjectId(id) })
  if (!token) {
    return (
      <main className="space-y-6">
        <div className="text-zinc-400">Token not found.</div>
      </main>
    )
  }
  const DexscreenerEmbed = dynamic(() => import('@/components/DexscreenerEmbed'), { ssr: false })
  const DepositInfo = dynamic(() => import('@/components/DepositInfo'), { ssr: false })
  const TokenActivity = dynamic(() => import('@/components/TokenActivity'), { ssr: false })
  const AdminModerate = dynamic(() => import('./token-moderate'), { ssr: false })
  const SolLaunchForm = dynamic(() => import('./sol-launch-form'), { ssr: false })
  const BnbLaunchForm = dynamic(() => import('./bnb-launch-form'), { ssr: false })

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{token.name} <span className="text-zinc-400">({token.symbol})</span></h2>
          <div className="text-xs text-zinc-500">Chain: {token.chain} {token.creator ? `· ${String(token.creator).slice(0,6)}…${String(token.creator).slice(-4)}` : ''}</div>
        </div>
        <Link href="/tokens" className="text-sm text-zinc-300 underline">Back</Link>
      </div>

      {token.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/img?url=${encodeURIComponent(String(token.logoUrl))}`} alt={String(token.symbol)} className="h-16 w-16 rounded-md object-cover" />
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="text-lg font-semibold">Overview</div>
          <div className="text-sm text-zinc-300 whitespace-pre-wrap">{String(token.description || '') || 'No description.'}</div>
          <DepositInfo />
          <AdminPairSetter id={id} />
          <AdminModerate id={id} />
          {String(token.chain) === 'solana' && <SolLaunchForm tokenId={id} />}
          {String(token.chain) === 'bnb' && <BnbLaunchForm tokenId={id} />}
        </div>
        <div>
          <DexscreenerEmbed chain={token.chain} symbol={String(token.symbol)} pairUrl={String((token as any).dexPairUrl || '')} />
        </div>
      </div>

      <LaunchAction tokenId={id} priority={String((token as any).priorityLevel || 'standard')} />
      <TokenActivity tokenId={id} />
    </main>
  )
}

function LaunchAction({ tokenId, priority }: { tokenId: string; priority: string }) {
  const isEligible = priority === 'priority' || priority === 'premium'
  return (
    <div className="rounded-lg border border-zinc-800 p-4 flex items-center justify-between">
      <div className="text-sm text-zinc-300">Launch to DEX</div>
      <button
        disabled={!isEligible}
        onClick={async () => {
          try {
            const res = await fetch('/api/launch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tokenId })
            })
            if (!res.ok) throw new Error(await res.text())
            location.reload()
          } catch (e) {
            alert((e as Error).message)
          }
        }}
        className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/15 disabled:opacity-50"
      >
        {isEligible ? 'Request Launch' : 'Priority required'}
      </button>
    </div>
  )
}

function AdminPairSetter({ id }: { id: string }) {
  // Simple client-only admin setter via localStorage token
  // eslint-disable-next-line @next/next/no-async-client-component
  const AdminInner = dynamic(async () => {
    return function Inner() {
      const [url, setUrl] = (require('react') as typeof import('react')).useState('')
      const [msg, setMsg] = (require('react') as typeof import('react')).useState<string | null>(null)
      const submit = async () => {
        try {
          const token = localStorage.getItem('ADMIN_TOKEN') || ''
          const res = await fetch(`/api/tokens/${id}/pair`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
            body: JSON.stringify({ dexPairUrl: url })
          })
          if (!res.ok) throw new Error(await res.text())
          setMsg('Saved. Reloading…')
          location.reload()
        } catch (e: any) {
          setMsg(e.message ?? 'Failed')
        }
      }
      return (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-zinc-500">Admin: Set Dex Pair URL</div>
          <div className="flex gap-2">
            <input value={url} onChange={(e) => setUrl(e.target.value)}
                   placeholder="https://dexscreener.com/.../PAIR"
                   className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 p-2 outline-none" />
            <button onClick={submit} className="rounded-md bg-white/10 px-3 py-2 hover:bg-white/15">Save</button>
          </div>
          {msg && <div className="text-xs text-zinc-400">{msg}</div>}
        </div>
      )
    }
  }, { ssr: false })

  return <AdminInner />
}


