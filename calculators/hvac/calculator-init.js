/**
 * Hvac Calculator Initialization
 * External script for hvac calculator page
 */

// Import and boot the hvac calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the hvac calculator module
    const calculator = await import('/assets/js/calculators/hvac.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('hvac', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize hvac calculator:', error);
  }
})();
