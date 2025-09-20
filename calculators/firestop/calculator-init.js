/**
 * Firestop Calculator Initialization
 * External script for firestop calculator page
 */

// Import and boot the firestop calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the firestop calculator module
    const calculator = await import('/assets/js/calculators/firestop.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('firestop', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize firestop calculator:', error);
  }
})();
