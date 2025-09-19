/**
 * CSP-compliant calculator page loader
 * Dynamically imports calculator modules based on data-calc-id
 */

class CalculatorPageLoader {
  constructor() {
    this.loadingElement = null;
    this.appContainer = null;
  }

  /**
   * Initialize calculator loading
   */
  async init() {
    try {
      // Find the app container
      this.appContainer = document.getElementById('app');
      if (!this.appContainer) {
        throw new Error('Calculator app container not found');
      }

      // Get calculator ID from data attribute
      const calculatorId = this.appContainer.dataset.calcId;
      if (!calculatorId) {
        throw new Error('Calculator ID not specified in data-calc-id');
      }

      // Show loading state
      this.showLoading(`Loading ${calculatorId} calculator...`);

      // Dynamic import of calculator module
      await this.loadCalculator(calculatorId);

    } catch (error) {
      console.error('Calculator loading error:', error);
      this.showError(error.message);
    }
  }

  /**
   * Show loading state
   */
  showLoading(message) {
    if (this.appContainer) {
      this.appContainer.innerHTML = `
        <div class="calculator-loading">
          <div class="loading-spinner"></div>
          <p>${message}</p>
        </div>
      `;
    }
  }

  /**
   * Show error state
   */
  showError(message) {
    if (this.appContainer) {
      this.appContainer.innerHTML = `
        <div class="calculator-error">
          <h2>Calculator Load Error</h2>
          <p>We're sorry, but there was an issue loading this calculator.</p>
          <p class="error-details">${message}</p>
          <div class="error-actions">
            <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
            <a href="/calculators/" class="btn btn-secondary">Browse Calculators</a>
          </div>
        </div>
      `;
    }
  }

  /**
   * Load calculator module
   */
  async loadCalculator(calculatorId) {
    try {
      // Ensure DOM is ready before proceeding
      if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
      }

      const modulePath = `/assets/js/calculators/${calculatorId}.js`;

      // Dynamic import
      const module = await import(modulePath);

      // Boot calculator with the imported module
      if (typeof bootCalculator === 'function') {
        await bootCalculator(calculatorId, module.default || module);
      } else {
        // Fallback: import bootCalculator from ui.js
        const { bootCalculator: boot } = await import('/assets/js/core/ui.js');
        await boot(calculatorId, module.default || module);
      }

    } catch (error) {
      // Enhanced error handling for different failure modes
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`Calculator module "${calculatorId}" not found. Please check if this calculator exists.`);
      } else if (error.message.includes('bootCalculator')) {
        throw new Error(`Calculator "${calculatorId}" loaded but failed to initialize. Please try refreshing the page.`);
      } else {
        throw new Error(`Failed to load calculator "${calculatorId}": ${error.message}`);
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loader = new CalculatorPageLoader();
  loader.init();
});

export default CalculatorPageLoader;