/**
 * Plumbing Calculator Initialization
 * External script for plumbing calculator page
 */

// Import and boot the plumbing calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the plumbing calculator module
    const calculator = await import('/assets/js/calculators/plumbing.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('plumbing', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize plumbing calculator:', error);
  }
})();
