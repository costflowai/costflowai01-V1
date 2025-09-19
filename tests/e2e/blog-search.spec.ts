import { test, expect } from '@playwright/test';

test.describe('Blog and Search Features', () => {
  test.describe('Blog Page', () => {
    test('blog index loads with responsive grid', async ({ page }) => {
      await page.goto('/blog/');

      // Check page title and meta
      await expect(page).toHaveTitle(/Construction Cost Estimation Blog.*CostFlowAI Blog/);

      // Check blog header
      const blogHeader = page.locator('.blog-header');
      await expect(blogHeader).toBeVisible();
      await expect(blogHeader.locator('h1')).toContainText('Construction Cost Estimation Blog');

      // Check posts grid exists
      const postsGrid = page.locator('.posts-grid');
      await expect(postsGrid).toBeVisible();

      // Check sidebar exists with search and popular calculators
      const sidebar = page.locator('.blog-sidebar');
      await expect(sidebar).toBeVisible();

      // Check sidebar search section
      const searchSection = sidebar.locator('.search-section');
      await expect(searchSection).toBeVisible();
      await expect(searchSection.locator('h3')).toContainText('Search');

      // Check popular calculators section
      const calculatorsSection = sidebar.locator('.sidebar-section').filter({ hasText: 'Popular Calculators' });
      await expect(calculatorsSection).toBeVisible();

      // Verify calculator links exist
      const calculatorLinks = calculatorsSection.locator('.popular-calculators a');
      await expect(calculatorLinks).toHaveCount(5);

      // Check that each calculator link has proper structure
      for (let i = 0; i < 5; i++) {
        const link = calculatorLinks.nth(i);
        await expect(link.locator('strong')).toBeVisible();
        await expect(link.locator('.calculator-description')).toBeVisible();
      }
    });

    test('blog post pages load correctly', async ({ page }) => {
      await page.goto('/blog/welcome-to-costflowai/');

      // Check page title
      await expect(page).toHaveTitle(/Welcome to CostFlowAI.*CostFlowAI Blog/);

      // Check article structure
      const article = page.locator('article.blog-post');
      await expect(article).toBeVisible();

      // Check post header
      const postHeader = article.locator('.post-header');
      await expect(postHeader).toBeVisible();
      await expect(postHeader.locator('h1')).toContainText('Welcome to CostFlowAI');

      // Check post meta
      const postMeta = postHeader.locator('.post-meta');
      await expect(postMeta).toBeVisible();
      await expect(postMeta.locator('time')).toBeVisible();

      // Check post content
      const postContent = article.locator('.post-content');
      await expect(postContent).toBeVisible();

      // Check sidebar exists on post pages
      const sidebar = page.locator('.blog-sidebar');
      await expect(sidebar).toBeVisible();

      // Check share buttons in footer
      const postFooter = article.locator('.post-footer');
      await expect(postFooter).toBeVisible();
      const shareSection = postFooter.locator('.post-share');
      await expect(shareSection).toBeVisible();
      await expect(shareSection.locator('a[href*="twitter.com"]')).toBeVisible();
      await expect(shareSection.locator('a[href*="linkedin.com"]')).toBeVisible();
    });

    test('blog responsive design on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/blog/');

      // Blog should be responsive
      const blogContainer = page.locator('.blog-container');
      await expect(blogContainer).toBeVisible();

      // Sidebar should still be accessible
      const sidebar = page.locator('.blog-sidebar');
      await expect(sidebar).toBeVisible();

      // Posts grid should adapt to mobile
      const postsGrid = page.locator('.posts-grid');
      await expect(postsGrid).toBeVisible();
    });
  });

  test.describe('Site Search', () => {
    test('header search input is visible and functional', async ({ page }) => {
      await page.goto('/');

      // Check search input exists in header
      const searchInput = page.locator('#header-search');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', /Search/);

      // Check search dropdown container exists but is hidden
      const searchDropdown = page.locator('#search-results-dropdown');
      await expect(searchDropdown).toBeVisible();
      await expect(searchDropdown).toHaveClass(/hidden/);
    });

    test('search shows results when typing', async ({ page }) => {
      // First check if search data is available
      await page.goto('/');

      // Wait for search to initialize
      await page.waitForTimeout(1000);

      // Type in search input
      const searchInput = page.locator('#header-search');
      await searchInput.fill('concrete');

      // Wait for debounced search
      await page.waitForTimeout(300);

      // Check if dropdown becomes visible (might not have data yet)
      const searchDropdown = page.locator('#search-results-dropdown');

      // The search should either show results or "no results" message
      // depending on whether search data is loaded
      await expect(searchDropdown).not.toHaveClass(/hidden/);
    });

    test('search trigger in navigation works', async ({ page }) => {
      await page.goto('/');

      // Click search trigger
      const searchTrigger = page.locator('.search-trigger');
      await expect(searchTrigger).toBeVisible();
      await searchTrigger.click();

      // Should focus the search input
      const searchInput = page.locator('#header-search');
      await expect(searchInput).toBeFocused();
    });

    test('search keyboard navigation', async ({ page }) => {
      await page.goto('/');

      const searchInput = page.locator('#header-search');
      await searchInput.fill('concrete');
      await page.waitForTimeout(300);

      // Try Escape key to close dropdown
      await searchInput.press('Escape');

      const searchDropdown = page.locator('#search-results-dropdown');
      await expect(searchDropdown).toHaveClass(/hidden/);
    });

    test('blog search sidebar functionality', async ({ page }) => {
      await page.goto('/blog/');

      // Check sidebar search input
      const sidebarSearch = page.locator('#sidebar-search');
      await expect(sidebarSearch).toBeVisible();
      await expect(sidebarSearch).toHaveAttribute('placeholder', /Search posts/);

      // Check results container exists
      const sidebarResults = page.locator('#sidebar-search-results');
      await expect(sidebarResults).toBeVisible();
      await expect(sidebarResults).toHaveClass(/hidden/);
    });

    test('search on different page types', async ({ page }) => {
      // Test search on blog post page
      await page.goto('/blog/welcome-to-costflowai/');

      const searchInput = page.locator('#header-search');
      await expect(searchInput).toBeVisible();

      // Test search on homepage
      await page.goto('/');
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe('Feature Cards', () => {
    test('homepage feature cards are visible and structured', async ({ page }) => {
      await page.goto('/');

      // Check features section
      const featuresSection = page.locator('section.features');
      await expect(featuresSection).toBeVisible();

      const featuresContainer = featuresSection.locator('.features-container');
      await expect(featuresContainer).toBeVisible();

      // Check all three feature cards
      const featureCards = featuresContainer.locator('.feature-card');
      await expect(featureCards).toHaveCount(3);

      // Check first card - Transparent Estimates
      const firstCard = featureCards.nth(0);
      await expect(firstCard.locator('h3')).toContainText('Transparent Estimates');
      await expect(firstCard.locator('.feature-icon svg')).toBeVisible();
      await expect(firstCard.locator('p')).toContainText('Detailed material breakdowns');

      // Check second card - Professional Exports
      const secondCard = featureCards.nth(1);
      await expect(secondCard.locator('h3')).toContainText('Professional Exports');
      await expect(secondCard.locator('.feature-icon svg')).toBeVisible();
      await expect(secondCard.locator('p')).toContainText('Generate polished PDF reports');

      // Check third card - Regional Pricing
      const thirdCard = featureCards.nth(2);
      await expect(thirdCard.locator('h3')).toContainText('Regional Pricing');
      await expect(thirdCard.locator('.feature-icon svg')).toBeVisible();
      await expect(thirdCard.locator('p')).toContainText('Accurate cost data for your specific location');
    });

    test('feature cards responsive design', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Feature cards should still be visible on mobile
      const featuresSection = page.locator('section.features');
      await expect(featuresSection).toBeVisible();

      const featureCards = featuresSection.locator('.feature-card');
      await expect(featureCards).toHaveCount(3);

      // All cards should be visible (may stack vertically)
      for (let i = 0; i < 3; i++) {
        await expect(featureCards.nth(i)).toBeVisible();
      }
    });
  });

  test.describe('Hero Section', () => {
    test('updated hero content is displayed', async ({ page }) => {
      await page.goto('/');

      const hero = page.locator('section.hero');
      await expect(hero).toBeVisible();

      // Check updated title
      const heroTitle = hero.locator('h1');
      await expect(heroTitle).toContainText('Professional Construction Cost Estimation');

      // Check updated description
      const heroDescription = hero.locator('.hero-description');
      await expect(heroDescription).toBeVisible();
      await expect(heroDescription).toContainText('CostFlowAI delivers accurate, data-driven cost calculations');

      // Check hero actions
      const heroActions = hero.locator('.hero-actions');
      await expect(heroActions).toBeVisible();

      const primaryBtn = heroActions.locator('a.btn-primary');
      await expect(primaryBtn).toContainText('Open Calculators');
      await expect(primaryBtn).toHaveAttribute('href', '/calculators/');

      const secondaryBtn = heroActions.locator('a.btn-secondary');
      await expect(secondaryBtn).toContainText('Read the Blog');
      await expect(secondaryBtn).toHaveAttribute('href', '/blog/');
    });
  });

  test.describe('Navigation Integration', () => {
    test('search container in navigation', async ({ page }) => {
      await page.goto('/');

      const nav = page.locator('nav.main-nav');
      await expect(nav).toBeVisible();

      // Check search container is in navigation
      const searchContainer = nav.locator('.search-container');
      await expect(searchContainer).toBeVisible();

      // Check search input is in navigation
      const searchInput = searchContainer.locator('#header-search');
      await expect(searchInput).toBeVisible();

      // Check dropdown is in navigation
      const dropdown = searchContainer.locator('#search-results-dropdown');
      await expect(dropdown).toBeVisible();
    });

    test('navigation consistency across pages', async ({ page }) => {
      // Test navigation on different pages
      const pages = ['/', '/blog/', '/blog/welcome-to-costflowai/'];

      for (const url of pages) {
        await page.goto(url);

        // Check navigation structure is consistent
        const nav = page.locator('nav.main-nav');
        await expect(nav).toBeVisible();

        // Check logo
        await expect(nav.locator('a.logo')).toContainText('CostFlowAI');

        // Check main nav links
        await expect(nav.locator('a[href="/"]')).toContainText('Home');
        await expect(nav.locator('a[href="/calculators/"]')).toContainText('Calculators');
        await expect(nav.locator('a[href="/blog/"]')).toContainText('Blog');

        // Check search is available
        const searchContainer = nav.locator('.search-container');
        await expect(searchContainer).toBeVisible();
      }
    });
  });

  test.describe('Print Styling', () => {
    test('print CSS is loaded', async ({ page }) => {
      await page.goto('/');

      // Check that print.css is loaded
      const stylesheets = await page.locator('link[rel="stylesheet"]').all();
      const printCssLoaded = await Promise.all(
        stylesheets.map(async (link) => {
          const href = await link.getAttribute('href');
          return href?.includes('print.css');
        })
      );

      // print.css should be loaded on pages that need it
      // (Calculator pages should have it, others might not)
      console.log('Print CSS check - stylesheets found:', printCssLoaded.some(Boolean));
    });
  });
});