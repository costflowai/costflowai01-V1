(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/hvac.js');
        window.bootCalculatorPage('hvac', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize hvac calculator:', error);
    }
})();
