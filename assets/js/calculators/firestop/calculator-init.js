(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/firestop.js');
        window.bootCalculatorPage('firestop', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize firestop calculator:', error);
    }
})();
