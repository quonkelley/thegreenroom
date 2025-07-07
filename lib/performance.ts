interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface PerformanceData {
  api: PerformanceMetric[];
  database: PerformanceMetric[];
  userInteractions: PerformanceMetric[];
  errors: PerformanceMetric[];
}

class PerformanceMonitor {
  private metrics: PerformanceData = {
    api: [],
    database: [],
    userInteractions: [],
    errors: [],
  };

  private maxMetrics = 1000; // Keep last 1000 metrics per category

  // API Performance Tracking
  startApiTimer(endpoint: string, method: string): () => void {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric('api', {
        name: `${method} ${endpoint}`,
        duration,
        timestamp: new Date().toISOString(),
        metadata: { endpoint, method, requestId },
      });
    };
  }

  // Database Performance Tracking
  startDbTimer(operation: string, table: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric('database', {
        name: `${operation} ${table}`,
        duration,
        timestamp: new Date().toISOString(),
        metadata: { operation, table },
      });
    };
  }

  // User Interaction Tracking
  trackUserInteraction(action: string, component?: string): void {
    this.recordMetric('userInteractions', {
      name: action,
      duration: 0, // User interactions don't have duration
      timestamp: new Date().toISOString(),
      metadata: { component },
    });
  }

  // Error Tracking
  trackError(error: Error, context?: string): void {
    this.recordMetric('errors', {
      name: error.name,
      duration: 0,
      timestamp: new Date().toISOString(),
      metadata: {
        message: error.message,
        stack: error.stack,
        context,
      },
    });
  }

  // Performance Decorators
  withApiTiming<T extends any[], R>(
    endpoint: string,
    method: string,
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const stopTimer = this.startApiTimer(endpoint, method);
      try {
        const result = await fn(...args);
        stopTimer();
        return result;
      } catch (error) {
        this.trackError(error as Error, `${method} ${endpoint}`);
        throw error;
      }
    };
  }

  withDbTiming<T extends any[], R>(
    operation: string,
    table: string,
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const stopTimer = this.startDbTimer(operation, table);
      try {
        const result = await fn(...args);
        stopTimer();
        return result;
      } catch (error) {
        this.trackError(error as Error, `${operation} ${table}`);
        throw error;
      }
    };
  }

  // Analytics and Reporting
  getMetrics(category?: keyof PerformanceData): PerformanceMetric[] {
    if (category) {
      return this.metrics[category];
    }
    return [
      ...this.metrics.api,
      ...this.metrics.database,
      ...this.metrics.userInteractions,
      ...this.metrics.errors,
    ];
  }

  getApiMetrics(): PerformanceMetric[] {
    return this.metrics.api;
  }

  getDbMetrics(): PerformanceMetric[] {
    return this.metrics.database;
  }

  getErrorMetrics(): PerformanceMetric[] {
    return this.metrics.errors;
  }

  // Performance Analytics
  getAverageResponseTime(endpoint?: string): number {
    const apiMetrics = endpoint
      ? this.metrics.api.filter(m => m.metadata?.endpoint === endpoint)
      : this.metrics.api;

    if (apiMetrics.length === 0) {
      return 0;
    }

    const total = apiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / apiMetrics.length;
  }

  getSlowestEndpoints(
    limit: number = 10
  ): Array<{ endpoint: string; avgDuration: number }> {
    const endpointStats = new Map<string, { total: number; count: number }>();

    this.metrics.api.forEach(metric => {
      const endpoint = metric.metadata?.endpoint;
      if (endpoint) {
        const stats = endpointStats.get(endpoint) || { total: 0, count: 0 };
        stats.total += metric.duration;
        stats.count += 1;
        endpointStats.set(endpoint, stats);
      }
    });

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  getErrorRate(): number {
    const totalRequests = this.metrics.api.length;
    const totalErrors = this.metrics.errors.length;
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  // Memory Management
  private recordMetric(
    category: keyof PerformanceData,
    metric: PerformanceMetric
  ): void {
    this.metrics[category].push(metric);

    // Keep only the last maxMetrics
    if (this.metrics[category].length > this.maxMetrics) {
      this.metrics[category] = this.metrics[category].slice(-this.maxMetrics);
    }
  }

  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // Clear metrics (useful for testing)
  clearMetrics(): void {
    this.metrics = {
      api: [],
      database: [],
      userInteractions: [],
      errors: [],
    };
  }

  // Export metrics for external monitoring
  exportMetrics(): PerformanceData {
    return JSON.parse(JSON.stringify(this.metrics));
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
