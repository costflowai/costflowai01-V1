#!/usr/bin/env node

/**
 * CSS Build Tool for CostFlowAI
 * Concatenates and minifies CSS files for production performance
 */

import fs from 'fs';
import path from 'path';

const CSS_FILES = [
  'assets/css/base.css',
  'assets/css/layout.css', 
  'assets/css/components.css',
  'assets/css/calculators.css'
];

const OUTPUT_DIR = 'assets/css/dist';
const OUTPUT_FILE = 'assets/css/dist/app.min.css';

/**
 * Minify CSS by removing comments, whitespace, and optimizing
 */
function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace and newlines
    .replace(/\s+/g, ' ')
    // Remove spaces around selectors and properties
    .replace(/\s*{\s*/g, '{')
    .replace(/;\s*/g, ';')
    .replace(/}\s*/g, '}')
    .replace(/,\s*/g, ',')
    .replace(/:\s*/g, ':')
    // Remove trailing semicolons before }
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Extract critical CSS (above-the-fold styles)
 */
function extractCriticalCSS(css) {
  const criticalSelectors = [
    // Base styles
    '*', 'body', 'html',
    // Header and navigation
    'header', '.main-nav', '.logo', '.nav-links',
    // Hero section (above-the-fold)
    '.hero', '.hero-content', '.hero h1', '.hero p', '.hero-actions',
    // Buttons (important for CTAs)
    '.btn', '.btn-primary', '.btn-secondary',
    // Search trigger
    '#search-trigger',
    // Typography
    'h1', 'h2', 'h3', 'p', 'a'
  ];

  const criticalRules = [];
  const lines = css.split('}');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    for (const selector of criticalSelectors) {
      if (line.includes(selector)) {
        criticalRules.push(line + '}');
        break;
      }
    }
  }
  
  return criticalRules.join('');
}

/**
 * Build optimized CSS
 */
async function buildCSS() {
  console.log('🎨 Starting CSS build process...');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let combinedCSS = '';
  let totalSize = 0;
  
  // Read and combine CSS files
  for (const file of CSS_FILES) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');
      totalSize += size;
      
      combinedCSS += `\n/* ${file} */\n${content}\n`;
      console.log(`✓ Processed ${file} (${(size / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error.message);
    }
  }
  
  // Minify combined CSS
  console.log('🗜️  Minifying CSS...');
  const minifiedCSS = minifyCSS(combinedCSS);
  const minifiedSize = Buffer.byteLength(minifiedCSS, 'utf8');
  
  // Write minified CSS
  fs.writeFileSync(OUTPUT_FILE, minifiedCSS);
  
  // Extract and write critical CSS
  console.log('⚡ Extracting critical CSS...');
  const criticalCSS = extractCriticalCSS(minifiedCSS);
  const criticalFile = 'assets/css/dist/critical.min.css';
  fs.writeFileSync(criticalFile, criticalCSS);
  const criticalSize = Buffer.byteLength(criticalCSS, 'utf8');
  
  // Performance summary
  const compressionRatio = ((totalSize - minifiedSize) / totalSize * 100).toFixed(1);
  
  console.log('\n📊 CSS Build Summary:');
  console.log(`   Original size: ${(totalSize / 1024).toFixed(1)}KB`);
  console.log(`   Minified size: ${(minifiedSize / 1024).toFixed(1)}KB`);
  console.log(`   Critical size: ${(criticalSize / 1024).toFixed(1)}KB`);
  console.log(`   Compression: ${compressionRatio}% smaller`);
  console.log(`   Output files:`);
  console.log(`     - ${OUTPUT_FILE}`);
  console.log(`     - ${criticalFile}`);
  
  console.log('✅ CSS build completed successfully!');
}

// Run build
buildCSS().catch(console.error);