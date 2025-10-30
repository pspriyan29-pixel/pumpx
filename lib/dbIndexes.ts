import { Db } from 'mongodb'

export async function ensureIndexes(db: Db) {
  // tokens
  await db.collection('tokens').createIndexes([
    { key: { createdAtDt: -1 }, name: 'tokens_createdAtDt_desc' },
    { key: { featured: -1, createdAtDt: -1 }, name: 'tokens_featured_createdAtDt' },
    { key: { symbol: 1 }, name: 'tokens_symbol_asc' },
    { key: { blacklisted: 1 }, name: 'tokens_blacklisted' },
  ])
  // orders
  await db.collection('orders').createIndexes([
    { key: { tokenId: 1, createdAtDt: -1 }, name: 'orders_tokenId_createdAtDt' },
    { key: { status: 1 }, name: 'orders_status' },
  ])
  // launchRequests
  await db.collection('launchRequests').createIndexes([
    { key: { tokenId: 1, status: 1, createdAt: -1 }, name: 'launch_token_status_created' },
  ])
  // nonces TTL (10 minutes)
  await db.collection('nonces').createIndex({ createdAtDt: 1 }, { name: 'nonces_ttl', expireAfterSeconds: 600 })
  // sessions TTL (7 days)
  await db.collection('sessions').createIndex({ createdAtDt: 1 }, { name: 'sessions_ttl', expireAfterSeconds: 60 * 60 * 24 * 7 })
}


