(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/roofing.js');
        window.bootCalculatorPage('roofing', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize roofing calculator:', error);
    }
})();
