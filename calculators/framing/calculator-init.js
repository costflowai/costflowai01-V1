/**
 * Framing Calculator Initialization
 * External script for framing calculator page
 */

// Import and boot the framing calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the framing calculator module
    const calculator = await import('/assets/js/calculators/framing.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('framing', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize framing calculator:', error);
  }
})();
