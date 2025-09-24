/**
 * Hvac Calculator Implementation
 * Extends the base calculator functionality
 */

class HvacCalculator extends CalculatorBase {
    constructor() {
        super('hvac');
    }

    calculate() {
        try {
            const inputs = this.getFormInputs();
            this.validateInputs(inputs);

            const results = this.performCalculations(inputs);
            this.displayResults(results);

            // Track calculator usage
            if (window.trackCalculatorUsage) {
                window.trackCalculatorUsage('hvac', 'calculate');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    getFormInputs() {
        // Override this method to get specific form inputs
        const form = document.getElementById('calculator-form');
        if (!form) throw new Error('Calculator form not found');

        const formData = new FormData(form);
        return Object.fromEntries(formData);
    }

    validateInputs(inputs) {
        // Override this method to add specific validation
        // Basic validation example:
        for (const [key, value] of Object.entries(inputs)) {
            if (value === '' || value === null || value === undefined) {
                throw new Error(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
            }
            if (isNaN(parseFloat(value))) {
                throw new Error(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} must be a valid number`);
            }
        }
    }

    performCalculations(inputs) {
        // Override this method to perform specific calculations
        // Example structure:
        const materials = this.calculateMaterials(inputs);
        const cost = this.calculateCost(materials, inputs);
        const summary = this.generateSummary(materials, cost, inputs);

        return {
            materials,
            cost,
            summary
        };
    }

    calculateMaterials(inputs) {
        // Override this method to calculate required materials
        return [
            { name: 'Sample Material', quantity: 100, unit: 'units' }
        ];
    }

    calculateCost(materials, inputs) {
        // Override this method to calculate costs
        const breakdown = materials.map(material => ({
            name: material.name,
            amount: material.quantity * 10 // Example price calculation
        }));

        const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

        return { total, breakdown };
    }

    generateSummary(materials, cost, inputs) {
        // Override this method to generate summary data
        return {
            'Total Materials': materials.length,
            'Estimated Cost': CalculatorUtils.formatCurrency(cost.total)
        };
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.calculator = new HvacCalculator();
});