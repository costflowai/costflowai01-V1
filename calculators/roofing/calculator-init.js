/**
 * Roofing Calculator Initialization
 * External script for roofing calculator page
 */

// Import and boot the roofing calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the roofing calculator module
    const calculator = await import('/assets/js/calculators/roofing.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('roofing', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize roofing calculator:', error);
  }
})();
