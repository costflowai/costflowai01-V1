(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/insulation.js');
        window.bootCalculatorPage('insulation', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize insulation calculator:', error);
    }
})();
