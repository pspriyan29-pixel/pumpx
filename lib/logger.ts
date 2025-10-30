type LogLevel = 'info' | 'warn' | 'error'

function safeMask(value: unknown): unknown {
  if (typeof value !== 'string') return value
  if (value.length <= 8) return value
  return value.slice(0, 4) + '***' + value.slice(-3)
}

export function logJson(level: LogLevel, message: string, fields?: Record<string, unknown>) {
  try {
    const payload = {
      level,
      ts: new Date().toISOString(),
      msg: message,
      ...fields,
    }
    // Mask common secrets if accidentally passed
    if ((payload as any).authorization) (payload as any).authorization = safeMask((payload as any).authorization)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload))
  } catch {
    // eslint-disable-next-line no-console
    console.log(`[logJson:${level}] ${message}`)
  }
}


