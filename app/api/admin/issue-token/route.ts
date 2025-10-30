import { NextRequest, NextResponse } from 'next/server'
import { issueAdminJwt } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const adminHeader = req.headers.get('x-admin-token') || ''
  if (!process.env.ADMIN_TOKEN || adminHeader !== process.env.ADMIN_TOKEN) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const token = issueAdminJwt({ role: 'admin' })
  return NextResponse.json({ token })
}


