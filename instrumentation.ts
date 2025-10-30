export async function register() {
  if (process.env.SENTRY_DSN) {
    // @ts-ignore – allow importing JS module without types
    await import('./instrument.mjs')
  }
  if (process.env.AUTO_INIT_INDEXES === 'true') {
    try {
      const { getDb } = await import('@/lib/db')
      const { ensureIndexes } = await import('@/lib/dbIndexes')
      const db = await getDb()
      await ensureIndexes(db)
      // eslint-disable-next-line no-console
      console.log('[startup] indexes ensured')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('[startup] ensure indexes failed:', (e as any)?.message)
    }
  }
}


