import jwt, { JwtPayload } from 'jsonwebtoken'

export function issueAdminJwt(payload: object) {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('Missing ADMIN_JWT_SECRET')
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '12h' })
}

export function verifyAdminJwt(token: string): JwtPayload | null {
  try {
    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) return null
    const decoded = jwt.verify(token, secret)
    return typeof decoded === 'object' ? (decoded as JwtPayload) : null
  } catch {
    return null
  }
}

export function isAdminAuthorized(req: Request): boolean {
  const header = (req.headers as any).get?.('authorization') || ''
  if (header.startsWith('Bearer ')) {
    const token = header.slice(7)
    return verifyAdminJwt(token) != null
  }
  const adminHeader = (req.headers as any).get?.('x-admin-token') || ''
  if (process.env.ADMIN_TOKEN && adminHeader === process.env.ADMIN_TOKEN) return true
  return false
}


