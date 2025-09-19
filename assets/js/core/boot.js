/**
 * Site-wide boot module
 * Initializes core functionality on every page
 */

import { SiteSearch } from './search.js';

// Initialize search functionality
async function initSearch() {
  const search = new SiteSearch();
  await search.init();

  // Make search available globally for debugging (quiet mode)
  if (search.isLoaded) {
    window.siteSearch = search;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize search (will be silent if no search elements present)
  initSearch();
});

export { initSearch };