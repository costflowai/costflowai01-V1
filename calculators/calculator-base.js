// Shared calculator functionality
class CalculatorBase {
    constructor(config) {
        this.form = document.getElementById(config.formId);
        this.resultDiv = document.getElementById('results');
        this.config = config;
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculate();
            });

            // Add reset button functionality
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.reset());
            }

            // Load saved values from localStorage
            this.loadSavedValues();
        }

        // Remove "Loading calculator..." message
        const loadingMsg = document.querySelector('.loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }
    }

    calculate() {
        // Override in child classes
        console.error('Calculate method must be implemented in child class');
    }

    displayResults(html) {
        if (this.resultDiv) {
            this.resultDiv.innerHTML = html;
            this.resultDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    getInputValue(id) {
        const input = document.getElementById(id);
        return input ? parseFloat(input.value) || 0 : 0;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatNumber(num, decimals = 2) {
        return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    saveValues() {
        const inputs = this.form.querySelectorAll('input[type="number"]');
        const values = {};
        inputs.forEach(input => {
            values[input.id] = input.value;
        });
        localStorage.setItem(`calculator_${this.config.name}`, JSON.stringify(values));
    }

    loadSavedValues() {
        const saved = localStorage.getItem(`calculator_${this.config.name}`);
        if (saved) {
            const values = JSON.parse(saved);
            Object.keys(values).forEach(id => {
                const input = document.getElementById(id);
                if (input) input.value = values[id];
            });
        }
    }

    reset() {
        this.form.reset();
        this.resultDiv.innerHTML = '';
        localStorage.removeItem(`calculator_${this.config.name}`);
    }

    exportToPDF() {
        window.print();
    }

    exportToCSV(data) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.config.name}_estimate_${Date.now()}.csv`;
        a.click();
    }

    convertToCSV(data) {
        const rows = [];
        rows.push(['Item', 'Value']);
        Object.entries(data).forEach(([key, value]) => {
            rows.push([key, value]);
        });
        return rows.map(row => row.join(',')).join('\n');
    }
}

// Make available globally
window.CalculatorBase = CalculatorBase;