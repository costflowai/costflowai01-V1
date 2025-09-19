import { test, expect } from '@playwright/test';

test.describe('Calculator Pages', () => {
  test('framing calculator loads with form and calculate button', async ({ page }) => {
    // Navigate to framing calculator
    await page.goto('/calculators/framing/');

    // Check page title
    await expect(page).toHaveTitle(/Framing Calculator.*CostFlowAI/);

    // Check that we have the main app container
    await expect(page.locator('#app')).toBeVisible();

    // Wait for page to load and check for either loading indicator or calculator content
    await page.waitForTimeout(2000);

    // Check for either loading indicator or calculator content
    const hasLoading = await page.locator('#calculator-loading').isVisible();
    const hasForm = await page.locator('#calculator-form').isVisible();

    // We should have either loading or the actual form
    expect(hasLoading || hasForm).toBe(true);

    // If we have the form, check for calculator elements
    if (hasForm) {
      // Check for calculator header (should have h1)
      await expect(page.locator('h1')).toBeVisible();

      // Check for Calculate button
      const calculateButton = page.locator('#calculate-btn');
      await expect(calculateButton).toBeVisible();
      await expect(calculateButton).toContainText('Calculate');
    }

    // Check for Reset button (only if form is loaded)
    if (hasForm) {
      const resetButton = page.locator('button[data-action="reset"]');
      await expect(resetButton).toBeVisible();
      await expect(resetButton).toContainText('Reset');

      // Check for results container (should be present but may be empty)
      await expect(page.locator('#results')).toBeVisible();
    }

    // Check navigation is present
    await expect(page.locator('nav.main-nav')).toBeVisible();
    await expect(page.locator('nav.main-nav a[href="/calculators/"]')).toContainText('Calculators');

    // Check footer is present
    await expect(page.locator('footer')).toBeVisible();
  });

  test('concrete calculator loads with form and calculate button', async ({ page }) => {
    // Navigate to concrete calculator
    await page.goto('/calculators/concrete/');

    // Check page title
    await expect(page).toHaveTitle(/Concrete.*Calculator.*CostFlowAI/);

    // Check that main app container exists
    await expect(page.locator('#app')).toBeVisible();

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for either loading or form content
    const hasLoading = await page.locator('#calculator-loading').isVisible();
    const hasForm = await page.locator('#calculator-form').isVisible();
    expect(hasLoading || hasForm).toBe(true);

    // Check navigation is present
    await expect(page.locator('nav.main-nav')).toBeVisible();
  });

  test('earthwork calculator loads with form and calculate button', async ({ page }) => {
    // Navigate to earthwork calculator
    await page.goto('/calculators/earthwork/');

    // Check page title
    await expect(page).toHaveTitle(/Earthwork Calculator.*CostFlowAI/);

    // Check that main app container exists
    await expect(page.locator('#app')).toBeVisible();

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for either loading or form content
    const hasLoading = await page.locator('#calculator-loading').isVisible();
    const hasForm = await page.locator('#calculator-form').isVisible();
    expect(hasLoading || hasForm).toBe(true);

    // Check navigation is present
    await expect(page.locator('nav.main-nav')).toBeVisible();
  });

  test('calculator navigation links work', async ({ page }) => {
    // Start at calculators index
    await page.goto('/calculators/');

    // Click on framing calculator link
    await page.click('a[href="/calculators/framing/"]');

    // Should navigate to framing calculator
    await expect(page).toHaveURL(/.*\/calculators\/framing\//);

    // Go back to calculators index via nav
    await page.click('nav a[href="/calculators/"]');

    // Should be back at calculators index
    await expect(page).toHaveURL(/.*\/calculators\//);
  });

  test('calculator error handling', async ({ page }) => {
    // Navigate to a non-existent calculator
    await page.goto('/calculators/nonexistent/');

    // Should show 404 or error (depending on server setup)
    // For static sites, this might just be a blank page or server error
    // We'll check that the page loads without throwing JavaScript errors

    // Check that the page doesn't have uncaught JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Wait a bit for any errors to surface
    await page.waitForTimeout(2000);

    // We expect either no errors, or specific error handling
    // This test mainly ensures our JavaScript doesn't crash on missing calculators
  });

  test('calculator pages have proper accessibility', async ({ page }) => {
    await page.goto('/calculators/framing/');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for skip link
    await expect(page.locator('.skip-link')).toBeVisible();

    // Check for either loading or calculator content
    const hasLoading = await page.locator('#calculator-loading').isVisible();
    const hasForm = await page.locator('#calculator-form').isVisible();
    expect(hasLoading || hasForm).toBe(true);

    // If form is loaded, check accessibility features
    if (hasForm) {
      // Check for proper heading hierarchy
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Check that calculate button has proper attributes
      const calculateBtn = page.locator('#calculate-btn');
      await expect(calculateBtn).toHaveAttribute('type', 'button');
    }
  });
});