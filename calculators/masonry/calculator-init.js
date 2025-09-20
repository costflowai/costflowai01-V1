/**
 * Masonry Calculator Initialization
 * External script for masonry calculator page
 */

// Import and boot the masonry calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the masonry calculator module
    const calculator = await import('/assets/js/calculators/masonry.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('masonry', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize masonry calculator:', error);
  }
})();
