/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Analytics singleton for tracking application events, page views, feature usage,
 *              errors, and performance metrics. Uses queue-based processing with automatic
 *              retry logic and browser unload flushing.
 */

type EventType = 'page_view' | 'feature_usage' | 'error' | 'performance';

interface AnalyticsEvent {
  type: EventType;
  name: string;
  data?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private static instance: Analytics;
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;

  private constructor() {
    // Flush remaining events when user closes browser/tab
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Gets singleton instance of Analytics
   * @return {Analytics} Singleton instance
   */
  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Tracks generic analytics event
   * @param {AnalyticsEvent} event - Event to track
   */
  public trackEvent(event: AnalyticsEvent) {
    this.queue.push({
      ...event,
      timestamp: Date.now()
    });
    this.processQueue();
  }

  /**
   * Tracks page view navigation
   * @param {string} path - Page path being viewed
   */
  public trackPageView(path: string) {
    this.trackEvent({
      type: 'page_view',
      name: path
    });
  }

  /**
   * Tracks feature usage with optional context data
   * @param {string} feature - Feature identifier
   * @param {Record<string, any>} [data] - Additional context data
   */
  public trackFeatureUsage(feature: string, data?: Record<string, any>) {
    this.trackEvent({
      type: 'feature_usage',
      name: feature,
      data
    });
  }

  /**
   * Tracks application errors with stack traces
   * @param {Error} error - Error instance to track
   * @param {Record<string, any>} [context] - Additional error context
   */
  public trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent({
      type: 'error',
      name: error.name,
      data: {
        message: error.message,
        stack: error.stack,
        ...context
      }
    });
  }

  /**
   * Tracks performance metrics
   * @param {string} metric - Metric name (e.g., 'page_load', 'api_response')
   * @param {number} value - Metric value in milliseconds
   */
  public trackPerformance(metric: string, value: number) {
    this.trackEvent({
      type: 'performance',
      name: metric,
      data: { value }
    });
  }

  /**
   * Processes queued events with retry logic on failure
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      // Production would send to analytics service (Google Analytics, Mixpanel, etc.)
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Re-queue failed events for retry
      this.queue.unshift(...events);
      console.error('Failed to process analytics events:', error);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Flushes remaining queued events (called on page unload)
   */
  private async flush() {
    if (this.queue.length > 0) {
      await this.processQueue();
    }
  }
}

export const analytics = Analytics.getInstance();
