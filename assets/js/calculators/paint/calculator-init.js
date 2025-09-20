(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/paint.js');
        window.bootCalculatorPage('paint', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize paint calculator:', error);
    }
})();
