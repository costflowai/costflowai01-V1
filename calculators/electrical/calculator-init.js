/**
 * Electrical Calculator Initialization
 * External script for electrical calculator page
 */

// Import and boot the electrical calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the electrical calculator module
    const calculator = await import('/assets/js/calculators/electrical.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('electrical', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize electrical calculator:', error);
  }
})();
