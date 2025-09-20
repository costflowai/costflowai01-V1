/**
 * Asphalt Calculator Initialization
 * External script for asphalt calculator page
 */

// Import and boot the asphalt calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the asphalt calculator module
    const calculator = await import('/assets/js/calculators/asphalt.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('asphalt', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize asphalt calculator:', error);
  }
})();
