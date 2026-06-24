import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const rawTracesSampleRate = process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
const tracesSampleRate = rawTracesSampleRate ? Number(rawTracesSampleRate) : 0.1;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate:
      Number.isFinite(tracesSampleRate) && tracesSampleRate >= 0 && tracesSampleRate <= 1
        ? tracesSampleRate
        : 0.1,
    environment: process.env.NODE_ENV,
  });
}
