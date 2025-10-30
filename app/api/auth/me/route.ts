import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('session')?.value
  if (!cookie) return NextResponse.json({ session: null })
  try {
    const json = Buffer.from(cookie, 'base64').toString('utf8')
    const session = JSON.parse(json)
    return NextResponse.json({ session })
  } catch {
    return NextResponse.json({ session: null })
  }
}


