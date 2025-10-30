export function ensureWritesAllowed() {
  if (process.env.MAINTENANCE === 'true') {
    const err = new Error('Maintenance mode: writes are temporarily disabled')
    ;(err as any).status = 503
    throw err
  }
}


