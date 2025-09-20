/**
 * Steel Calculator Initialization
 * External script for steel calculator page
 */

// Import and boot the steel calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the steel calculator module
    const calculator = await import('/assets/js/calculators/steel.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('steel', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize steel calculator:', error);
  }
})();
