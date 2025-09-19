#!/usr/bin/env node

/**
 * Asset Optimization Tool
 * Optimizes loading of vendor libraries and implements preloading
 */

import fs from 'fs';
import path from 'path';

/**
 * Add resource hints for better performance
 */
function addResourceHints(html) {
  const resourceHints = `
    <!-- Performance: DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//www.googletagmanager.com">
    
    <!-- Performance: Preload critical assets -->
    <link rel="preload" href="/vendor/lunr/lunr.min.js" as="script">
    <link rel="preload" href="/assets/js/core/analytics.js" as="script">
    <link rel="preload" href="/assets/js/blog-search.js" as="script">
    
    <!-- Performance: Prefetch likely-needed assets -->
    <link rel="prefetch" href="/vendor/jspdf/jspdf.min.js">
    <link rel="prefetch" href="/assets/data/search.json">`;

  // Insert after the existing meta tags
  return html.replace(
    /<meta name="description"[^>]*>/,
    `$&${resourceHints}`
  );
}

/**
 * Optimize script loading
 */
function optimizeScriptLoading(html) {
  // Add async loading for non-critical scripts
  html = html.replace(
    /defer nonce="/g, 
    'defer async nonce="'
  );
  
  return html;
}

/**
 * Add performance monitoring
 */
function addPerformanceMonitoring(html) {
  const perfScript = `
    <script nonce="__NONCE__">
      // Performance monitoring
      window.addEventListener('load', function() {
        if ('performance' in window) {
          const perfData = performance.timing;
          const loadTime = perfData.loadEventEnd - perfData.navigationStart;
          console.log('⚡ Page load time:', Math.round(loadTime) + 'ms');
          
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
    </script>`;

  // Insert before closing body tag
  return html.replace('</body>', `${perfScript}\n</body>`);
}

/**
 * Optimize HTML files
 */
async function optimizeAssets() {
  console.log('🚀 Starting asset optimization...');
  
  const htmlFiles = ['index.html'];
  
  for (const file of htmlFiles) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Skipping ${file} (not found)`);
      continue;
    }
    
    try {
      let html = fs.readFileSync(file, 'utf8');
      
      // Apply optimizations
      html = addResourceHints(html);
      html = optimizeScriptLoading(html);
      html = addPerformanceMonitoring(html);
      
      // Write optimized HTML
      fs.writeFileSync(file, html);
      console.log(`✓ Optimized ${file}`);
      
    } catch (error) {
      console.error(`❌ Error optimizing ${file}:`, error.message);
    }
  }
  
  console.log('✅ Asset optimization completed!');
}

// Run optimization
optimizeAssets().catch(console.error);