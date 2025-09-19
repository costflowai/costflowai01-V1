#!/usr/bin/env node

/**
 * Inline Critical CSS Tool
 * Inlines critical CSS directly into HTML for fastest rendering
 */

import fs from 'fs';
import path from 'path';

const CRITICAL_CSS_FILE = 'assets/css/dist/critical.min.css';
const HTML_FILES = [
  'index.html',
  'templates/base.html'
];

/**
 * Inline critical CSS into HTML files
 */
async function inlineCriticalCSS() {
  console.log('⚡ Starting critical CSS inlining...');
  
  // Read critical CSS
  let criticalCSS = '';
  try {
    criticalCSS = fs.readFileSync(CRITICAL_CSS_FILE, 'utf8');
    console.log(`✓ Loaded critical CSS (${(criticalCSS.length / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.error('❌ Error reading critical CSS:', error.message);
    return;
  }
  
  // Process each HTML file
  for (const htmlFile of HTML_FILES) {
    if (!fs.existsSync(htmlFile)) {
      console.log(`⚠️  Skipping ${htmlFile} (not found)`);
      continue;
    }
    
    try {
      let html = fs.readFileSync(htmlFile, 'utf8');
      
      // Replace the critical CSS import with inlined styles
      const criticalStylesRegex = /<!-- Critical CSS inlined for performance -->[\s\S]*?<\/style>/;
      const inlinedCSS = `<!-- Critical CSS inlined for performance -->
    <style>
      ${criticalCSS}
    </style>`;
      
      if (criticalStylesRegex.test(html)) {
        html = html.replace(criticalStylesRegex, inlinedCSS);
      } else {
        // If no existing critical CSS section, add it after meta tags
        const headRegex = /(<head>[\s\S]*?)<link/;
        html = html.replace(headRegex, `$1${inlinedCSS}\n    <link`);
      }
      
      // Write updated HTML
      fs.writeFileSync(htmlFile, html);
      console.log(`✓ Inlined critical CSS in ${htmlFile}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${htmlFile}:`, error.message);
    }
  }
  
  console.log('✅ Critical CSS inlining completed!');
}

// Run inlining
inlineCriticalCSS().catch(console.error);