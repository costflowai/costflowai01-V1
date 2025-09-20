(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/fees.js');
        window.bootCalculatorPage('fees', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize fees calculator:', error);
    }
})();
