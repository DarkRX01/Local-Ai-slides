interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  init(): void {
    this.observeLongTasks();
    this.observeLayoutShifts();
    this.observeLargestContentfulPaint();
    this.observeFirstInputDelay();
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.addMetric('long-task', entry.duration);
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Long tasks monitoring not supported');
      }
    }
  }

  private observeLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as PerformanceEntry & { value: number };
            this.addMetric('layout-shift', layoutShiftEntry.value);
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }

  private observeLargestContentfulPaint(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.addMetric('lcp', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }
    }
  }

  private observeFirstInputDelay(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEntry & { processingStart: number };
            const fid = fidEntry.processingStart - entry.startTime;
            this.addMetric('fid', fid);
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('FID monitoring not supported');
      }
    }
  }

  addMetric(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  getCoreWebVitals(): {
    lcp: number;
    fid: number;
    cls: number;
  } {
    return {
      lcp: this.getAverageMetric('lcp'),
      fid: this.getAverageMetric('fid'),
      cls: this.getMetricsByName('layout-shift').reduce((sum, m) => sum + m.value, 0),
    };
  }

  measureRenderTime(componentName: string, callback: () => void): void {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    this.addMetric(`render-${componentName}`, endTime - startTime);
  }

  async measureAsyncOperation(operationName: string, callback: () => Promise<void>): Promise<void> {
    const startTime = performance.now();
    await callback();
    const endTime = performance.now();
    this.addMetric(operationName, endTime - startTime);
  }

  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }

  logReport(): void {
    const vitals = this.getCoreWebVitals();
    console.group('Performance Report');
    console.log('Core Web Vitals:');
    console.log(`  LCP: ${vitals.lcp.toFixed(2)}ms`);
    console.log(`  FID: ${vitals.fid.toFixed(2)}ms`);
    console.log(`  CLS: ${vitals.cls.toFixed(4)}`);
    
    const longTasks = this.getMetricsByName('long-task');
    if (longTasks.length > 0) {
      console.log(`\nLong Tasks: ${longTasks.length}`);
      console.log(`  Average Duration: ${this.getAverageMetric('long-task').toFixed(2)}ms`);
    }
    
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();
