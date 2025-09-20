(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/doorswindows.js');
        window.bootCalculatorPage('doorswindows', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize doorswindows calculator:', error);
    }
})();
