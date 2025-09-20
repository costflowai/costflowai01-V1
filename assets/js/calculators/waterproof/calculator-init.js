(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/waterproof.js');
        window.bootCalculatorPage('waterproof', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize waterproof calculator:', error);
    }
})();
