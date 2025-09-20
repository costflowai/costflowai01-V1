(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/demolition.js');
        window.bootCalculatorPage('demolition', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize demolition calculator:', error);
    }
})();
