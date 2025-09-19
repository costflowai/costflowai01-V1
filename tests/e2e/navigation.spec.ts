import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('homepage has proper navigation and hero section', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/CostFlowAI.*Professional Cost Calculation Platform/);

    // Check main navigation exists
    const nav = page.locator('nav.main-nav');
    await expect(nav).toBeVisible();

    // Check navigation links
    await expect(nav.locator('a[href="/"]')).toContainText('Home');
    await expect(nav.locator('a[href="/calculators/"]')).toContainText('Calculators');
    await expect(nav.locator('a[href="/blog/"]')).toContainText('Blog');
    await expect(nav.locator('a:has-text("Search")')).toBeVisible();
    await expect(nav.locator('a[href*="mailto:"]')).toContainText('Contact');

    // Check hero section
    const hero = page.locator('section.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toContainText('Professional Cost Calculation Platform');

    // Check hero buttons
    await expect(hero.locator('a[href="/calculators/"]')).toContainText('Open Calculators');
    await expect(hero.locator('a[href="/blog/"]')).toContainText('Read the Blog');

    // Check development banner
    await expect(page.locator('.banner')).toContainText('under active development');

    // Check footer navigation
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href="/calculators/"]')).toContainText('Calculators');
    await expect(footer.locator('a[href="/blog/"]')).toContainText('Blog');
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/');

    // Click search link
    await page.click('a:has-text("Search")');

    // Check search overlay is visible
    const searchOverlay = page.locator('#search-overlay');
    await expect(searchOverlay).toBeVisible();

    // Check search input is focused
    const searchInput = page.locator('#global-search');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();

    // Close search overlay
    await page.click('button:has-text("Close")');
    await expect(searchOverlay).not.toBeVisible();
  });

  test('calculators page is accessible', async ({ page }) => {
    await page.goto('/');

    // Click calculators link from navigation
    await page.click('nav a[href="/calculators/"]');

    // Should navigate to calculators page
    await expect(page).toHaveURL(/.*\/calculators\//);

    // Go back and try hero button
    await page.goto('/');
    await page.click('section.hero a[href="/calculators/"]');
    await expect(page).toHaveURL(/.*\/calculators\//);
  });

  test('blog page is accessible', async ({ page }) => {
    await page.goto('/');

    // Click blog link from navigation
    await page.click('nav a[href="/blog/"]');

    // Should navigate to blog page
    await expect(page).toHaveURL(/.*\/blog\//);

    // Go back and try hero button
    await page.goto('/');
    await page.click('section.hero a[href="/blog/"]');
    await expect(page).toHaveURL(/.*\/blog\//);
  });

  test('contact link opens email client', async ({ page }) => {
    await page.goto('/');

    // Check contact link has mailto href
    const contactLink = page.locator('nav a[href*="mailto:"]');
    await expect(contactLink).toHaveAttribute('href', /mailto:.*@costflowai\.com/);
  });

  test('responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Navigation should still be visible and functional
    const nav = page.locator('nav.main-nav');
    await expect(nav).toBeVisible();

    // Hero buttons should be stacked/responsive
    const heroActions = page.locator('.hero-actions');
    await expect(heroActions).toBeVisible();
  });

  test('accessibility basics', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);

    // Check for alt text on images (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }

    // Check for proper link text (no "click here" or empty links)
    const links = page.locator('a');
    const linkCount = await links.count();
    for (let i = 0; i < linkCount; i++) {
      const linkText = await links.nth(i).textContent();
      const href = await links.nth(i).getAttribute('href');

      // Skip if it's a mailto link or has meaningful content
      if (href?.startsWith('mailto:') || href?.startsWith('#')) continue;

      expect(linkText?.trim()).toBeTruthy();
      expect(linkText?.toLowerCase()).not.toContain('click here');
      expect(linkText?.toLowerCase()).not.toContain('read more');
    }
  });
});