/**
 * Demolition Calculator Initialization
 * External script for demolition calculator page
 */

// Import and boot the demolition calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the demolition calculator module
    const calculator = await import('/assets/js/calculators/demolition.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('demolition', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize demolition calculator:', error);
  }
})();
