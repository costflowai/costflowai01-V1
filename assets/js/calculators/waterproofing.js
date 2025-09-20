class WaterproofingCalculator {
    constructor() {
        this.container = null;
        this.state = {
            projectType: 'foundation',
            area: 0,
            method: 'membrane',
            drainageSystem: false,
            sumpPump: false,
            region: 'national',
            laborRate: 65
        };
        this.results = {};
        this.pricing = {};
        this.init = this.init.bind(this);
    }

    async init(container) {
        if (!container) {
            console.warn('Waterproofing calculator: No container element provided');
            container = document.getElementById('calculator-root') || document.querySelector('.calculator-container');
            if (!container) {
                console.error('Waterproofing calculator: No suitable container found');
                return;
            }
        }

        this.container = container;
        await this.loadPricing();
        this.loadState();
        this.render();
        this.bindEvents();
        this.calculate();
    }

    async loadPricing() {
        try {
            const response = await fetch('/assets/data/pricing.base.json');
            const data = await response.json();
            this.pricing = data.waterproofing || {};
        } catch (error) {
            console.error('Failed to load waterproofing pricing data:', error);
            this.pricing = this.getDefaultPricing();
        }
    }

    getDefaultPricing() {
        return {
            methods: {
                membrane: { material: 3.50, labor: 4.25, name: 'Membrane System' },
                coating: { material: 2.75, labor: 2.50, name: 'Liquid Coating' },
                crystalline: { material: 4.50, labor: 3.75, name: 'Crystalline' },
                injection: { material: 8.50, labor: 12.00, name: 'Crack Injection' }
            },
            drainage: {
                interior: { material: 15.00, labor: 25.00, name: 'Interior Drain System' },
                exterior: { material: 18.00, labor: 35.00, name: 'Exterior French Drain' }
            },
            equipment: {
                sump_pump: { material: 450, labor: 350, name: 'Sump Pump System' },
                dehumidifier: { material: 275, labor: 150, name: 'Dehumidifier' }
            },
            project_factors: {
                foundation: 1.0,
                basement: 1.2,
                crawlspace: 0.85,
                commercial: 1.4,
                renovation: 1.3
            }
        };
    }

    loadState() {
        const saved = localStorage.getItem('waterproofing_calculator_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Failed to load waterproofing calculator state:', error);
            }
        }
    }

    saveState() {
        try {
            localStorage.setItem('waterproofing_calculator_state', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save waterproofing calculator state:', error);
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="waterproofing-calculator">
                <div class="calc-header">
                    <h1>Waterproofing Cost Calculator</h1>
                    <p>Calculate costs for foundation and basement waterproofing projects</p>
                </div>

                <div class="calc-form">
                    <div class="form-section">
                        <h3>Project Details</h3>

                        <div class="form-group">
                            <label for="projectType">Project Type:</label>
                            <select id="projectType" data-field="projectType">
                                <option value="foundation" ${this.state.projectType === 'foundation' ? 'selected' : ''}>Foundation Waterproofing</option>
                                <option value="basement" ${this.state.projectType === 'basement' ? 'selected' : ''}>Basement Waterproofing</option>
                                <option value="crawlspace" ${this.state.projectType === 'crawlspace' ? 'selected' : ''}>Crawlspace Waterproofing</option>
                                <option value="commercial" ${this.state.projectType === 'commercial' ? 'selected' : ''}>Commercial Waterproofing</option>
                                <option value="renovation" ${this.state.projectType === 'renovation' ? 'selected' : ''}>Renovation/Repair</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="area">Area to Waterproof (sq ft):</label>
                            <input type="number" id="area" data-field="area" value="${this.state.area}" min="0" step="1">
                        </div>

                        <div class="form-group">
                            <label for="method">Waterproofing Method:</label>
                            <select id="method" data-field="method">
                                <option value="membrane" ${this.state.method === 'membrane' ? 'selected' : ''}>Membrane System</option>
                                <option value="coating" ${this.state.method === 'coating' ? 'selected' : ''}>Liquid Coating</option>
                                <option value="crystalline" ${this.state.method === 'crystalline' ? 'selected' : ''}>Crystalline Treatment</option>
                                <option value="injection" ${this.state.method === 'injection' ? 'selected' : ''}>Crack Injection</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Additional Systems</h3>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="drainageSystem" data-field="drainageSystem" ${this.state.drainageSystem ? 'checked' : ''}>
                                Include Drainage System
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="sumpPump" data-field="sumpPump" ${this.state.sumpPump ? 'checked' : ''}>
                                Include Sump Pump Installation
                            </label>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Location & Labor</h3>

                        <div class="form-group">
                            <label for="region">Region:</label>
                            <select id="region" data-field="region">
                                <option value="national" ${this.state.region === 'national' ? 'selected' : ''}>National Average</option>
                                <option value="northeast" ${this.state.region === 'northeast' ? 'selected' : ''}>Northeast (+15%)</option>
                                <option value="west" ${this.state.region === 'west' ? 'selected' : ''}>West Coast (+20%)</option>
                                <option value="south" ${this.state.region === 'south' ? 'selected' : ''}>South (-10%)</option>
                                <option value="midwest" ${this.state.region === 'midwest' ? 'selected' : ''}>Midwest (-5%)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="laborRate">Labor Rate ($/hour):</label>
                            <input type="number" id="laborRate" data-field="laborRate" value="${this.state.laborRate}" min="0" step="5">
                        </div>
                    </div>
                </div>

                <div class="calc-results">
                    <div class="results-summary">
                        <h3>Cost Estimate</h3>
                        <div class="cost-breakdown">
                            <div class="cost-line">
                                <span>Materials:</span>
                                <span class="cost-value" id="materialsCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Labor:</span>
                                <span class="cost-value" id="laborCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Equipment/Systems:</span>
                                <span class="cost-value" id="equipmentCost">$0</span>
                            </div>
                            <div class="cost-line subtotal">
                                <span>Subtotal:</span>
                                <span class="cost-value" id="subtotal">$0</span>
                            </div>
                            <div class="cost-line total">
                                <span>Total Cost:</span>
                                <span class="cost-value" id="totalCost">$0</span>
                            </div>
                        </div>
                    </div>

                    <div class="results-details">
                        <button type="button" id="showMath" class="btn-secondary">Show Math</button>
                        <div id="mathBreakdown" class="math-breakdown" style="display: none;"></div>
                    </div>
                </div>

                <div class="calc-actions">
                    <button type="button" id="exportCSV" class="btn-export">Export CSV</button>
                    <button type="button" id="exportXLSX" class="btn-export">Export Excel</button>
                    <button type="button" id="exportPDF" class="btn-export">Export PDF</button>
                    <button type="button" id="printResults" class="btn-export">Print</button>
                    <button type="button" id="emailResults" class="btn-export">Email</button>
                    <button type="button" id="saveProject" class="btn-secondary">Save Project</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        if (!this.container) return;

        // Form input events
        this.container.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', (e) => this.handleInput(e));
            input.addEventListener('change', (e) => this.handleInput(e));
        });

        // Action button events
        this.container.querySelector('#showMath')?.addEventListener('click', () => this.toggleMath());
        this.container.querySelector('#exportCSV')?.addEventListener('click', () => this.exportCSV());
        this.container.querySelector('#exportXLSX')?.addEventListener('click', () => this.exportXLSX());
        this.container.querySelector('#exportPDF')?.addEventListener('click', () => this.exportPDF());
        this.container.querySelector('#printResults')?.addEventListener('click', () => this.printResults());
        this.container.querySelector('#emailResults')?.addEventListener('click', () => this.emailResults());
        this.container.querySelector('#saveProject')?.addEventListener('click', () => this.saveProject());
    }

    handleInput(event) {
        const field = event.target.dataset.field;
        if (!field) return;

        let value = event.target.value;
        if (event.target.type === 'number') {
            value = parseFloat(value) || 0;
        } else if (event.target.type === 'checkbox') {
            value = event.target.checked;
        }

        this.state[field] = value;
        this.saveState();
        this.calculate();
    }

    calculate() {
        if (!this.state.area || this.state.area <= 0) {
            this.clearResults();
            return;
        }

        const method = this.pricing.methods[this.state.method] || this.pricing.methods.membrane;
        const projectFactor = this.pricing.project_factors[this.state.projectType] || 1.0;
        const regionalFactor = this.getRegionalFactor();

        // Base waterproofing costs
        const materialCost = this.state.area * method.material * projectFactor * regionalFactor;
        const laborHours = this.state.area * (method.labor / this.state.laborRate) * projectFactor;
        const laborCost = laborHours * this.state.laborRate * regionalFactor;

        // Equipment costs
        let equipmentCost = 0;
        if (this.state.drainageSystem) {
            const drainageType = this.state.projectType === 'foundation' ? 'exterior' : 'interior';
            const drainage = this.pricing.drainage[drainageType] || this.pricing.drainage.interior;
            const linearFeet = Math.sqrt(this.state.area) * 4; // Perimeter estimate
            equipmentCost += (drainage.material + (drainage.labor / this.state.laborRate) * this.state.laborRate) * linearFeet * regionalFactor;
        }

        if (this.state.sumpPump) {
            const pump = this.pricing.equipment.sump_pump;
            equipmentCost += (pump.material + pump.labor) * regionalFactor;
        }

        const subtotal = materialCost + laborCost + equipmentCost;
        const total = subtotal;

        this.results = {
            materialCost,
            laborCost,
            equipmentCost,
            subtotal,
            total,
            laborHours,
            method: method.name,
            projectFactor,
            regionalFactor
        };

        this.updateDisplay();
    }

    getRegionalFactor() {
        const factors = {
            national: 1.0,
            northeast: 1.15,
            west: 1.20,
            south: 0.90,
            midwest: 0.95
        };
        return factors[this.state.region] || 1.0;
    }

    updateDisplay() {
        if (!this.container || !this.results) return;

        this.container.querySelector('#materialsCost').textContent = `$${this.results.materialCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#laborCost').textContent = `$${this.results.laborCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#equipmentCost').textContent = `$${this.results.equipmentCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#subtotal').textContent = `$${this.results.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#totalCost').textContent = `$${this.results.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    clearResults() {
        if (!this.container) return;

        this.container.querySelector('#materialsCost').textContent = '$0';
        this.container.querySelector('#laborCost').textContent = '$0';
        this.container.querySelector('#equipmentCost').textContent = '$0';
        this.container.querySelector('#subtotal').textContent = '$0';
        this.container.querySelector('#totalCost').textContent = '$0';
    }

    toggleMath() {
        const mathDiv = this.container.querySelector('#mathBreakdown');
        const button = this.container.querySelector('#showMath');

        if (mathDiv.style.display === 'none') {
            mathDiv.style.display = 'block';
            button.textContent = 'Hide Math';
            this.showMathBreakdown();
        } else {
            mathDiv.style.display = 'none';
            button.textContent = 'Show Math';
        }
    }

    showMathBreakdown() {
        if (!this.results) return;

        const method = this.pricing.methods[this.state.method];
        const breakdown = `
            <h4>Calculation Breakdown</h4>
            <div class="math-section">
                <h5>Project Details</h5>
                <p>Area: ${this.state.area.toLocaleString()} sq ft</p>
                <p>Method: ${this.results.method}</p>
                <p>Project Type: ${this.state.projectType} (${this.results.projectFactor}x factor)</p>
                <p>Region: ${this.state.region} (${this.results.regionalFactor}x factor)</p>
            </div>

            <div class="math-section">
                <h5>Material Costs</h5>
                <p>${this.state.area} sq ft × $${method.material}/sq ft × ${this.results.projectFactor} × ${this.results.regionalFactor} = $${this.results.materialCost.toFixed(2)}</p>
            </div>

            <div class="math-section">
                <h5>Labor Costs</h5>
                <p>Labor Hours: ${this.results.laborHours.toFixed(2)} hours</p>
                <p>${this.results.laborHours.toFixed(2)} hours × $${this.state.laborRate}/hour × ${this.results.regionalFactor} = $${this.results.laborCost.toFixed(2)}</p>
            </div>

            ${this.results.equipmentCost > 0 ? `
            <div class="math-section">
                <h5>Equipment/Systems</h5>
                <p>Additional systems cost: $${this.results.equipmentCost.toFixed(2)}</p>
                ${this.state.drainageSystem ? '<p>• Drainage system included</p>' : ''}
                ${this.state.sumpPump ? '<p>• Sump pump included</p>' : ''}
            </div>
            ` : ''}

            <div class="math-section">
                <h5>Total</h5>
                <p>Materials + Labor + Equipment = $${this.results.total.toFixed(2)}</p>
            </div>
        `;

        this.container.querySelector('#mathBreakdown').innerHTML = breakdown;
    }

    getExportData() {
        return {
            project: {
                type: this.state.projectType,
                area: this.state.area,
                method: this.state.method,
                drainageSystem: this.state.drainageSystem,
                sumpPump: this.state.sumpPump,
                region: this.state.region,
                laborRate: this.state.laborRate
            },
            costs: this.results,
            timestamp: new Date().toISOString()
        };
    }

    exportCSV() {
        const data = this.getExportData();
        const rows = [
            ['Waterproofing Cost Estimate'],
            [''],
            ['Project Details'],
            ['Type', data.project.type],
            ['Area (sq ft)', data.project.area],
            ['Method', data.project.method],
            ['Drainage System', data.project.drainageSystem ? 'Yes' : 'No'],
            ['Sump Pump', data.project.sumpPump ? 'Yes' : 'No'],
            ['Region', data.project.region],
            ['Labor Rate ($/hour)', data.project.laborRate],
            [''],
            ['Cost Breakdown'],
            ['Materials', `$${data.costs.materialCost.toFixed(2)}`],
            ['Labor', `$${data.costs.laborCost.toFixed(2)}`],
            ['Equipment/Systems', `$${data.costs.equipmentCost.toFixed(2)}`],
            ['Subtotal', `$${data.costs.subtotal.toFixed(2)}`],
            ['Total', `$${data.costs.total.toFixed(2)}`],
            [''],
            ['Generated', new Date().toLocaleString()]
        ];

        const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        this.downloadFile(csvContent, 'waterproofing-estimate.csv', 'text/csv');
    }

    exportXLSX() {
        const data = this.getExportData();
        const workbook = XLSX.utils.book_new();

        const wsData = [
            ['Waterproofing Cost Estimate'],
            [],
            ['Project Details'],
            ['Type', data.project.type],
            ['Area (sq ft)', data.project.area],
            ['Method', data.project.method],
            ['Drainage System', data.project.drainageSystem ? 'Yes' : 'No'],
            ['Sump Pump', data.project.sumpPump ? 'Yes' : 'No'],
            ['Region', data.project.region],
            ['Labor Rate ($/hour)', data.project.laborRate],
            [],
            ['Cost Breakdown'],
            ['Materials', data.costs.materialCost],
            ['Labor', data.costs.laborCost],
            ['Equipment/Systems', data.costs.equipmentCost],
            ['Subtotal', data.costs.subtotal],
            ['Total', data.costs.total],
            [],
            ['Generated', new Date().toLocaleString()]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Waterproofing Estimate');
        XLSX.writeFile(workbook, 'waterproofing-estimate.xlsx');
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = this.getExportData();

        doc.setFontSize(20);
        doc.text('Waterproofing Cost Estimate', 20, 30);

        doc.setFontSize(14);
        doc.text('Project Details', 20, 50);

        doc.setFontSize(10);
        let yPos = 65;
        doc.text(`Type: ${data.project.type}`, 20, yPos);
        doc.text(`Area: ${data.project.area.toLocaleString()} sq ft`, 20, yPos += 10);
        doc.text(`Method: ${data.project.method}`, 20, yPos += 10);
        doc.text(`Drainage System: ${data.project.drainageSystem ? 'Yes' : 'No'}`, 20, yPos += 10);
        doc.text(`Sump Pump: ${data.project.sumpPump ? 'Yes' : 'No'}`, 20, yPos += 10);
        doc.text(`Region: ${data.project.region}`, 20, yPos += 10);
        doc.text(`Labor Rate: $${data.project.laborRate}/hour`, 20, yPos += 10);

        doc.setFontSize(14);
        doc.text('Cost Breakdown', 20, yPos += 25);

        doc.setFontSize(10);
        doc.text(`Materials: $${data.costs.materialCost.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Labor: $${data.costs.laborCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Equipment/Systems: $${data.costs.equipmentCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Subtotal: $${data.costs.subtotal.toFixed(2)}`, 20, yPos += 10);

        doc.setFontSize(12);
        doc.text(`Total: $${data.costs.total.toFixed(2)}`, 20, yPos += 15);

        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos += 20);

        doc.save('waterproofing-estimate.pdf');
    }

    printResults() {
        const data = this.getExportData();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Waterproofing Cost Estimate</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        h2 { color: #666; margin-top: 30px; }
                        .detail-line { margin: 5px 0; }
                        .cost-line { display: flex; justify-content: space-between; margin: 5px 0; }
                        .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; padding-top: 10px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <h1>Waterproofing Cost Estimate</h1>

                    <h2>Project Details</h2>
                    <div class="detail-line"><strong>Type:</strong> ${data.project.type}</div>
                    <div class="detail-line"><strong>Area:</strong> ${data.project.area.toLocaleString()} sq ft</div>
                    <div class="detail-line"><strong>Method:</strong> ${data.project.method}</div>
                    <div class="detail-line"><strong>Drainage System:</strong> ${data.project.drainageSystem ? 'Yes' : 'No'}</div>
                    <div class="detail-line"><strong>Sump Pump:</strong> ${data.project.sumpPump ? 'Yes' : 'No'}</div>
                    <div class="detail-line"><strong>Region:</strong> ${data.project.region}</div>
                    <div class="detail-line"><strong>Labor Rate:</strong> $${data.project.laborRate}/hour</div>

                    <h2>Cost Breakdown</h2>
                    <div class="cost-line">
                        <span>Materials:</span>
                        <span>$${data.costs.materialCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Labor:</span>
                        <span>$${data.costs.laborCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Equipment/Systems:</span>
                        <span>$${data.costs.equipmentCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Subtotal:</span>
                        <span>$${data.costs.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="cost-line total">
                        <span>Total:</span>
                        <span>$${data.costs.total.toFixed(2)}</span>
                    </div>

                    <p style="margin-top: 40px; font-size: 0.9em; color: #666;">
                        Generated: ${new Date().toLocaleString()}
                    </p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    emailResults() {
        const data = this.getExportData();
        const subject = encodeURIComponent('Waterproofing Cost Estimate');
        const body = encodeURIComponent(`
Waterproofing Cost Estimate

Project Details:
- Type: ${data.project.type}
- Area: ${data.project.area.toLocaleString()} sq ft
- Method: ${data.project.method}
- Drainage System: ${data.project.drainageSystem ? 'Yes' : 'No'}
- Sump Pump: ${data.project.sumpPump ? 'Yes' : 'No'}
- Region: ${data.project.region}
- Labor Rate: $${data.project.laborRate}/hour

Cost Breakdown:
- Materials: $${data.costs.materialCost.toFixed(2)}
- Labor: $${data.costs.laborCost.toFixed(2)}
- Equipment/Systems: $${data.costs.equipmentCost.toFixed(2)}
- Subtotal: $${data.costs.subtotal.toFixed(2)}
- Total: $${data.costs.total.toFixed(2)}

Generated: ${new Date().toLocaleString()}
        `);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    saveProject() {
        const data = this.getExportData();
        const projectData = JSON.stringify(data, null, 2);
        this.downloadFile(projectData, 'waterproofing-project.json', 'application/json');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Create a singleton instance for the legacy API
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new WaterproofingCalculator();
    }
    return calculatorInstance.init(el);
}

export function compute(state) {
    return { ok: false, msg: "Not implemented" };
}

export function explain(state) {
    return "TBD";
}

export function meta() {
    return {
        id: 'waterproofing',
        title: 'Waterproofing Calculator',
        category: 'structural',
        description: 'Calculate costs for foundation and basement waterproofing projects',
        version: '1.0.0'
    };
}

// Export for module loading
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WaterproofingCalculator;
} else {
    window.WaterproofingCalculator = WaterproofingCalculator;
}