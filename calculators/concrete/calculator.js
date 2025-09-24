class ConcreteCalculator extends CalculatorBase {
    constructor() {
        super({
            formId: 'concreteForm',
            name: 'concrete'
        });
        this.setupTabs();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    }

    calculate() {
        this.saveValues();

        const length = this.getInputValue('slabLength');
        const width = this.getInputValue('slabWidth');
        const thickness = this.getInputValue('slabThickness');
        const pricePerYard = this.getInputValue('pricePerYard');

        if (length <= 0 || width <= 0 || thickness <= 0) {
            this.displayResults('<div class="error">Please enter valid dimensions</div>');
            return;
        }

        // Calculate volume
        const volumeCubicFeet = (length * width * thickness) / 12;
        const volumeCubicYards = volumeCubicFeet / 27;

        // Add 10% waste factor
        const volumeWithWaste = volumeCubicYards * 1.1;

        // Calculate bags needed (80lb bags)
        const bagsNeeded = Math.ceil(volumeCubicFeet * 0.6);

        // Calculate cost
        const totalCost = volumeWithWaste * pricePerYard;

        // Store results for export
        this.lastResults = {
            'Dimensions': `${length}' × ${width}' × ${thickness}"`,
            'Area': `${(length * width).toFixed(2)} sq ft`,
            'Volume': `${volumeCubicYards.toFixed(2)} cubic yards`,
            'Volume with Waste': `${volumeWithWaste.toFixed(2)} cubic yards`,
            '80lb Bags Needed': bagsNeeded,
            'Estimated Cost': this.formatCurrency(totalCost)
        };

        // Display results
        const html = `
            <div class="results-container">
                <h2>Calculation Results</h2>

                <div class="result-grid">
                    <div class="result-item">
                        <span class="label">Dimensions:</span>
                        <span class="value">${length}' × ${width}' × ${thickness}"</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Area:</span>
                        <span class="value">${this.formatNumber(length * width)} sq ft</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Volume:</span>
                        <span class="value">${this.formatNumber(volumeCubicYards)} cubic yards</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Volume with 10% Waste:</span>
                        <span class="value">${this.formatNumber(volumeWithWaste)} cubic yards</span>
                    </div>
                    <div class="result-item">
                        <span class="label">80lb Bags Needed:</span>
                        <span class="value">${bagsNeeded} bags</span>
                    </div>
                    <div class="result-item highlight">
                        <span class="label">Estimated Cost:</span>
                        <span class="value">${this.formatCurrency(totalCost)}</span>
                    </div>
                </div>

                <div class="formula-display">
                    <h3>Calculation Method:</h3>
                    <code>
                        Volume (cu ft) = Length × Width × (Thickness ÷ 12)<br>
                        Volume (cu yd) = Volume (cu ft) ÷ 27<br>
                        With Waste = Volume × 1.1 (10% waste factor)<br>
                        Cost = Volume with Waste × Price per Cubic Yard
                    </code>
                </div>

                <div class="notes">
                    <h3>Important Notes:</h3>
                    <ul>
                        <li>10% waste factor included for spillage and over-excavation</li>
                        <li>Actual costs may vary based on location and supplier</li>
                        <li>Consider additional costs for delivery, labor, and reinforcement</li>
                        <li>For structural concrete, consult with an engineer</li>
                    </ul>
                </div>
            </div>
        `;

        this.displayResults(html);

        // Show export buttons
        document.querySelector('.export-buttons').style.display = 'block';
    }
}

// Initialize calculator when page loads
const calculator = new ConcreteCalculator();