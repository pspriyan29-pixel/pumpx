import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const db = await getDb()
  const tokens = await db.collection('tokens').find({}, { projection: { _id: 1 } }).sort({ createdAt: -1 }).limit(500).toArray()
  const urls = [
    `${base}/`,
    `${base}/tokens`,
    `${base}/create`,
    `${base}/launch`,
    `${base}/status`,
    ...tokens.map((t: any) => `${base}/tokens/${t._id}`)
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${u}</loc></url>`).join('\n')}
</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}


