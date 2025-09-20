(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/genconds.js');
        window.bootCalculatorPage('genconds', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize genconds calculator:', error);
    }
})();
