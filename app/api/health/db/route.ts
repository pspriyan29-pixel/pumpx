import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const started = Date.now()
  try {
    const db = await getDb()
    const pingStart = Date.now(); await db.command({ ping: 1 }); const pingMs = Date.now() - pingStart
    const names = await db.listCollections({}, { nameOnly: true }).toArray()
    const counts: Record<string, number> = {}
    const sample = ['tokens', 'orders', 'sessions', 'nonces']
    for (const col of sample) {
      try { counts[col] = await db.collection(col).estimatedDocumentCount() } catch { counts[col] = -1 }
    }
    const totalMs = Date.now() - started
    return NextResponse.json({ ok: true, latencyMs: { total: totalMs, ping: pingMs }, collections: names.map(n => n.name), counts })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'db error' }, { status: 503 })
  }
}
