/**
 * Insulation Calculator Initialization
 * External script for insulation calculator page
 */

// Import and boot the insulation calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the insulation calculator module
    const calculator = await import('/assets/js/calculators/insulation.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('insulation', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize insulation calculator:', error);
  }
})();
