/**
 * Monitoring & Error Tracking Utilities
 * Integrates with Vercel Analytics and provides custom error tracking
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface SlowQuery {
  query: string;
  duration: number;
  timestamp: number;
  context?: string;
}

/**
 * In-memory store untuk slow queries (production akan menggunakan database)
 */
class SlowQueryTracker {
  private queries: SlowQuery[] = [];
  private threshold: number = 500; // ms
  private maxHistorySize: number = 100;

  /**
   * Record a potentially slow query
   */
  recordQuery(
    query: string,
    duration: number,
    context?: string
  ): void {
    if (duration >= this.threshold) {
      this.queries.push({
        query,
        duration,
        timestamp: Date.now(),
        context,
      });

      // Keep only recent queries
      if (this.queries.length > this.maxHistorySize) {
        this.queries = this.queries.slice(-this.maxHistorySize);
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  Slow Query: ${query} (${duration}ms)`);
      }
    }
  }

  /**
   * Get recent slow queries
   */
  getRecentQueries(limit: number = 10): SlowQuery[] {
    return this.queries.slice(-limit);
  }

  /**
   * Get average query duration
   */
  getAverageQueryTime(): number {
    if (this.queries.length === 0) return 0;
    const total = this.queries.reduce((sum, q) => sum + q.duration, 0);
    return total / this.queries.length;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.queries = [];
  }
}

/**
 * Performance monitoring for API routes
 */
export class APIMonitor {
  private startTime: number;
  private metrics: PerformanceMetric[] = [];

  constructor(
    private routeName: string
  ) {
    this.startTime = performance.now();
  }

  /**
   * Mark a checkpoint and record duration
   */
  mark(checkpointName: string, metadata?: Record<string, any>): void {
    const duration = performance.now() - this.startTime;
    this.metrics.push({
      name: checkpointName,
      duration,
      timestamp: Date.now(),
      metadata,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${this.routeName}/${checkpointName}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get total time since initialization
   */
  getTotalTime(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Get all metrics collected
   */
  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  /**
   * Log metrics if exceeds threshold
   */
  reportIfSlow(thresholdMs: number = 1000): void {
    const totalTime = this.getTotalTime();
    if (totalTime > thresholdMs) {
      console.warn(
        `🐌 Slow API Route: ${this.routeName} took ${totalTime.toFixed(2)}ms`
      );
      console.table(this.metrics);
    }
  }
}

/**
 * Global slow query tracker instance
 */
export const slowQueryTracker = new SlowQueryTracker();

/**
 * Report error to monitoring service
 */
export async function reportError(
  error: Error,
  context: {
    route?: string;
    userId?: string;
    action?: string;
    [key: string]: any;
  }
): Promise<void> {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error reported:', errorData);
  }

  // In production, send to error tracking service (Sentry, etc.)
  // This is a placeholder - configure with your error tracking service
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // Send to Sentry or similar
      await fetch(process.env.NEXT_PUBLIC_SENTRY_DSN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }
}

/**
 * Custom hook for tracking component performance
 */
export function usePerformanceMonitoring(componentName: string) {
  const monitor = new APIMonitor(componentName);

  return {
    mark: (checkpointName: string, metadata?: Record<string, any>) =>
      monitor.mark(checkpointName, metadata),
    report: (thresholdMs?: number) => monitor.reportIfSlow(thresholdMs),
    getTotalTime: () => monitor.getTotalTime(),
  };
}

/**
 * Wrap Prisma queries with monitoring
 */
export function withQueryMonitoring<T>(
  queryName: string,
  context: string
) {
  return async (queryFn: () => Promise<T>): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      slowQueryTracker.recordQuery(queryName, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      slowQueryTracker.recordQuery(`${queryName} (ERROR)`, duration, context);
      throw error;
    }
  };
}

/**
 * Get monitoring dashboard data
 */
export function getMonitoringData() {
  return {
    slowQueries: slowQueryTracker.getRecentQueries(20),
    avgQueryTime: slowQueryTracker.getAverageQueryTime(),
    timestamp: new Date().toISOString(),
  };
}
