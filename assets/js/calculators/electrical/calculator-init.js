(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/electrical.js');
        window.bootCalculatorPage('electrical', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize electrical calculator:', error);
    }
})();
