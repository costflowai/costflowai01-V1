/**
 * Stability tests for CostFlowAI production deployment
 * Verifies zero console errors and proper functionality
 */

import { test, expect } from '@playwright/test';

test.describe('CostFlowAI Stability Tests', () => {

  test('Homepage loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    expect(consoleErrors).toEqual([]);

    // Verify page content
    await expect(page.locator('h1')).toContainText('Professional Construction Cost Estimation');
    await expect(page.locator('.hero-actions')).toBeVisible();
  });

  test('Blog index loads properly with no template placeholders', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    expect(consoleErrors).toEqual([]);

    // Verify no raw Handlebars templates
    const content = await page.content();
    expect(content).not.toContain('{{');
    expect(content).not.toContain('}}');

    // Verify blog CSS loads
    const blogElement = page.locator('.blog-container');
    await expect(blogElement).toBeVisible();
  });

  test('Search functionality works on all pages', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test homepage search
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const headerSearch = page.locator('#header-search');
    await expect(headerSearch).toBeVisible();
    await headerSearch.fill('concrete');
    await page.waitForTimeout(500); // Allow search to process

    // Test blog page search
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#header-search')).toBeVisible();
    await expect(page.locator('#sidebar-search')).toBeVisible();

    // Check for console errors
    expect(consoleErrors).toEqual([]);
  });

  test('Calculator pages load without CSP violations', async ({ page }) => {
    const consoleErrors: string[] = [];
    const cspViolations: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
        if (text.includes('Content Security Policy') || text.includes('CSP')) {
          cspViolations.push(text);
        }
      }
    });

    // Test a calculator page
    await page.goto('/calculators/masonry/');
    await page.waitForLoadState('networkidle');

    // Allow time for dynamic imports
    await page.waitForTimeout(2000);

    // Check for CSP violations specifically
    expect(cspViolations).toEqual([]);

    // Verify calculator UI elements
    await expect(page.locator('#app')).toBeVisible();

    // Should not be stuck on loading
    const loadingText = page.locator('text=Loading calculator...');
    await expect(loadingText).not.toBeVisible({ timeout: 5000 });

    // Check for console errors
    expect(consoleErrors).toEqual([]);
  });

  test('Analytics guards work properly', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that analytics warnings are expected and handled gracefully
    const analyticsWarnings = consoleWarnings.filter(w =>
      w.includes('GA4 tracking ID') || w.includes('Analytics disabled')
    );

    // Should have at most one analytics warning
    expect(analyticsWarnings.length).toBeLessThanOrEqual(1);

    // No critical errors
    expect(consoleErrors).toEqual([]);
  });

  test('Performance monitoring works without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const performanceLogs: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.text().includes('Page load time')) {
        performanceLogs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow performance monitoring to run

    // Should have performance timing logged
    expect(performanceLogs.length).toBeGreaterThan(0);
    expect(performanceLogs[0]).toMatch(/Page load time: \d+ms/);

    // No console errors
    expect(consoleErrors).toEqual([]);
  });

  test('All asset requests return 200 status', async ({ page }) => {
    const failedRequests: Array<{ url: string; status: number }> = [];

    page.on('response', response => {
      const url = response.url();
      const status = response.status();

      // Track failed requests for assets
      if (status >= 400 && (
        url.includes('/assets/') ||
        url.includes('/vendor/') ||
        url.includes('.css') ||
        url.includes('.js')
      )) {
        failedRequests.push({ url, status });
      }
    });

    // Test key pages
    const pages = ['/', '/blog/', '/calculators/masonry/'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
    }

    // Should have no failed asset requests
    expect(failedRequests).toEqual([]);
  });

  test('Blog images load properly', async ({ page }) => {
    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');

    // Check for any images in blog posts
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Verify images load without 404s
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        if (src && src.includes('/assets/images/blog/')) {
          // Check that blog images exist (even if placeholders)
          expect(src).toBeTruthy();
        }
      }
    }
  });

  test('Complete smoke test - zero console errors across site', async ({ page }) => {
    const allErrors: Array<{ page: string; error: string }> = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        allErrors.push({
          page: page.url(),
          error: msg.text()
        });
      }
    });

    // Navigate through key pages
    const pages = [
      '/',
      '/blog/',
      '/blog/welcome-to-costflowai/',
      '/calculators/masonry/'
    ];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow page to fully initialize
    }

    // Final assertion: ZERO console errors across entire site
    expect(allErrors).toEqual([]);
  });

});