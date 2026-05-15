/**
 * Monitoring Dashboard API Route
 * Returns real-time monitoring data about application performance
 * 
 * Protected: Only accessible in development or with valid admin token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMonitoringData, slowQueryTracker } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  // Security: Only allow in development or with proper authentication
  if (process.env.NODE_ENV === 'production') {
    // In production, verify admin authentication
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MONITORING_API_KEY;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    const data = getMonitoringData();
    
    return NextResponse.json(
      {
        status: 'ok',
        data,
        cacheControl: 'no-cache, no-store, must-revalidate',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Monitoring-Timestamp': new Date().toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Monitoring endpoint error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint untuk clear monitoring history
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    if (body.action === 'clear-queries') {
      slowQueryTracker.clear();
      return NextResponse.json({ status: 'cleared' });
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Monitoring POST error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
