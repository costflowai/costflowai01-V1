// Blog search functionality using Lunr.js
// Provides real-time search for blog posts and calculators

class BlogSearch {
  constructor() {
    this.searchIndex = null;
    this.searchData = null;
    this.lunrIndex = null;
    this.isLoaded = false;
    this.searchInput = null;
    this.searchResults = null;
    this.searchForm = null;
    this.debounceTimer = null;
  }

  /**
   * Initialize search functionality
   */
  async init() {
    try {
      // Find search elements
      this.searchInput = document.getElementById('blog-search');
      this.searchResults = document.getElementById('search-results');
      this.searchForm = document.querySelector('.search-form');

      if (!this.searchInput || !this.searchResults) {
        console.log('Search elements not found, skipping search initialization');
        return;
      }

      // Load Lunr.js
      await this.loadLunr();

      // Load search data
      await this.loadSearchData();

      // Build search index
      this.buildSearchIndex();

      // Setup event listeners
      this.setupEventListeners();

      this.isLoaded = true;
      console.log('Blog search initialized successfully');

    } catch (error) {
      console.error('Failed to initialize blog search:', error);
    }
  }

  /**
   * Load Lunr.js library
   */
  async loadLunr() {
    return new Promise((resolve, reject) => {
      if (window.lunr) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = '/vendor/lunr/lunr.min.js';
      script.async = true;

      script.onload = () => {
        if (window.lunr) {
          resolve();
        } else {
          reject(new Error('Lunr failed to load'));
        }
      };

      script.onerror = () => reject(new Error('Failed to load Lunr script'));

      document.head.appendChild(script);
    });
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
   * Build Lunr search index
   */
  buildSearchIndex() {
    if (!window.lunr || !this.searchData) {
      throw new Error('Cannot build search index: missing dependencies');
    }

    this.lunrIndex = window.lunr(function () {
      // Configure fields and their boost values
      this.field('title', { boost: 10 });
      this.field('headings', { boost: 5 });
      this.field('excerpt', { boost: 3 });
      this.field('content', { boost: 1 });
      this.field('tags', { boost: 8 });
      this.field('category', { boost: 6 });

      // Use the ID as the document reference
      this.ref('id');

      // Add documents to the index
      this.searchData.items.forEach(item => {
        this.add({
          id: item.id,
          title: item.title,
          headings: item.headings || '',
          excerpt: item.excerpt,
          content: item.content,
          tags: item.tags.join(' '),
          category: item.category
        });
      }, this);
    }.bind(this));

    console.log('Search index built successfully');
  }

  /**
   * Setup event listeners for search
   */
  setupEventListeners() {
    // Search input with debouncing
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      // Clear previous timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Debounce search to avoid too many requests
      this.debounceTimer = setTimeout(() => {
        if (query.length >= 2) {
          this.performSearch(query);
        } else {
          this.clearResults();
        }
      }, 300);
    });

    // Form submission
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.searchInput.value.trim();
      if (query.length >= 2) {
        this.performSearch(query);
      }
    });

    // Clear results when input is empty
    this.searchInput.addEventListener('blur', () => {
      // Delay clearing to allow for click events on results
      setTimeout(() => {
        if (!this.searchInput.value.trim()) {
          this.clearResults();
        }
      }, 200);
    });

    // Handle keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  /**
   * Perform search using Lunr
   */
  performSearch(query) {
    if (!this.isLoaded || !this.lunrIndex) {
      console.warn('Search not ready');
      return;
    }

    try {
      // Perform fuzzy search with Lunr
      const results = this.lunrIndex.search(query);

      // Get full item data for results
      const searchResults = results.map(result => {
        const item = this.searchData.items.find(item => item.id === result.ref);
        return {
          ...item,
          score: result.score,
          matchData: result.matchData
        };
      });

      this.displayResults(searchResults, query);

    } catch (error) {
      console.error('Search error:', error);
      this.displayError('Search failed. Please try again.');
    }
  }

  /**
   * Display search results
   */
  displayResults(results, query) {
    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${this.escapeHtml(query)}"</p>
          <p class="search-suggestion">Try different keywords or browse our <a href="/calculators">calculators</a>.</p>
        </div>
      `;
      this.searchResults.classList.add('visible');
      return;
    }

    const resultsHtml = results.slice(0, 8).map((result, index) => {
      const highlightedTitle = this.highlightSearchTerms(result.title, query);
      const highlightedExcerpt = this.highlightSearchTerms(result.excerpt, query);

      return `
        <div class="search-result" data-index="${index}">
          <h3 class="search-result-title">
            <a href="${result.url}">${highlightedTitle}</a>
          </h3>
          <p class="search-result-excerpt">${highlightedExcerpt}</p>
          <div class="search-result-meta">
            <span class="search-result-category">${result.category}</span>
            ${result.tags.length > 0 ? `
              <span class="search-result-tags">
                ${result.tags.slice(0, 3).map(tag => `<span class="tag-mini">${tag}</span>`).join('')}
              </span>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.searchResults.innerHTML = `
      <div class="search-results-header">
        <p>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${this.escapeHtml(query)}"</p>
      </div>
      <div class="search-results-list">
        ${resultsHtml}
      </div>
    `;

    this.searchResults.classList.add('visible');

    // Setup click handlers for results
    this.setupResultClickHandlers();
  }

  /**
   * Display error message
   */
  displayError(message) {
    this.searchResults.innerHTML = `
      <div class="search-error">
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
    this.searchResults.classList.add('visible');
  }

  /**
   * Clear search results
   */
  clearResults() {
    this.searchResults.innerHTML = '';
    this.searchResults.classList.remove('visible');
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
   * Handle keyboard navigation in search results
   */
  handleKeyboardNavigation(e) {
    const results = this.searchResults.querySelectorAll('.search-result');
    if (results.length === 0) return;

    let selectedIndex = -1;
    const selected = this.searchResults.querySelector('.search-result.selected');

    if (selected) {
      selectedIndex = parseInt(selected.dataset.index);
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % results.length;
        this.selectResult(selectedIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
        this.selectResult(selectedIndex);
        break;

      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const link = results[selectedIndex].querySelector('a');
          if (link) link.click();
        }
        break;

      case 'Escape':
        this.clearResults();
        this.searchInput.blur();
        break;
    }
  }

  /**
   * Select a search result for keyboard navigation
   */
  selectResult(index) {
    const results = this.searchResults.querySelectorAll('.search-result');

    // Remove previous selection
    results.forEach(result => result.classList.remove('selected'));

    // Add selection to new result
    if (index >= 0 && index < results.length) {
      results[index].classList.add('selected');
      results[index].scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Setup click handlers for search results
   */
  setupResultClickHandlers() {
    const results = this.searchResults.querySelectorAll('.search-result a');

    results.forEach(link => {
      link.addEventListener('click', () => {
        // Track search result clicks if analytics is available
        if (window.gtag) {
          window.gtag('event', 'search_result_click', {
            search_term: this.searchInput.value,
            result_url: link.href
          });
        }
      });
    });
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
  const search = new BlogSearch();
  search.init();

  // Make search available globally for debugging
  window.blogSearch = search;
});

export { BlogSearch };