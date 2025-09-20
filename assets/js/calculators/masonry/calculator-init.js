(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/masonry.js');
        window.bootCalculatorPage('masonry', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize masonry calculator:', error);
    }
})();
