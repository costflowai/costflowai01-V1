/**
 * CostFlowAI Performance Optimization Module
 * Enterprise-grade performance monitoring and optimization
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      fcp: null
    };

    this.observers = new Map();
    this.isEnabled = 'performance' in window && 'PerformanceObserver' in window;

    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    // Core Web Vitals monitoring
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Resource monitoring
    this.observeResources();

    // Memory monitoring
    this.observeMemory();

    // Critical path optimization
    this.optimizeCriticalPath();

    console.log('🚀 Performance Optimizer initialized');
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);

      // Disconnect after getting LCP
      observer.disconnect();
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('lcp', observer);
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fid = entry.processingStart - entry.startTime;
        this.metrics.fid = fid;
        this.reportMetric('FID', fid);
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.set('fid', observer);
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      this.metrics.cls = clsValue;
      this.reportMetric('CLS', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('cls', observer);
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.reportMetric('FCP', entry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('fcp', observer);
  }

  /**
   * Observe Time to First Byte
   */
  observeTTFB() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart;
          this.metrics.ttfb = ttfb;
          this.reportMetric('TTFB', ttfb);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('ttfb', observer);
  }

  /**
   * Monitor resource loading performance
   */
  observeResources() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > 1000) { // Slow resources (>1s)
          console.warn(`⚠️ Slow resource detected: ${entry.name} (${Math.round(entry.duration)}ms)`);

          if (window.CostFlowAnalytics) {
            window.CostFlowAnalytics.trackEvent('performance_warning', {
              resource: entry.name,
              duration: entry.duration,
              type: entry.initiatorType
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resources', observer);
  }

  /**
   * Monitor memory usage
   */
  observeMemory() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        if (usedPercent > 80) {
          console.warn(`⚠️ High memory usage detected: ${usedPercent.toFixed(1)}%`);

          if (window.CostFlowAnalytics) {
            window.CostFlowAnalytics.trackEvent('performance_warning', {
              type: 'memory',
              usage_percent: usedPercent,
              used_mb: Math.round(memory.usedJSHeapSize / 1048576),
              limit_mb: Math.round(memory.jsHeapSizeLimit / 1048576)
            });
          }
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Optimize critical rendering path
   */
  optimizeCriticalPath() {
    // Preload critical resources
    this.preloadCriticalResources();

    // Implement lazy loading for non-critical images
    this.implementLazyLoading();

    // Optimize font loading
    this.optimizeFontLoading();

    // Implement resource hints
    this.implementResourceHints();
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      { href: '/assets/js/core/analytics.js', as: 'script' },
      { href: '/assets/js/core/search.js', as: 'script' },
      { href: '/assets/data/search.json', as: 'fetch', crossorigin: 'anonymous' }
    ];

    criticalResources.forEach(resource => {
      const existing = document.querySelector(`link[href="${resource.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Implement lazy loading for images
   */
  implementLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Optimize font loading
   */
  optimizeFontLoading() {
    // Add font-display: swap to critical fonts
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'system-ui';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Implement resource hints
   */
  implementResourceHints() {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'preconnect', href: 'https://www.google-analytics.com', crossorigin: true }
    ];

    hints.forEach(hint => {
      const existing = document.querySelector(`link[href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossorigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Report performance metrics
   */
  reportMetric(name, value) {
    const roundedValue = Math.round(value);
    console.log(`📊 ${name}: ${roundedValue}ms`);

    // Send to analytics if available
    if (window.CostFlowAnalytics) {
      window.CostFlowAnalytics.trackEvent('core_web_vitals', {
        metric: name,
        value: roundedValue,
        rating: this.getRating(name, value)
      });
    }

    // Check if metric needs attention
    this.checkMetricThresholds(name, value);
  }

  /**
   * Get performance rating for metric
   */
  getRating(metric, value) {
    const thresholds = {
      'LCP': { good: 2500, poor: 4000 },
      'FID': { good: 100, poor: 300 },
      'CLS': { good: 0.1, poor: 0.25 },
      'FCP': { good: 1800, poor: 3000 },
      'TTFB': { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Check metric thresholds and provide recommendations
   */
  checkMetricThresholds(metric, value) {
    const rating = this.getRating(metric, value);

    if (rating === 'poor') {
      const recommendations = this.getRecommendations(metric);
      console.warn(`⚠️ ${metric} is poor (${Math.round(value)}). Recommendations:`, recommendations);

      if (window.CostFlowAnalytics) {
        window.CostFlowAnalytics.trackEvent('performance_issue', {
          metric,
          value: Math.round(value),
          rating,
          recommendations: recommendations.join(', ')
        });
      }
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(metric) {
    const recommendations = {
      'LCP': [
        'Optimize images with WebP format',
        'Use CDN for faster asset delivery',
        'Implement critical CSS inlining',
        'Preload important resources'
      ],
      'FID': [
        'Reduce JavaScript execution time',
        'Split code into smaller chunks',
        'Use web workers for heavy computations',
        'Optimize third-party scripts'
      ],
      'CLS': [
        'Set explicit dimensions for images',
        'Reserve space for dynamic content',
        'Use transform animations instead of layout changes',
        'Preload web fonts'
      ],
      'FCP': [
        'Inline critical CSS',
        'Optimize server response time',
        'Use preload for important resources',
        'Minimize render-blocking resources'
      ],
      'TTFB': [
        'Optimize server performance',
        'Use CDN for global delivery',
        'Enable server-side caching',
        'Optimize database queries'
      ]
    };

    return recommendations[metric] || ['Contact support for optimization guidance'];
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary() {
    return {
      metrics: this.metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    console.log('🧹 Performance Optimizer destroyed');
  }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for global access
window.CostFlowPerformance = performanceOptimizer;

export default performanceOptimizer;