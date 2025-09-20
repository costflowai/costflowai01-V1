(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/asphalt.js');
        window.bootCalculatorPage('asphalt', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize asphalt calculator:', error);
    }
})();
