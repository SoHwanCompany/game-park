import { prisma } from '@/lib/prisma';

interface ToolStatus {
  key: string;
  label: string;
  configured: boolean;
  detail: string;
}

interface DatabaseHealth {
  ok: boolean;
  latencyMs: number;
}

interface OperationsStatus {
  tools: ToolStatus[];
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  checkedAt: string;
  database: DatabaseHealth;
  tools: ToolStatus[];
}

const hasEnv = (key: string): boolean => {
  return Boolean(process.env[key]?.trim());
};

export const getOperationsStatus = (): OperationsStatus => {
  return {
    tools: [
      {
        key: 'ga4',
        label: 'Google Analytics 4',
        configured: hasEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
        detail: '페이지 조회와 클라이언트 이벤트 분석',
      },
      {
        key: 'adsense',
        label: 'Google AdSense',
        configured: hasEnv('NEXT_PUBLIC_ADSENSE_CLIENT_ID'),
        detail: '자동 광고 기반 수익화',
      },
      {
        key: 'sentry',
        label: 'Sentry DSN',
        configured: hasEnv('NEXT_PUBLIC_SENTRY_DSN') || hasEnv('SENTRY_DSN'),
        detail: '프론트/서버 오류 모니터링 연동 준비',
      },
      {
        key: 'site-url',
        label: 'Canonical Site URL',
        configured: hasEnv('NEXT_PUBLIC_SITE_URL'),
        detail: 'SEO canonical, sitemap, robots 기준 URL',
      },
    ],
  };
};

export const getHealthStatus = async (): Promise<HealthStatus> => {
  const startedAt = performance.now();
  let databaseOk = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseOk = false;
  }

  const latencyMs = Math.round(performance.now() - startedAt);
  const { tools } = getOperationsStatus();

  return {
    status: databaseOk ? 'ok' : 'degraded',
    checkedAt: new Date().toISOString(),
    database: {
      ok: databaseOk,
      latencyMs,
    },
    tools,
  };
};
