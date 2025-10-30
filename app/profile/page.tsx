import { cookies } from 'next/headers'

export default async function ProfilePage() {
  // Simple clientless fetch of session from API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/auth/me`, { cache: 'no-store' }).catch(() => null)
  const data = await res?.json().catch(() => null)
  const session = data?.session || null
  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile</h2>
      {!session ? (
        <div className="rounded-md border border-zinc-800 p-4 text-zinc-400">Not signed in. Connect wallet di header.</div>
      ) : (
        <div className="rounded-md border border-zinc-800 p-4">
          <div className="text-sm">Address: <span className="text-zinc-300">{session.address}</span></div>
          <div className="text-sm">Chain: <span className="text-zinc-300">{session.chain}</span></div>
          <div className="text-xs text-zinc-500">Signed at: {new Date(session.createdAt).toLocaleString()}</div>
        </div>
      )}
    </main>
  )
}


