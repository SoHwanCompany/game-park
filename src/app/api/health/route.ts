import { NextResponse } from 'next/server';

import { getHealthStatus, type HealthStatus } from '@/lib/operations';

export const dynamic = 'force-dynamic';

export const GET = async (): Promise<NextResponse<HealthStatus>> => {
  const health = await getHealthStatus();

  return NextResponse.json(health, { status: health.status === 'ok' ? 200 : 503 });
};
