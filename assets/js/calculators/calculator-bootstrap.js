/**
 * Calculator Bootstrap Script
 * Common functionality for all calculator pages
 */

/**
 * Toggle search functionality
 */
function toggleSearch() {
  // Simple search redirect for now
  window.location.href = '/blog/';
}

/**
 * Boot calculator with specific type and configuration
 * @param {string} calculatorType - The type of calculator to load
 * @param {object} calculatorModule - The calculator module
 */
async function bootCalculatorPage(calculatorType, calculatorModule) {
  try {
    // Import the bootCalculator function
    const { bootCalculator } = await import('/assets/js/core/ui.js');

    // Boot the calculator when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bootCalculator(calculatorType, calculatorModule);
      });
    } else {
      bootCalculator(calculatorType, calculatorModule);
    }
  } catch (error) {
    console.error('Failed to boot calculator:', error);

    // Show error message to user
    const loadingElement = document.getElementById('calculator-loading');
    if (loadingElement) {
      loadingElement.innerHTML = '<p style="color: red;">Failed to load calculator. Please refresh the page.</p>';
    }
  }
}

// Make functions available globally
window.toggleSearch = toggleSearch;
window.bootCalculatorPage = bootCalculatorPage;