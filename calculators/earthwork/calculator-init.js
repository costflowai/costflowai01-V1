/**
 * Earthwork Calculator Initialization
 * External script for earthwork calculator page
 */

// Import and boot the earthwork calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the earthwork calculator module
    const calculator = await import('/assets/js/calculators/earthwork.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('earthwork', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize earthwork calculator:', error);
  }
})();
