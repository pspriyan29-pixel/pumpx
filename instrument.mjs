import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://16261f4b625267e7b43727223a2bb1fe@o4510277929730048.ingest.us.sentry.io/4510277961252864',
  sendDefaultPii: true,
})


