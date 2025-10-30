export default function AboutPage() {
  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-semibold">About</h2>
      <p className="text-zinc-300">Pump All‑in‑One adalah platform untuk pembuatan token, listing prioritas, dan verifikasi pembayaran sederhana di Solana & BNB. Fokus kami: keamanan, performa, dan pengalaman pengguna.</p>
      <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
        <li>Arsitektur: Next.js App Router + MongoDB</li>
        <li>Keamanan: CSP ketat, rate limit, img proxy whitelist</li>
        <li>Wallet: SIWE/SIWS, nonce TTL, cookie aman</li>
      </ul>
    </main>
  )
}


