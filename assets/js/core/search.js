// Sitewide search functionality
// Provides instant search with dropdown results and full search page

import { bus, EVENTS } from './bus.js';

class SiteSearch {
  constructor() {
    this.searchData = null;
    this.isLoaded = false;
    this.searchElements = {
      header: null,
      headerDropdown: null,
      sidebar: null,
      sidebarResults: null
    };
    this.debounceTimer = null;
    this.currentQuery = '';
    this.selectedIndex = -1;
  }

  /**
   * Initialize search functionality
   */
  async init() {
    try {
      // Find search elements
      this.searchElements.header = document.getElementById('header-search');
      this.searchElements.headerDropdown = document.getElementById('search-results-dropdown');
      this.searchElements.sidebar = document.getElementById('sidebar-search');
      this.searchElements.sidebarResults = document.getElementById('sidebar-search-results');

      // Load search data
      await this.loadSearchData();

      // Setup event listeners
      this.setupEventListeners();

      this.isLoaded = true;
      console.log('Site search initialized successfully');

    } catch (error) {
      console.error('Failed to initialize site search:', error);
    }
  }

  /**
   * Load search data from JSON file
   */
  async loadSearchData() {
    try {
      const response = await fetch('/assets/data/search.json');
      if (!response.ok) {
        throw new Error(`Failed to load search data: ${response.status}`);
      }

      this.searchData = await response.json();
      console.log(`Loaded ${this.searchData.count} search items`);

    } catch (error) {
      console.error('Failed to load search data:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for search elements
   */
  setupEventListeners() {
    // Header search
    if (this.searchElements.header) {
      this.searchElements.header.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value, 'header');
      });

      this.searchElements.header.addEventListener('keydown', (e) => {
        this.handleKeyboardNavigation(e, 'header');
      });

      this.searchElements.header.addEventListener('focus', () => {
        if (this.currentQuery) {
          this.showDropdown('header');
        }
      });
    }

    // Sidebar search
    if (this.searchElements.sidebar) {
      this.searchElements.sidebar.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value, 'sidebar');
      });

      this.searchElements.sidebar.addEventListener('keydown', (e) => {
        this.handleKeyboardNavigation(e, 'sidebar');
      });
    }

    // Search trigger
    const searchTrigger = document.querySelector('.search-trigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.focusSearch();
      });
    }

    // Click outside to hide dropdown
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container') && !e.target.closest('.sidebar-search')) {
        this.hideDropdown();
      }
    });
  }

  /**
   * Handle search input with debouncing
   */
  handleSearchInput(query, source) {
    this.currentQuery = query.trim();

    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce search
    this.debounceTimer = setTimeout(() => {
      if (this.currentQuery.length >= 2) {
        this.performSearch(this.currentQuery, source);
      } else {
        this.hideDropdown();
      }
    }, 200);
  }

  /**
   * Perform search and display results
   */
  performSearch(query, source) {
    if (!this.isLoaded || !this.searchData) {
      console.warn('Search not ready');
      return;
    }

    try {
      const results = this.searchItems(query);
      this.displayResults(results, query, source);

      // Emit search event
      bus.emit(EVENTS.SEARCH_PERFORMED, { query, results: results.length, source });

    } catch (error) {
      console.error('Search error:', error);
      this.displayError('Search failed. Please try again.', source);
    }
  }

  /**
   * Search through items
   */
  searchItems(query) {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    const results = [];

    this.searchData.items.forEach(item => {
      let score = 0;
      const itemText = `${item.title} ${item.content} ${item.excerpt} ${item.tags.join(' ')}`.toLowerCase();

      // Calculate relevance score
      searchTerms.forEach(term => {
        if (item.title.toLowerCase().includes(term)) score += 10;
        if (item.excerpt.toLowerCase().includes(term)) score += 5;
        if (item.tags.some(tag => tag.toLowerCase().includes(term))) score += 8;
        if (item.content.toLowerCase().includes(term)) score += 2;
      });

      if (score > 0) {
        results.push({
          ...item,
          score
        });
      }
    });

    // Sort by score and limit results
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Display search results
   */
  displayResults(results, query, source) {
    const maxResults = source === 'header' ? 5 : 8;
    const limitedResults = results.slice(0, maxResults);

    if (limitedResults.length === 0) {
      this.displayNoResults(query, source);
      return;
    }

    const resultsHtml = limitedResults.map((result, index) => {
      const highlightedTitle = this.highlightSearchTerms(result.title, query);
      const highlightedExcerpt = this.highlightSearchTerms(result.excerpt, query);

      return `
        <div class="search-result-item" data-index="${index}" data-url="${result.url}">
          <div class="result-header">
            <h4 class="result-title">${highlightedTitle}</h4>
            <span class="result-category">${result.category}</span>
          </div>
          <p class="result-excerpt">${highlightedExcerpt}</p>
          ${result.tags.length > 0 ? `
            <div class="result-tags">
              ${result.tags.slice(0, 3).map(tag => `<span class="result-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const container = source === 'header' ? this.searchElements.headerDropdown : this.searchElements.sidebarResults;
    if (container) {
      container.innerHTML = `
        <div class="search-results-header">
          <span class="results-count">${results.length} result${results.length !== 1 ? 's' : ''}</span>
          ${results.length > maxResults ? `<a href="/search?q=${encodeURIComponent(query)}" class="view-all-link">View all results</a>` : ''}
        </div>
        <div class="search-results-list">
          ${resultsHtml}
        </div>
      `;

      this.showDropdown(source);
      this.setupResultClickHandlers();
      this.selectedIndex = -1;
    }
  }

  /**
   * Display no results message
   */
  displayNoResults(query, source) {
    const container = source === 'header' ? this.searchElements.headerDropdown : this.searchElements.sidebarResults;
    if (container) {
      container.innerHTML = `
        <div class="no-search-results">
          <p>No results found for "${this.escapeHtml(query)}"</p>
          <p class="search-suggestion">Try different keywords or browse our <a href="/calculators/">calculators</a>.</p>
        </div>
      `;
      this.showDropdown(source);
    }
  }

  /**
   * Display error message
   */
  displayError(message, source) {
    const container = source === 'header' ? this.searchElements.headerDropdown : this.searchElements.sidebarResults;
    if (container) {
      container.innerHTML = `
        <div class="search-error">
          <p>${this.escapeHtml(message)}</p>
        </div>
      `;
      this.showDropdown(source);
    }
  }

  /**
   * Highlight search terms in text
   */
  highlightSearchTerms(text, query) {
    if (!query || !text) return this.escapeHtml(text);

    const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    let highlightedText = this.escapeHtml(text);

    terms.forEach(term => {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboardNavigation(e, source) {
    const container = source === 'header' ? this.searchElements.headerDropdown : this.searchElements.sidebarResults;
    if (!container || container.classList.contains('hidden')) return;

    const results = container.querySelectorAll('.search-result-item');
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
        this.updateSelection(results);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(results);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < results.length) {
          const url = results[this.selectedIndex].dataset.url;
          if (url) {
            window.location.href = url;
          }
        } else {
          // Go to search page
          const query = source === 'header' ? this.searchElements.header.value : this.searchElements.sidebar.value;
          if (query.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
          }
        }
        break;

      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  /**
   * Update visual selection in results
   */
  updateSelection(results) {
    results.forEach((result, index) => {
      result.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  /**
   * Setup click handlers for search results
   */
  setupResultClickHandlers() {
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const url = item.dataset.url;
        if (url) {
          // Track search result clicks if analytics is available
          if (window.gtag) {
            window.gtag('event', 'search_result_click', {
              search_term: this.currentQuery,
              result_url: url
            });
          }

          window.location.href = url;
        }
      });
    });
  }

  /**
   * Show search dropdown
   */
  showDropdown(source) {
    const container = source === 'header' ? this.searchElements.headerDropdown : this.searchElements.sidebarResults;
    if (container) {
      container.classList.remove('hidden');
    }
  }

  /**
   * Hide search dropdown
   */
  hideDropdown() {
    if (this.searchElements.headerDropdown) {
      this.searchElements.headerDropdown.classList.add('hidden');
    }
    if (this.searchElements.sidebarResults) {
      this.searchElements.sidebarResults.classList.add('hidden');
    }
    this.selectedIndex = -1;
  }

  /**
   * Focus search input
   */
  focusSearch() {
    if (this.searchElements.header) {
      this.searchElements.header.focus();
    }
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape regex special characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const search = new SiteSearch();
  search.init();

  // Make search available globally for debugging
  window.siteSearch = search;
});

export { SiteSearch };