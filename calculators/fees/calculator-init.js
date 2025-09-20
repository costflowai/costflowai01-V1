/**
 * Fees Calculator Initialization
 * External script for fees calculator page
 */

// Import and boot the fees calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the fees calculator module
    const calculator = await import('/assets/js/calculators/fees.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('fees', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize fees calculator:', error);
  }
})();
