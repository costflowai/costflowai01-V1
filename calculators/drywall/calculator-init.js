/**
 * Drywall Calculator Initialization
 * External script for drywall calculator page
 */

// Import and boot the drywall calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the drywall calculator module
    const calculator = await import('/assets/js/calculators/drywall.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('drywall', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize drywall calculator:', error);
  }
})();
