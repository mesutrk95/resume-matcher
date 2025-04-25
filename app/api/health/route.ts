import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import logger from '@/lib/logger';

/**
 * Health check endpoint to verify API availability
 * GET /api/health
 *
 * This endpoint checks the health of various services:
 * - API server status
 * - Database connection
 * - System information
 */
export async function GET() {
  const startTime = Date.now();
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: 'unknown',
        responseTime: 0,
        message: 'Database connection status unknown',
      },
    },
  };

  try {
    // Check database connection
    const dbStartTime = Date.now();
    await db.$queryRaw`SELECT 1`;
    healthStatus.services.database = {
      status: 'ok',
      responseTime: Date.now() - dbStartTime,
      message: 'Database connection is healthy',
    };
  } catch (error) {
    logger.error('Health check database error:', error);
    healthStatus.services.database = {
      status: 'error',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown database error',
    };
    healthStatus.status = 'degraded';
  }

  // Calculate total response time
  const totalResponseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...healthStatus,
      responseTime: totalResponseTime,
    },
    {
      status: healthStatus.status === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
