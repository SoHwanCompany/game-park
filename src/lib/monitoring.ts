const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

export const getSentryDsn = (): string | undefined => {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
};

export const getSentryTracesSampleRate = (): number => {
  const rawValue = process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;

  if (!rawValue) {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }

  return parsed;
};
