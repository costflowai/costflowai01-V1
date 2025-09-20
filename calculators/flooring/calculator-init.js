/**
 * Flooring Calculator Initialization
 * External script for flooring calculator page
 */

// Import and boot the flooring calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the flooring calculator module
    const calculator = await import('/assets/js/calculators/flooring.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('flooring', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize flooring calculator:', error);
  }
})();
