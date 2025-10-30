import dynamic from 'next/dynamic'

export default async function StatusPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/ready`, { cache: 'no-store' }).catch(() => null)
  const data = res && res.ok ? await res.json() : null
  const ready = Boolean(data?.ok)
  const DepositInfo = dynamic(() => import('@/components/DepositInfo'), { ssr: false })
  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-semibold">System Status</h2>
      <div className={`rounded-lg border p-4 ${ready ? 'border-green-800 bg-green-950/20' : 'border-red-800 bg-red-950/20'}`}>
        <div className="font-medium">Readiness: {ready ? 'OK' : 'NOT READY'}</div>
        <pre className="mt-2 overflow-auto text-xs text-zinc-300">{JSON.stringify(data ?? { error: 'unreachable' }, null, 2)}</pre>
      </div>
      <DepositInfo />
    </main>
  )
}


