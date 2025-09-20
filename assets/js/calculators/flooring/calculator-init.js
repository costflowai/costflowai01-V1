(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/flooring.js');
        window.bootCalculatorPage('flooring', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize flooring calculator:', error);
    }
})();
