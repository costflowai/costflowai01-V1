(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/drywall.js');
        window.bootCalculatorPage('drywall', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize drywall calculator:', error);
    }
})();
