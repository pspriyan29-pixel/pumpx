import { Db, MongoClient } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'pump_all_in_one'

if (!uri) {
  // Avoid throwing in module scope in Next.js; will throw on first use
  // to keep build working without local env.
}

export async function getDb(): Promise<Db> {
  if (db) return db
  if (!uri) throw new Error('Missing MONGODB_URI environment variable')
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  return db
}


