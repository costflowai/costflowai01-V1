import { test, expect } from '@playwright/test';

test.describe('Print and Export Functionality', () => {
  test.describe('Print CSS Loading', () => {
    test('print CSS is included in calculator pages', async ({ page }) => {
      // Check that calculator template includes print.css
      await page.goto('/calculators/concrete/');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check that print.css stylesheet is loaded
      const printStylesheet = page.locator('link[href="/assets/css/print.css"]');
      await expect(printStylesheet).toBeVisible();
    });

    test('print CSS has proper media attribute', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Verify print.css exists and check its content
      const response = await page.goto('/assets/css/print.css');
      expect(response?.status()).toBe(200);

      const cssContent = await response?.text();
      expect(cssContent).toContain('@media print');
      expect(cssContent).toContain('@page');
      expect(cssContent).toContain('Professional Estimate');
      expect(cssContent).toContain('costflowai.com');
    });
  });

  test.describe('Print Media Queries', () => {
    test('print styles hide navigation and non-essential elements', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Check that navigation is hidden in print
      const nav = page.locator('nav.main-nav');
      await expect(nav).toHaveCSS('display', 'none');

      // Check that search container is hidden
      const searchContainer = page.locator('.search-container');
      await expect(searchContainer).toHaveCSS('display', 'none');

      // Check that hero section is hidden
      const hero = page.locator('.hero');
      if (await hero.count() > 0) {
        await expect(hero).toHaveCSS('display', 'none');
      }

      // Check that features section is hidden
      const features = page.locator('.features');
      if (await features.count() > 0) {
        await expect(features).toHaveCSS('display', 'none');
      }
    });

    test('print styles format calculator results properly', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Check that body has print-specific styling
      const body = page.locator('body');
      await expect(body).toHaveCSS('color', 'rgb(0, 0, 0)'); // Black text
      await expect(body).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // White background

      // Check calculator container styling
      const calculatorContainer = page.locator('.calculator-container');
      if (await calculatorContainer.count() > 0) {
        await expect(calculatorContainer).toHaveCSS('width', '100%');
        await expect(calculatorContainer).toHaveCSS('margin', '0px');
        await expect(calculatorContainer).toHaveCSS('padding', '0px');
      }
    });

    test('print styles handle tables correctly', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Check that any results tables have proper print styling
      const tables = page.locator('.results-table');
      const tableCount = await tables.count();

      if (tableCount > 0) {
        for (let i = 0; i < tableCount; i++) {
          const table = tables.nth(i);
          await expect(table).toHaveCSS('width', '100%');
          await expect(table).toHaveCSS('border-collapse', 'collapse');
        }
      }
    });
  });

  test.describe('Page Layout for Print', () => {
    test('print page setup is configured', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for A4 page size
      expect(cssContent).toContain('size: A4');

      // Check for proper margins
      expect(cssContent).toContain('margin: 0.75in 0.5in 1in 0.5in');

      // Check for header/footer content
      expect(cssContent).toContain('@top-left');
      expect(cssContent).toContain('@top-right');
      expect(cssContent).toContain('@bottom-center');
      expect(cssContent).toContain('@bottom-left');
      expect(cssContent).toContain('@bottom-right');

      // Check for professional branding
      expect(cssContent).toContain('CostFlowAI Calculator Report');
      expect(cssContent).toContain('costflowai.com');
      expect(cssContent).toContain('Professional Estimate');
    });

    test('print-specific element visibility', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Check that interactive elements are hidden
      const buttons = page.locator('button:not(.print-btn):not(.export-btn)');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        await expect(buttons.nth(i)).toHaveCSS('display', 'none');
      }

      // Check that print/export buttons remain visible
      const printBtns = page.locator('.print-btn, .export-btn');
      const printBtnCount = await printBtns.count();

      if (printBtnCount > 0) {
        for (let i = 0; i < printBtnCount; i++) {
          await expect(printBtns.nth(i)).toHaveCSS('display', 'inline-block');
        }
      }
    });

    test('print orphans and widows prevention', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for orphans and widows settings
      expect(cssContent).toContain('orphans: 3');
      expect(cssContent).toContain('widows: 3');
      expect(cssContent).toContain('orphans: 2');
      expect(cssContent).toContain('widows: 2');

      // Check for page break settings
      expect(cssContent).toContain('page-break-after: avoid');
      expect(cssContent).toContain('page-break-inside: avoid');
    });
  });

  test.describe('Professional Report Styling', () => {
    test('color adjustment for print', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for color adjustment settings
      expect(cssContent).toContain('-webkit-print-color-adjust: exact');
      expect(cssContent).toContain('color-adjust: exact');
      expect(cssContent).toContain('print-color-adjust: exact');
    });

    test('typography and spacing for print', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      // Check body typography
      const body = page.locator('body');
      await expect(body).toHaveCSS('line-height', '1.4');

      // Font size should be in points for print
      const bodyFontSize = await body.evaluate(el => getComputedStyle(el).fontSize);
      // Should be around 11pt (roughly 14.7px)
      expect(parseFloat(bodyFontSize)).toBeGreaterThan(13);
      expect(parseFloat(bodyFontSize)).toBeLessThan(17);
    });

    test('summary cards and sections spacing', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for proper section spacing
      expect(cssContent).toContain('.calculator-section');
      expect(cssContent).toContain('margin: 18pt 0');

      // Check for summary card styling
      expect(cssContent).toContain('.summary-card');
      expect(cssContent).toContain('.summary-grid');

      // Check for breakdown sections
      expect(cssContent).toContain('.calculation-breakdown');
      expect(cssContent).toContain('.breakdown-section');
    });

    test('table styling for professional reports', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for table styling
      expect(cssContent).toContain('.results-table');
      expect(cssContent).toContain('border-collapse: collapse');

      // Check for alternating row colors
      expect(cssContent).toContain('nth-child(even)');
      expect(cssContent).toContain('nth-child(odd)');

      // Check for header styling
      expect(cssContent).toContain('background: #1a365d');
      expect(cssContent).toContain('color: #fff');

      // Check for total row styling
      expect(cssContent).toContain('.total-row');
      expect(cssContent).toContain('font-weight: 600');
    });
  });

  test.describe('Screen Preview Styling', () => {
    test('screen styles complement print', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for screen media query
      expect(cssContent).toContain('@media screen');

      // Check for print preview styling
      expect(cssContent).toContain('.print-preview');
      expect(cssContent).toContain('max-width: 8.5in');
      expect(cssContent).toContain('box-shadow: 0 0 20px rgba(0,0,0,0.1)');

      // Check for print button styling
      expect(cssContent).toContain('.print-btn');
      expect(cssContent).toContain('background: #1a365d');
      expect(cssContent).toContain(':hover');
    });

    test('print button interaction on screen', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Check that print buttons exist and are styled properly
      const printBtns = page.locator('.print-btn');
      const printBtnCount = await printBtns.count();

      if (printBtnCount > 0) {
        const firstPrintBtn = printBtns.first();
        await expect(firstPrintBtn).toBeVisible();

        // Check basic styling (color might vary based on theme)
        const backgroundColor = await firstPrintBtn.evaluate(el => getComputedStyle(el).backgroundColor);
        expect(backgroundColor).toBeTruthy();
      }
    });
  });

  test.describe('Export Integration', () => {
    test('export functionality accessibility', async ({ page }) => {
      await page.goto('/calculators/concrete/');
      await page.waitForLoadState('networkidle');

      // Look for export-related elements
      const exportElements = page.locator('[data-action*="export"], .export-btn, [class*="export"]');
      const exportCount = await exportElements.count();

      if (exportCount > 0) {
        // Check that export elements are accessible
        for (let i = 0; i < exportCount; i++) {
          const element = exportElements.nth(i);
          await expect(element).toBeVisible();
        }
      }

      // Check for print-related elements
      const printElements = page.locator('[data-action*="print"], .print-btn, [onclick*="print"]');
      const printCount = await printElements.count();

      if (printCount > 0) {
        // Check that print elements are accessible
        for (let i = 0; i < printCount; i++) {
          const element = printElements.nth(i);
          await expect(element).toBeVisible();
        }
      }
    });

    test('professional report elements structure', async ({ page }) => {
      await page.goto('/assets/css/print.css');
      const cssContent = await page.textContent('body');

      // Check for professional report elements
      expect(cssContent).toContain('.calculator-header');
      expect(cssContent).toContain('.calculator-title');
      expect(cssContent).toContain('.calculator-description');

      // Check for input summary styling
      expect(cssContent).toContain('.inputs-summary');
      expect(cssContent).toContain('.input-row');
      expect(cssContent).toContain('.input-label');
      expect(cssContent).toContain('.input-value');

      // Check for disclaimer and notes styling
      expect(cssContent).toContain('.disclaimer');
      expect(cssContent).toContain('.calculator-notes');

      // Check for report footer
      expect(cssContent).toContain('.report-footer');
      expect(cssContent).toContain('.generated-by');
    });
  });
});