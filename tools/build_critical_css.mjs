#!/usr/bin/env node

/**
 * True Critical CSS Builder
 * Extracts only above-the-fold styles for instant rendering
 */

import fs from 'fs';

/**
 * Extract truly critical CSS (above-the-fold only)
 */
function extractTrueCriticalCSS() {
  console.log('⚡ Building true critical CSS...');
  
  // Read the full CSS
  const fullCSS = fs.readFileSync('assets/css/dist/app.min.css', 'utf8');
  
  // Define truly critical selectors (above-the-fold only)
  const criticalSelectors = [
    // Reset and base styles
    '*', 'body', 'html',
    // Header (always visible)
    'header', '.main-nav', '.logo', '.nav-links', '.nav-links a',
    // Hero section (above-the-fold)
    '.hero', '.hero-content', '.hero h1', '.hero p', '.hero-actions',
    // Critical buttons
    '.btn', '.btn-primary', '.btn-secondary',
    // Typography that might be above-the-fold
    'h1', 'h2', 'p', 'a',
    // Essential utilities
    '.sr-only'
  ];
  
  // Extract only critical rules
  const criticalRules = [];
  const cssRules = fullCSS.split('}');
  
  for (const rule of cssRules) {
    if (!rule.trim()) continue;
    
    const ruleText = rule + '}';
    
    // Check if this rule matches any critical selector
    for (const selector of criticalSelectors) {
      if (ruleText.includes(selector) && !ruleText.includes('@media print')) {
        criticalRules.push(ruleText);
        break;
      }
    }
  }
  
  // Build minimal critical CSS
  let criticalCSS = criticalRules.join('').trim();
  
  // Add essential font loading
  criticalCSS = `/* Critical CSS - Above-the-fold only */
${criticalCSS}

/* Critical performance styles */
body{font-display:swap;}
.hero{min-height:60vh;}
.main-nav{position:relative;z-index:10;}`;

  // Write critical CSS
  fs.writeFileSync('assets/css/dist/critical-minimal.css', criticalCSS);
  
  const criticalSize = Buffer.byteLength(criticalCSS, 'utf8');
  console.log(`✓ True critical CSS: ${(criticalSize / 1024).toFixed(1)}KB (minimal)`);
  
  return criticalCSS;
}

// Run critical CSS extraction
extractTrueCriticalCSS();