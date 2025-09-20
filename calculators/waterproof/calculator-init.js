/**
 * Waterproof Calculator Initialization
 * External script for waterproof calculator page
 */

// Import and boot the waterproof calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the waterproof calculator module
    const calculator = await import('/assets/js/calculators/waterproof.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('waterproof', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize waterproof calculator:', error);
  }
})();
