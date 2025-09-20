/**
 * Doorswindows Calculator Initialization
 * External script for doorswindows calculator page
 */

// Import and boot the doorswindows calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the doorswindows calculator module
    const calculator = await import('/assets/js/calculators/doorswindows.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('doorswindows', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize doorswindows calculator:', error);
  }
})();
