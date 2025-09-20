/**
 * Paint Calculator Initialization
 * External script for paint calculator page
 */

// Import and boot the paint calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the paint calculator module
    const calculator = await import('/assets/js/calculators/paint.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('paint', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize paint calculator:', error);
  }
})();
