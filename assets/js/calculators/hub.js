// Calculator Hub - Handle calculator loading and navigation
import { calculatorRegistry } from './registry.js';

document.addEventListener('DOMContentLoaded', function() {
    // Handle calculator button clicks
    document.querySelectorAll('[data-calc]').forEach(button => {
        button.addEventListener('click', async function() {
            const calcId = this.getAttribute('data-calc');
            await loadCalculator(calcId);
        });
    });
});

async function loadCalculator(calcId) {
    try {
        // Find the calculator in the registry
        const calcEntry = calculatorRegistry.find(calc => calc.id === calcId);

        if (!calcEntry) {
            console.error(`Calculator ${calcId} not found in registry`);
            return;
        }

        // Dynamically import and initialize the calculator
        const module = await calcEntry.module();

        // Create a new page for the calculator
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${module.meta().title} - CostFlowAI</title>
                <link rel="stylesheet" href="/assets/css/base.css">
                <link rel="stylesheet" href="/assets/css/layout.css">
                <link rel="stylesheet" href="/assets/css/calculators.css">
                <style>
                    .calculator-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                    .input-section { margin-bottom: 30px; }
                    .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px; }
                    .input-group { display: flex; flex-direction: column; }
                    .input-group label { font-weight: bold; margin-bottom: 5px; }
                    .input-group input, .input-group select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                    .button-section { text-align: center; margin: 30px 0; }
                    .btn-primary { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin: 0 10px; }
                    .btn-secondary { background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin: 0 10px; }
                    .btn-export { background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 0 5px; }
                    .results-section { margin-top: 30px; }
                    .results-table table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .results-table th, .results-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .results-table th { background-color: #f5f5f5; font-weight: bold; }
                    .assumptions { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; }
                    .math-details { margin-top: 15px; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 4px; }
                    .step { margin-bottom: 20px; }
                    .step h5 { color: #007bff; margin-bottom: 10px; }
                    .step p { margin-bottom: 5px; }
                    .export-buttons { margin-top: 10px; }
                    .opening-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
                    .opening-row input { flex: 1; }
                    .btn-remove { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
                </style>
            </head>
            <body>
                <header>
                    <h1>CostFlowAI - ${module.meta().title}</h1>
                    <a href="/calculators/" style="color: white; text-decoration: none;">← Back to Calculators</a>
                </header>
                <main id="calculator-app"></main>
                <script type="module">
                    // Initialize calculator when page loads
                    window.addEventListener('load', async function() {
                        const appElement = document.getElementById('calculator-app');

                        try {
                            // Re-import the calculator module in the new window context
                            const module = await import('/assets/js/calculators/${calcId}.js');

                            // Initialize the calculator
                            if (module.init) {
                                module.init(appElement);
                            } else {
                                console.error('Calculator init function not found');
                            }
                        } catch (error) {
                            console.error('Error initializing calculator:', error);
                            appElement.innerHTML = '<p>Error loading calculator. Please try again.</p>';
                        }
                    });
                </script>
            </body>
            </html>
        `);
        newWindow.document.close();

    } catch (error) {
        console.error('Error loading calculator:', error);
        alert('Error loading calculator. Please try again.');
    }
}