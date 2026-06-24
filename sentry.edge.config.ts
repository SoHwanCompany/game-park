import * as Sentry from '@sentry/nextjs';

import { getSentryDsn, getSentryTracesSampleRate } from '@/lib/monitoring';

const dsn = getSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: getSentryTracesSampleRate(),
    environment: process.env.NODE_ENV,
  });
}
