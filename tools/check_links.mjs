#!/usr/bin/env node
/**
 * Internal Link Checker for CostFlowAI
 * Crawls site and validates all internal links return 200
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class LinkChecker {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.foundUrls = new Set();
    this.checkedUrls = new Set();
    this.brokenLinks = [];
    this.redirects = [];
    this.externalLinks = new Set();
  }

  async checkPage(url) {
    if (this.checkedUrls.has(url)) return;
    this.checkedUrls.add(url);

    console.log(`Checking: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        this.brokenLinks.push({
          url,
          status: response.status,
          statusText: response.statusText
        });
        return;
      }

      if (response.redirected) {
        this.redirects.push({
          from: url,
          to: response.url,
          status: response.status
        });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        return; // Skip non-HTML content
      }

      const html = await response.text();
      this.extractLinks(html, url);

    } catch (error) {
      this.brokenLinks.push({
        url,
        error: error.message
      });
    }
  }

  extractLinks(html, baseUrl) {
    // Simple regex to find href attributes
    const linkRegex = /href=["']([^"']+)["']/g;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];

      // Skip external links, fragments, and special protocols
      if (href.startsWith('http') && !href.startsWith(this.baseUrl)) {
        this.externalLinks.add(href);
        continue;
      }

      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      // Convert relative URLs to absolute
      let fullUrl;
      if (href.startsWith('/')) {
        fullUrl = this.baseUrl + href;
      } else if (href.startsWith('http')) {
        fullUrl = href;
      } else {
        // Relative path
        const basePath = new URL(baseUrl).pathname;
        const resolvedPath = path.posix.resolve(path.posix.dirname(basePath), href);
        fullUrl = this.baseUrl + resolvedPath;
      }

      // Clean up URL (remove fragments)
      fullUrl = fullUrl.split('#')[0];

      if (!this.foundUrls.has(fullUrl)) {
        this.foundUrls.add(fullUrl);
      }
    }
  }

  async checkAllLinks() {
    // Start with key pages
    const startUrls = [
      `${this.baseUrl}/`,
      `${this.baseUrl}/calculators/`,
      `${this.baseUrl}/blog/`,
    ];

    // Add all known calculator pages
    const calculators = [
      'concrete', 'framing', 'drywall', 'paint', 'roofing', 'flooring',
      'plumbing', 'electrical', 'hvac', 'earthwork', 'masonry', 'steel',
      'asphalt', 'siteconcrete', 'doorswindows', 'insulation', 'firestop',
      'waterproof', 'demolition', 'genconds', 'fees'
    ];

    calculators.forEach(calc => {
      startUrls.push(`${this.baseUrl}/calculators/${calc}/`);
    });

    // Add sample blog posts
    startUrls.push(`${this.baseUrl}/blog/welcome-to-costflowai/`);
    startUrls.push(`${this.baseUrl}/blog/concrete-calculator-guide/`);
    startUrls.push(`${this.baseUrl}/blog/regional-pricing-explained/`);

    // Add all found URLs to check queue
    for (const url of startUrls) {
      this.foundUrls.add(url);
    }

    // Check all URLs
    for (const url of this.foundUrls) {
      await this.checkPage(url);
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalUrls: this.checkedUrls.size,
        brokenLinks: this.brokenLinks.length,
        redirects: this.redirects.length,
        externalLinks: this.externalLinks.size
      },
      brokenLinks: this.brokenLinks,
      redirects: this.redirects,
      checkedUrls: Array.from(this.checkedUrls).sort()
    };

    console.log('\n=== LINK CHECK REPORT ===');
    console.log(`Total URLs checked: ${report.summary.totalUrls}`);
    console.log(`Broken links: ${report.summary.brokenLinks}`);
    console.log(`Redirects: ${report.summary.redirects}`);
    console.log(`External links found: ${report.summary.externalLinks}`);

    if (this.brokenLinks.length > 0) {
      console.log('\n❌ BROKEN LINKS:');
      this.brokenLinks.forEach(link => {
        console.log(`  ${link.url} - ${link.status || 'ERROR'}: ${link.statusText || link.error}`);
      });
    }

    if (this.redirects.length > 0) {
      console.log('\n🔄 REDIRECTS:');
      this.redirects.forEach(redirect => {
        console.log(`  ${redirect.from} → ${redirect.to}`);
      });
    }

    return report;
  }

  async run() {
    console.log('🔍 Starting internal link check...');
    console.log(`Base URL: ${this.baseUrl}`);

    try {
      await this.checkAllLinks();
      const report = this.generateReport();

      // Save report
      const reportPath = path.join(projectRoot, 'docs/qa/link-check-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      if (this.brokenLinks.length > 0) {
        console.log(`\n💾 Report saved to: ${reportPath}`);
        process.exit(1);
      } else {
        console.log('\n✅ All links are working!');
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Link check failed:', error);
      process.exit(1);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/');
    return response.ok;
  } catch {
    return false;
  }
}

// Run link check
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Development server not running on localhost:5000');
    console.log('Please run: npm run dev');
    process.exit(1);
  }

  const checker = new LinkChecker();
  await checker.run();
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export default LinkChecker;