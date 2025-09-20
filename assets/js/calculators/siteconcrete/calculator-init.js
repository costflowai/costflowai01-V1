(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/siteconcrete.js');
        window.bootCalculatorPage('siteconcrete', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize siteconcrete calculator:', error);
    }
})();
