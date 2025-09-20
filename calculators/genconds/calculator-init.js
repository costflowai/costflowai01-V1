/**
 * Genconds Calculator Initialization
 * External script for genconds calculator page
 */

// Import and boot the genconds calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the genconds calculator module
    const calculator = await import('/assets/js/calculators/genconds.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('genconds', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize genconds calculator:', error);
  }
})();
