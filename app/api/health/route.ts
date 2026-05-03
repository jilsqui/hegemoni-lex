import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const tokenFromEnv = process.env.HEALTHCHECK_TOKEN;

  // Optional guard: if HEALTHCHECK_TOKEN is set, callers must pass ?token=...
  if (tokenFromEnv) {
    const { searchParams } = new URL(request.url);
    const tokenFromQuery = searchParams.get('token');

    if (!tokenFromQuery || tokenFromQuery !== tokenFromEnv) {
      return NextResponse.json(
        {
          status: 'unauthorized',
          message: 'Missing or invalid health check token.',
          timestamp: new Date().toISOString(),
        },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      );
    }
  }

  let dbStatus: 'ok' | 'error' = 'ok';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error: any) {
    dbStatus = 'error';
    dbError = error?.message || 'Unknown database error';
  }

  const responseTimeMs = Date.now() - startedAt;
  const isHealthy = dbStatus === 'ok';

  return NextResponse.json(
    {
      service: 'hukum-edukasi',
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks: {
        database: {
          status: dbStatus,
          error: dbError,
        },
      },
      responseTimeMs,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}
