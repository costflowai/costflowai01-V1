(async function() {
    try {
        await import('/assets/js/calculators/calculator-bootstrap.js');
        const calculator = await import('/assets/js/calculators/earthwork.js');
        window.bootCalculatorPage('earthwork', calculator.default || calculator);
    } catch (error) {
        console.error('Failed to initialize earthwork calculator:', error);
    }
})();
