/**
 * Performance monitoring module
 * Tracks page load times and metrics
 */

function initPerformanceMonitoring() {
  window.addEventListener('load', function() {
    if ('performance' in window) {
      const perfData = performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log('⚡ Page load time:', Math.round(loadTime) + 'ms');

      // Track performance metrics for analytics (guard against missing analytics)
      if (window.CostFlowAnalytics && typeof window.CostFlowAnalytics.trackEvent === 'function') {
        window.CostFlowAnalytics.trackEvent('performance_timing', {
          load_time: loadTime,
          dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
        });
      }
    }
  });
}

// Initialize on load
initPerformanceMonitoring();

export { initPerformanceMonitoring };