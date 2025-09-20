/**
 * Concrete Calculator Initialization
 * External script for concrete calculator page
 */

// Import and boot the concrete calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the concrete calculator module
    const calculator = await import('/assets/js/calculators/concrete.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('concrete', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize concrete calculator:', error);
  }
})();
