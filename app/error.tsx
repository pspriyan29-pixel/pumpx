'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <main className="mx-auto max-w-2xl py-16 text-center space-y-3">
          <h1 className="text-3xl font-bold">Terjadi kesalahan</h1>
          <p className="text-zinc-400">{error.message || 'Unexpected error'} {error.digest ? `(id: ${error.digest})` : ''}</p>
          <button onClick={() => reset()} className="rounded-md bg-white/10 px-4 py-2">Muat ulang</button>
        </main>
      </body>
    </html>
  )
}


