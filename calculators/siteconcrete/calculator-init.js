/**
 * Siteconcrete Calculator Initialization
 * External script for siteconcrete calculator page
 */

// Import and boot the siteconcrete calculator
(async function() {
  try {
    // Load the calculator bootstrap
    await import('/assets/js/calculators/calculator-bootstrap.js');

    // Import the siteconcrete calculator module
    const calculator = await import('/assets/js/calculators/siteconcrete.js');

    // Boot the calculator when DOM is ready
    window.bootCalculatorPage('siteconcrete', calculator.default || calculator);
  } catch (error) {
    console.error('Failed to initialize siteconcrete calculator:', error);
  }
})();
