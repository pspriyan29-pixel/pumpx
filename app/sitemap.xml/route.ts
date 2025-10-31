import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const staticUrls = [
    `${base}/`,
    `${base}/tokens`,
    `${base}/create`,
    `${base}/launch`,
    `${base}/status`,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(u => `<url><loc>${u}</loc></url>`).join('\n')}
</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}


