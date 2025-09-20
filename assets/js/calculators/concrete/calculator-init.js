(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/concrete.js');
        window.bootCalculatorPage('concrete', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize concrete calculator:', error);
    }
})();
