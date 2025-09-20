(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/framing.js');
        window.bootCalculatorPage('framing', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize framing calculator:', error);
    }
})();
