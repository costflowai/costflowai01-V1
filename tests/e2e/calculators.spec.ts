import { test, expect } from '@playwright/test';

test.describe('Calculator Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to calculators page
    await page.goto('/calculators/');
    await expect(page).toHaveTitle(/Calculators - CostFlowAI/);
  });

  test('Framing Calculator: 12 ft wall, 8 ft height, 16" oc → studs_total > 10; export CSV exists', async ({ page }) => {
    // Click framing calculator button
    await page.click('[data-calc="framing"]');

    // Wait for calculator window to open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      // The button click is already done above
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveTitle(/Framing Calculator - CostFlowAI/);

    // Fill in test inputs
    await newPage.fill('#wall-length', '12');
    await newPage.fill('#wall-height', '8');
    await newPage.selectOption('#stud-spacing', '16');
    await newPage.fill('#num-walls', '1');

    // Wait for auto-calculation or click calculate
    await newPage.waitForTimeout(500);

    // Verify results are displayed
    await expect(newPage.locator('#results-section')).toBeVisible();

    // Check that total studs > 10
    const totalStudsText = await newPage.locator('tr:has-text("Total Studs") td:last-child').textContent();
    const totalStuds = parseInt(totalStudsText?.trim() || '0');
    expect(totalStuds).toBeGreaterThan(10);

    // Test CSV export
    const downloadPromise = newPage.waitForEvent('download');
    await newPage.click('#export-csv');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('framing-calculation.csv');

    await newPage.close();
  });

  test('Drywall Calculator: 500 sf walls, 200 sf ceiling, 10% waste → sheets > 0; PDF generates', async ({ page }) => {
    // Click drywall calculator button
    await page.click('[data-calc="drywall"]');

    // Wait for calculator window to open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveTitle(/Drywall Calculator - CostFlowAI/);

    // Fill in test inputs
    await newPage.fill('#wall-area', '500');
    await newPage.fill('#ceiling-area', '200');
    await newPage.selectOption('#sheet-size', '4x8');
    await newPage.fill('#waste-percent', '10');

    // Wait for auto-calculation
    await newPage.waitForTimeout(500);

    // Verify results are displayed
    await expect(newPage.locator('#results-section')).toBeVisible();

    // Check that sheets > 0
    const sheetsText = await newPage.locator('tr:has-text("Drywall Sheets") td:last-child').textContent();
    const sheets = parseInt(sheetsText?.trim() || '0');
    expect(sheets).toBeGreaterThan(0);

    // Test PDF export (will open in new window)
    const newPagePromise = newPage.context().waitForEvent('page');
    await newPage.click('#export-pdf');
    const pdfPage = await newPagePromise;
    await pdfPage.waitForLoadState();

    // Check that PDF page contains results
    await expect(pdfPage).toHaveTitle(/Drywall Calculator Results/);

    await pdfPage.close();
    await newPage.close();
  });

  test('Paint Calculator: 600 sf, 2 coats @ 350 sf/gal → gallons ≥ 4; XLSX generates', async ({ page }) => {
    // Click paint calculator button
    await page.click('[data-calc="paint"]');

    // Wait for calculator window to open
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveTitle(/Paint Calculator - CostFlowAI/);

    // Fill in test inputs
    await newPage.fill('#surface-area', '600');
    await newPage.fill('#num-coats', '2');
    await newPage.selectOption('#substrate-type', 'custom');
    await newPage.fill('#coverage-sqft', '350');

    // Wait for auto-calculation
    await newPage.waitForTimeout(500);

    // Verify results are displayed
    await expect(newPage.locator('#results-section')).toBeVisible();

    // Check that gallons ≥ 4
    const gallonsText = await newPage.locator('tr:has-text("Paint Required") td:last-child').textContent();
    const gallons = parseFloat(gallonsText?.replace(/[^\d.]/g, '') || '0');
    expect(gallons).toBeGreaterThanOrEqual(4);

    // Test XLSX export
    const downloadPromise = newPage.waitForEvent('download');
    await newPage.click('#export-xlsx');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('paint-calculation.xlsx');

    await newPage.close();
  });

  test('Hub page has enabled buttons for implemented calculators', async ({ page }) => {
    // Check that framing, drywall, and paint have enabled buttons
    const framingButton = page.locator('[data-calc="framing"]');
    const drywallButton = page.locator('[data-calc="drywall"]');
    const paintButton = page.locator('[data-calc="paint"]');

    await expect(framingButton).toBeEnabled();
    await expect(drywallButton).toBeEnabled();
    await expect(paintButton).toBeEnabled();

    // Check that other calculators still show "Coming Soon"
    const disabledButtons = page.locator('.btn-disabled:has-text("Coming Soon")');
    const disabledCount = await disabledButtons.count();
    expect(disabledCount).toBeGreaterThan(15); // Most calculators should still be disabled
  });

  test('Show Math functionality works', async ({ page }) => {
    // Test with framing calculator
    await page.click('[data-calc="framing"]');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
    ]);

    await newPage.waitForLoadState();

    // Fill in inputs to generate results
    await newPage.fill('#wall-length', '10');
    await newPage.fill('#wall-height', '8');
    await newPage.waitForTimeout(500);

    // Click Show Math button
    await newPage.click('#show-math-btn');

    // Verify math details are visible
    await expect(newPage.locator('#math-details')).toBeVisible();
    await expect(newPage.locator('.math-explanation')).toBeVisible();

    // Verify button text changed
    await expect(newPage.locator('#show-math-btn')).toHaveText('Hide Math');

    // Click again to hide
    await newPage.click('#show-math-btn');
    await expect(newPage.locator('#math-details')).not.toBeVisible();
    await expect(newPage.locator('#show-math-btn')).toHaveText('Show Math');

    await newPage.close();
  });
});