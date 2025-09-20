/**
 * Homepage Performance Monitoring
 * Enhanced performance monitoring with Core Web Vitals for the main page
 */

// Enhanced Performance monitoring with Core Web Vitals
window.addEventListener('load', function() {
  if ('performance' in window) {
    const perfData = performance.timing;
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('⚡ Page load time:', Math.round(loadTime) + 'ms');

    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('📊 LCP:', Math.round(lastEntry.startTime) + 'ms');
        if (window.CostFlowAnalytics) {
          window.CostFlowAnalytics.trackEvent('core_web_vitals', {
            metric: 'LCP',
            value: lastEntry.startTime
          });
        }
      }).observe({entryTypes: ['largest-contentful-paint']});

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('📊 FID:', Math.round(entry.processingStart - entry.startTime) + 'ms');
          if (window.CostFlowAnalytics) {
            window.CostFlowAnalytics.trackEvent('core_web_vitals', {
              metric: 'FID',
              value: entry.processingStart - entry.startTime
            });
          }
        }
      }).observe({entryTypes: ['first-input']});
    }

    // Track performance metrics for analytics
    if (window.CostFlowAnalytics) {
      window.CostFlowAnalytics.trackEvent('performance_timing', {
        load_time: loadTime,
        dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      });
    }
  }
});