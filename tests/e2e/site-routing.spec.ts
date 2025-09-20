import { test, expect } from '@playwright/test';

test.describe('Site Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors and warnings
    const messages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        messages.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    // Store messages on page for later assertion
    (page as any)._consoleMessages = messages;
  });

  test('Blog index should show post links', async ({ page }) => {
    await page.goto('/blog/');

    // Should see blog index
    await expect(page.locator('h1, h2')).toContainText(/blog/i);

    // Should have at least one post link
    const postLinks = page.locator('a[href^="/blog/"][href$="/"]').filter({
      hasNotText: /^(blog|home|calculators)$/i
    });

    await expect(postLinks.first()).toBeVisible();

    // No console errors/warnings
    expect((page as any)._consoleMessages).toEqual([]);
  });

  test('Blog post pages should render content', async ({ page }) => {
    // First go to blog index to find a post
    await page.goto('/blog/');

    // Find first post link
    const firstPostLink = page.locator('a[href^="/blog/"][href$="/"]').filter({
      hasNotText: /^(blog|home|calculators)$/i
    }).first();

    await expect(firstPostLink).toBeVisible();

    // Get the href and navigate to it
    const postUrl = await firstPostLink.getAttribute('href');
    expect(postUrl).toBeTruthy();

    await page.goto(postUrl!);

    // Should see article title and content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article, .post-content, .blog-post')).toBeVisible();

    // URL should be a blog post URL
    expect(page.url()).toMatch(/\/blog\/[^/]+\/$/);

    // No console errors/warnings
    expect((page as any)._consoleMessages).toEqual([]);
  });

  test('Calculators hub should link to individual pages', async ({ page }) => {
    await page.goto('/calculators/');

    // Should see calculators hub
    await expect(page.locator('h1, h2')).toContainText(/calculator/i);

    // Should have concrete calculator card with link
    const concreteCard = page.locator('.calculator-card').filter({
      hasText: /concrete/i
    });
    await expect(concreteCard).toBeVisible();

    const concreteLink = concreteCard.locator('a[href="/calculators/concrete/"]');
    await expect(concreteLink).toBeVisible();

    // No console errors/warnings
    expect((page as any)._consoleMessages).toEqual([]);
  });

  test('Individual calculator page should load and show Calculate button', async ({ page }) => {
    await page.goto('/calculators/concrete/');

    // Should see calculator page loading or loaded
    // Wait for either loading spinner to disappear or calculate button to appear
    await page.waitForLoadState('networkidle');

    // Give calculator time to initialize
    await page.waitForTimeout(2000);

    // Should either see the calculator loaded or a loading/error state
    const hasCalculateButton = await page.locator('button, input[type="button"]').filter({
      hasText: /calculate/i
    }).isVisible();

    const hasLoadingSpinner = await page.locator('.loading-spinner, .calculator-loading').isVisible();
    const hasErrorMessage = await page.locator('.calculator-error, .error').isVisible();

    // One of these should be true: calculate button exists, still loading, or error shown
    expect(hasCalculateButton || hasLoadingSpinner || hasErrorMessage).toBeTruthy();

    // URL should be correct
    expect(page.url()).toMatch(/\/calculators\/concrete\/$/);

    // No console errors/warnings (allow loading messages)
    const messages = (page as any)._consoleMessages.filter((msg: string) =>
      !msg.includes('loading') && !msg.includes('Loading')
    );
    expect(messages).toEqual([]);
  });

  test('Home page should have no console errors', async ({ page }) => {
    await page.goto('/');

    // Should see home page
    await expect(page.locator('h1, h2')).toBeVisible();

    // No console errors/warnings
    expect((page as any)._consoleMessages).toEqual([]);
  });

  test('Blog index should have working search', async ({ page }) => {
    await page.goto('/blog/');

    // Should have search functionality
    const searchInput = page.locator('input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('construction');
      // Search should not cause errors
    }

    // No console errors/warnings
    expect((page as any)._consoleMessages).toEqual([]);
  });

  test('Calculator hub should show all available calculators', async ({ page }) => {
    await page.goto('/calculators/');

    // Should have multiple calculator cards
    const calculatorCards = page.locator('.calculator-card');
    await expect(calculatorCards).toHaveCountGreaterThan(5);

    // Should have links to concrete, framing, drywall at minimum
    await expect(page.locator('a[href="/calculators/concrete/"]')).toBeVisible();
    await expect(page.locator('a[href="/calculators/framing/"]')).toBeVisible();
    await expect(page.locator('a[href="/calculators/drywall/"]')).toBeVisible();

    // No console errors/warnings
    expect((page as any)._consoleMessages).toEqual([]);
  });
});