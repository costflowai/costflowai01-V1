(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/steel.js');
        window.bootCalculatorPage('steel', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize steel calculator:', error);
    }
})();
