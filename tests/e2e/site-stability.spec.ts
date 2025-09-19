/**
 * Site stability tests - ZERO console errors/warnings allowed
 * Tests critical pages for production cleanliness
 */

import { test, expect } from '@playwright/test';

test.describe('Site Stability - Zero Console Errors', () => {

  test('Homepage (/) loads with ZERO console errors/warnings', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    // Capture all console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow time for all modules to load
    await page.waitForTimeout(2000);

    // Filter for errors and warnings
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');

    // STRICT: No errors or warnings allowed
    expect(errors, `Console errors found: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Console warnings found: ${JSON.stringify(warnings)}`).toEqual([]);

    // Verify page content loaded
    await expect(page.locator('h1')).toContainText('Professional Construction Cost Estimation');
  });

  test('Blog index (/blog/) loads with ZERO console errors/warnings', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');

    expect(errors, `Blog console errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Blog console warnings: ${JSON.stringify(warnings)}`).toEqual([]);

    // Verify blog content
    await expect(page.locator('.blog-container')).toBeVisible();

    // Verify blog CSS loaded properly
    const blogHeader = page.locator('.blog-header');
    await expect(blogHeader).toBeVisible();
  });

  test('Calculator page (/calculators/masonry/) loads with ZERO console errors/warnings', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    await page.goto('/calculators/masonry/');
    await page.waitForLoadState('networkidle');

    // Allow extra time for dynamic calculator import
    await page.waitForTimeout(3000);

    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');

    expect(errors, `Calculator console errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Calculator console warnings: ${JSON.stringify(warnings)}`).toEqual([]);

    // Verify calculator loaded (not stuck on "Loading...")
    const appContainer = page.locator('#app');
    await expect(appContainer).toBeVisible();

    // Should NOT show loading message
    await expect(page.locator('text=Loading calculator...')).not.toBeVisible();
  });

  test('Search functionality works without errors on homepage', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test search functionality
    const searchInput = page.locator('#site-search');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('concrete');
    await page.waitForTimeout(500);

    // Verify search dropdown appears
    const searchResults = page.locator('#search-results');
    await expect(searchResults).not.toHaveClass(/hidden/);

    // No console errors during search
    expect(consoleMessages, `Search console errors: ${JSON.stringify(consoleMessages)}`).toEqual([]);
  });

  test('Blog stylesheet returns 200 and styles applied', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];
    const failedRequests: Array<{ url: string; status: number }> = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('/blog/');
    await page.waitForLoadState('networkidle');

    // Check for failed asset requests
    const cssFailures = failedRequests.filter(req => req.url.includes('blog.css'));
    expect(cssFailures, `Blog CSS failed requests: ${JSON.stringify(cssFailures)}`).toEqual([]);

    // Verify styles are applied
    const blogContainer = page.locator('.blog-container');
    const containerStyles = await blogContainer.evaluate(el => getComputedStyle(el));
    expect(containerStyles.maxWidth).toBe('1200px');

    expect(consoleMessages).toEqual([]);
  });

  test('All pages have proper meta tags and no CSP violations', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];
    const cspViolations: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: text
        });

        // Specifically track CSP violations
        if (text.includes('Content Security Policy') || text.includes('CSP')) {
          cspViolations.push(text);
        }
      }
    });

    const testPages = ['/', '/blog/', '/calculators/masonry/'];

    for (const pageUrl of testPages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify basic meta tags exist
      const title = await page.locator('title').textContent();
      expect(title).toContain('CostFlowAI');

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
    }

    // ZERO CSP violations allowed
    expect(cspViolations, `CSP violations found: ${JSON.stringify(cspViolations)}`).toEqual([]);
    expect(consoleMessages, `Console errors across pages: ${JSON.stringify(consoleMessages)}`).toEqual([]);
  });

  test('Performance monitoring works without errors', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];
    const performanceLogs: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
      } else if (msg.text().includes('Page load time')) {
        performanceLogs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Allow performance monitoring to run

    // Should have performance logging
    expect(performanceLogs.length).toBeGreaterThan(0);
    expect(performanceLogs[0]).toMatch(/Page load time: \d+ms/);

    // No console errors
    expect(consoleMessages).toEqual([]);
  });

});