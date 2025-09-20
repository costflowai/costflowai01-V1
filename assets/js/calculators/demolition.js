class DemolitionCalculator {
    constructor() {
        this.container = null;
        this.state = {
            projectType: 'interior',
            buildingType: 'residential',
            area: 0,
            floors: 1,
            materialType: 'mixed',
            hasHazmat: false,
            accessDifficulty: 'standard',
            dumpsterSize: '20yard',
            region: 'national',
            laborRate: 55
        };
        this.results = {};
        this.pricing = {};
        this.init = this.init.bind(this);
    }

    async init(container) {
        if (!container) {
            console.warn('Demolition calculator: No container element provided');
            container = document.getElementById('calculator-root') || document.querySelector('.calculator-container');
            if (!container) {
                console.error('Demolition calculator: No suitable container found');
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
            this.pricing = data.demolition || {};
        } catch (error) {
            console.error('Failed to load demolition pricing data:', error);
            this.pricing = this.getDefaultPricing();
        }
    }

    getDefaultPricing() {
        return {
            demolition_types: {
                interior_walls: { per_sf: 4.50, name: 'Interior Wall Demo' },
                full_gutting: { per_sf: 8.75, name: 'Full Interior Gutting' },
                structural: { per_sf: 12.50, name: 'Structural Demolition' },
                selective: { per_sf: 6.25, name: 'Selective Demolition' },
                concrete: { per_sf: 15.00, name: 'Concrete Demo' }
            },
            building_factors: {
                residential: 1.0,
                commercial: 1.25,
                industrial: 1.5,
                historic: 1.8
            },
            material_factors: {
                wood_frame: 0.85,
                masonry: 1.2,
                steel: 1.4,
                concrete: 1.6,
                mixed: 1.0
            },
            access_factors: {
                standard: 1.0,
                difficult: 1.3,
                very_difficult: 1.6,
                crane_required: 2.0
            },
            hazmat_factor: 1.75,
            dumpster_20yard: { per_each: 485.00, name: '20 Yard Dumpster' },
            dumpster_30yard: { per_each: 625.00, name: '30 Yard Dumpster' },
            haul_debris: { per_ton: 85.00, name: 'Debris Hauling' }
        };
    }

    loadState() {
        const saved = localStorage.getItem('demolition_calculator_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Failed to load demolition calculator state:', error);
            }
        }
    }

    saveState() {
        try {
            localStorage.setItem('demolition_calculator_state', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save demolition calculator state:', error);
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="demolition-calculator">
                <div class="calc-header">
                    <h1>Demolition Cost Calculator</h1>
                    <p>Calculate costs for residential and commercial demolition projects</p>
                </div>

                <div class="calc-form">
                    <div class="form-section">
                        <h3>Project Details</h3>

                        <div class="form-group">
                            <label for="projectType">Demolition Type:</label>
                            <select id="projectType" data-field="projectType">
                                <option value="interior" ${this.state.projectType === 'interior' ? 'selected' : ''}>Interior Demolition</option>
                                <option value="full_gutting" ${this.state.projectType === 'full_gutting' ? 'selected' : ''}>Full Interior Gutting</option>
                                <option value="structural" ${this.state.projectType === 'structural' ? 'selected' : ''}>Structural Demolition</option>
                                <option value="selective" ${this.state.projectType === 'selective' ? 'selected' : ''}>Selective Demolition</option>
                                <option value="concrete" ${this.state.projectType === 'concrete' ? 'selected' : ''}>Concrete Demolition</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="buildingType">Building Type:</label>
                            <select id="buildingType" data-field="buildingType">
                                <option value="residential" ${this.state.buildingType === 'residential' ? 'selected' : ''}>Residential</option>
                                <option value="commercial" ${this.state.buildingType === 'commercial' ? 'selected' : ''}>Commercial</option>
                                <option value="industrial" ${this.state.buildingType === 'industrial' ? 'selected' : ''}>Industrial</option>
                                <option value="historic" ${this.state.buildingType === 'historic' ? 'selected' : ''}>Historic Building</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="area">Area (sq ft):</label>
                            <input type="number" id="area" data-field="area" value="${this.state.area}" min="0" step="1">
                        </div>

                        <div class="form-group">
                            <label for="floors">Number of Floors:</label>
                            <input type="number" id="floors" data-field="floors" value="${this.state.floors}" min="1" max="10" step="1">
                        </div>

                        <div class="form-group">
                            <label for="materialType">Primary Material:</label>
                            <select id="materialType" data-field="materialType">
                                <option value="wood_frame" ${this.state.materialType === 'wood_frame' ? 'selected' : ''}>Wood Frame</option>
                                <option value="masonry" ${this.state.materialType === 'masonry' ? 'selected' : ''}>Masonry</option>
                                <option value="steel" ${this.state.materialType === 'steel' ? 'selected' : ''}>Steel Frame</option>
                                <option value="concrete" ${this.state.materialType === 'concrete' ? 'selected' : ''}>Concrete</option>
                                <option value="mixed" ${this.state.materialType === 'mixed' ? 'selected' : ''}>Mixed Materials</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Complexity Factors</h3>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="hasHazmat" data-field="hasHazmat" ${this.state.hasHazmat ? 'checked' : ''}>
                                Hazardous Materials (Asbestos/Lead)
                            </label>
                        </div>

                        <div class="form-group">
                            <label for="accessDifficulty">Access Difficulty:</label>
                            <select id="accessDifficulty" data-field="accessDifficulty">
                                <option value="standard" ${this.state.accessDifficulty === 'standard' ? 'selected' : ''}>Standard Access</option>
                                <option value="difficult" ${this.state.accessDifficulty === 'difficult' ? 'selected' : ''}>Difficult Access</option>
                                <option value="very_difficult" ${this.state.accessDifficulty === 'very_difficult' ? 'selected' : ''}>Very Difficult Access</option>
                                <option value="crane_required" ${this.state.accessDifficulty === 'crane_required' ? 'selected' : ''}>Crane Required</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="dumpsterSize">Dumpster Size:</label>
                            <select id="dumpsterSize" data-field="dumpsterSize">
                                <option value="20yard" ${this.state.dumpsterSize === '20yard' ? 'selected' : ''}>20 Yard Dumpster</option>
                                <option value="30yard" ${this.state.dumpsterSize === '30yard' ? 'selected' : ''}>30 Yard Dumpster</option>
                            </select>
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
                                <span>Demolition Labor:</span>
                                <span class="cost-value" id="laborCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Dumpster/Disposal:</span>
                                <span class="cost-value" id="disposalCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Equipment:</span>
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
                            <div class="cost-line">
                                <span>Cost per sq ft:</span>
                                <span class="cost-value" id="costPerSqFt">$0</span>
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

        const totalArea = this.state.area * this.state.floors;
        const demoType = this.pricing.demolition_types[this.state.projectType] || this.pricing.demolition_types.interior_walls;

        // Base demolition cost per sq ft
        let baseCostPerSqFt = demoType.per_sf;

        // Apply building type factor
        const buildingFactor = this.pricing.building_factors[this.state.buildingType] || 1.0;
        baseCostPerSqFt *= buildingFactor;

        // Apply material factor
        const materialFactor = this.pricing.material_factors[this.state.materialType] || 1.0;
        baseCostPerSqFt *= materialFactor;

        // Apply access difficulty factor
        const accessFactor = this.pricing.access_factors[this.state.accessDifficulty] || 1.0;
        baseCostPerSqFt *= accessFactor;

        // Apply hazmat factor
        if (this.state.hasHazmat) {
            baseCostPerSqFt *= this.pricing.hazmat_factor;
        }

        // Apply regional factor
        const regionalFactor = this.getRegionalFactor();
        baseCostPerSqFt *= regionalFactor;

        // Calculate labor cost
        const laborCost = totalArea * baseCostPerSqFt;

        // Calculate disposal costs
        const dumpsterCost = this.state.dumpsterSize === '30yard' ?
            this.pricing.dumpster_30yard.per_each :
            this.pricing.dumpster_20yard.per_each;

        // Estimate debris tonnage (approx 0.5 tons per 100 sq ft for typical demo)
        const estimatedTons = (totalArea / 100) * 0.5;
        const haulCost = estimatedTons * this.pricing.haul_debris.per_ton;
        const disposalCost = dumpsterCost + haulCost;

        // Equipment costs (10% of labor for typical demo equipment)
        const equipmentCost = laborCost * 0.10;

        const subtotal = laborCost + disposalCost + equipmentCost;
        const total = subtotal;
        const costPerSqFt = total / totalArea;

        this.results = {
            laborCost,
            disposalCost,
            equipmentCost,
            subtotal,
            total,
            costPerSqFt,
            totalArea,
            baseCostPerSqFt,
            buildingFactor,
            materialFactor,
            accessFactor,
            hazmatFactor: this.state.hasHazmat ? this.pricing.hazmat_factor : 1.0,
            regionalFactor,
            estimatedTons,
            dumpsterCost,
            haulCost
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

        this.container.querySelector('#laborCost').textContent = `$${this.results.laborCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#disposalCost').textContent = `$${this.results.disposalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#equipmentCost').textContent = `$${this.results.equipmentCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#subtotal').textContent = `$${this.results.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#totalCost').textContent = `$${this.results.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#costPerSqFt').textContent = `$${this.results.costPerSqFt.toFixed(2)}`;
    }

    clearResults() {
        if (!this.container) return;

        this.container.querySelector('#laborCost').textContent = '$0';
        this.container.querySelector('#disposalCost').textContent = '$0';
        this.container.querySelector('#equipmentCost').textContent = '$0';
        this.container.querySelector('#subtotal').textContent = '$0';
        this.container.querySelector('#totalCost').textContent = '$0';
        this.container.querySelector('#costPerSqFt').textContent = '$0';
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

        const breakdown = `
            <h4>Calculation Breakdown</h4>
            <div class="math-section">
                <h5>Project Details</h5>
                <p>Area: ${this.state.area.toLocaleString()} sq ft × ${this.state.floors} floors = ${this.results.totalArea.toLocaleString()} sq ft total</p>
                <p>Demolition Type: ${this.state.projectType}</p>
                <p>Building Type: ${this.state.buildingType}</p>
                <p>Material: ${this.state.materialType}</p>
                <p>Access: ${this.state.accessDifficulty}</p>
                <p>Hazmat: ${this.state.hasHazmat ? 'Yes' : 'No'}</p>
            </div>

            <div class="math-section">
                <h5>Cost Factors</h5>
                <p>Base Cost: $${this.pricing.demolition_types[this.state.projectType].per_sf}/sq ft</p>
                <p>Building Factor: ${this.results.buildingFactor}x</p>
                <p>Material Factor: ${this.results.materialFactor}x</p>
                <p>Access Factor: ${this.results.accessFactor}x</p>
                <p>Hazmat Factor: ${this.results.hazmatFactor}x</p>
                <p>Regional Factor: ${this.results.regionalFactor}x</p>
                <p><strong>Final Rate: $${this.results.baseCostPerSqFt.toFixed(2)}/sq ft</strong></p>
            </div>

            <div class="math-section">
                <h5>Labor Costs</h5>
                <p>${this.results.totalArea.toLocaleString()} sq ft × $${this.results.baseCostPerSqFt.toFixed(2)}/sq ft = $${this.results.laborCost.toFixed(2)}</p>
            </div>

            <div class="math-section">
                <h5>Disposal Costs</h5>
                <p>Dumpster (${this.state.dumpsterSize}): $${this.results.dumpsterCost.toFixed(2)}</p>
                <p>Estimated Debris: ${this.results.estimatedTons.toFixed(1)} tons</p>
                <p>Hauling: ${this.results.estimatedTons.toFixed(1)} tons × $${this.pricing.haul_debris.per_ton}/ton = $${this.results.haulCost.toFixed(2)}</p>
                <p><strong>Total Disposal: $${this.results.disposalCost.toFixed(2)}</strong></p>
            </div>

            <div class="math-section">
                <h5>Equipment Costs</h5>
                <p>10% of labor cost: $${this.results.equipmentCost.toFixed(2)}</p>
            </div>

            <div class="math-section">
                <h5>Total Cost</h5>
                <p>Labor + Disposal + Equipment = $${this.results.total.toFixed(2)}</p>
                <p><strong>Cost per sq ft: $${this.results.costPerSqFt.toFixed(2)}</strong></p>
            </div>
        `;

        this.container.querySelector('#mathBreakdown').innerHTML = breakdown;
    }

    getExportData() {
        return {
            project: {
                type: this.state.projectType,
                buildingType: this.state.buildingType,
                area: this.state.area,
                floors: this.state.floors,
                totalArea: this.results?.totalArea || 0,
                materialType: this.state.materialType,
                hasHazmat: this.state.hasHazmat,
                accessDifficulty: this.state.accessDifficulty,
                dumpsterSize: this.state.dumpsterSize,
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
            ['Demolition Cost Estimate'],
            [''],
            ['Project Details'],
            ['Type', data.project.type],
            ['Building Type', data.project.buildingType],
            ['Area (sq ft)', data.project.area],
            ['Floors', data.project.floors],
            ['Total Area (sq ft)', data.project.totalArea],
            ['Material Type', data.project.materialType],
            ['Hazardous Materials', data.project.hasHazmat ? 'Yes' : 'No'],
            ['Access Difficulty', data.project.accessDifficulty],
            ['Dumpster Size', data.project.dumpsterSize],
            ['Region', data.project.region],
            ['Labor Rate ($/hour)', data.project.laborRate],
            [''],
            ['Cost Breakdown'],
            ['Demolition Labor', `$${data.costs.laborCost.toFixed(2)}`],
            ['Dumpster/Disposal', `$${data.costs.disposalCost.toFixed(2)}`],
            ['Equipment', `$${data.costs.equipmentCost.toFixed(2)}`],
            ['Subtotal', `$${data.costs.subtotal.toFixed(2)}`],
            ['Total', `$${data.costs.total.toFixed(2)}`],
            ['Cost per sq ft', `$${data.costs.costPerSqFt.toFixed(2)}`],
            [''],
            ['Generated', new Date().toLocaleString()]
        ];

        const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        this.downloadFile(csvContent, 'demolition-estimate.csv', 'text/csv');
    }

    exportXLSX() {
        const data = this.getExportData();
        const workbook = XLSX.utils.book_new();

        const wsData = [
            ['Demolition Cost Estimate'],
            [],
            ['Project Details'],
            ['Type', data.project.type],
            ['Building Type', data.project.buildingType],
            ['Area (sq ft)', data.project.area],
            ['Floors', data.project.floors],
            ['Total Area (sq ft)', data.project.totalArea],
            ['Material Type', data.project.materialType],
            ['Hazardous Materials', data.project.hasHazmat ? 'Yes' : 'No'],
            ['Access Difficulty', data.project.accessDifficulty],
            ['Dumpster Size', data.project.dumpsterSize],
            ['Region', data.project.region],
            ['Labor Rate ($/hour)', data.project.laborRate],
            [],
            ['Cost Breakdown'],
            ['Demolition Labor', data.costs.laborCost],
            ['Dumpster/Disposal', data.costs.disposalCost],
            ['Equipment', data.costs.equipmentCost],
            ['Subtotal', data.costs.subtotal],
            ['Total', data.costs.total],
            ['Cost per sq ft', data.costs.costPerSqFt],
            [],
            ['Generated', new Date().toLocaleString()]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Demolition Estimate');
        XLSX.writeFile(workbook, 'demolition-estimate.xlsx');
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = this.getExportData();

        doc.setFontSize(20);
        doc.text('Demolition Cost Estimate', 20, 30);

        doc.setFontSize(14);
        doc.text('Project Details', 20, 50);

        doc.setFontSize(10);
        let yPos = 65;
        doc.text(`Type: ${data.project.type}`, 20, yPos);
        doc.text(`Building Type: ${data.project.buildingType}`, 20, yPos += 10);
        doc.text(`Area: ${data.project.area.toLocaleString()} sq ft`, 20, yPos += 10);
        doc.text(`Floors: ${data.project.floors}`, 20, yPos += 10);
        doc.text(`Total Area: ${data.project.totalArea.toLocaleString()} sq ft`, 20, yPos += 10);
        doc.text(`Material: ${data.project.materialType}`, 20, yPos += 10);
        doc.text(`Hazmat: ${data.project.hasHazmat ? 'Yes' : 'No'}`, 20, yPos += 10);
        doc.text(`Access: ${data.project.accessDifficulty}`, 20, yPos += 10);
        doc.text(`Dumpster: ${data.project.dumpsterSize}`, 20, yPos += 10);
        doc.text(`Region: ${data.project.region}`, 20, yPos += 10);

        doc.setFontSize(14);
        doc.text('Cost Breakdown', 20, yPos += 25);

        doc.setFontSize(10);
        doc.text(`Demolition Labor: $${data.costs.laborCost.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Dumpster/Disposal: $${data.costs.disposalCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Equipment: $${data.costs.equipmentCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Subtotal: $${data.costs.subtotal.toFixed(2)}`, 20, yPos += 10);

        doc.setFontSize(12);
        doc.text(`Total: $${data.costs.total.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Cost per sq ft: $${data.costs.costPerSqFt.toFixed(2)}`, 20, yPos += 10);

        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos += 20);

        doc.save('demolition-estimate.pdf');
    }

    printResults() {
        const data = this.getExportData();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Demolition Cost Estimate</title>
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
                    <h1>Demolition Cost Estimate</h1>

                    <h2>Project Details</h2>
                    <div class="detail-line"><strong>Type:</strong> ${data.project.type}</div>
                    <div class="detail-line"><strong>Building Type:</strong> ${data.project.buildingType}</div>
                    <div class="detail-line"><strong>Area:</strong> ${data.project.area.toLocaleString()} sq ft</div>
                    <div class="detail-line"><strong>Floors:</strong> ${data.project.floors}</div>
                    <div class="detail-line"><strong>Total Area:</strong> ${data.project.totalArea.toLocaleString()} sq ft</div>
                    <div class="detail-line"><strong>Material:</strong> ${data.project.materialType}</div>
                    <div class="detail-line"><strong>Hazmat:</strong> ${data.project.hasHazmat ? 'Yes' : 'No'}</div>
                    <div class="detail-line"><strong>Access:</strong> ${data.project.accessDifficulty}</div>
                    <div class="detail-line"><strong>Dumpster:</strong> ${data.project.dumpsterSize}</div>
                    <div class="detail-line"><strong>Region:</strong> ${data.project.region}</div>

                    <h2>Cost Breakdown</h2>
                    <div class="cost-line">
                        <span>Demolition Labor:</span>
                        <span>$${data.costs.laborCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Dumpster/Disposal:</span>
                        <span>$${data.costs.disposalCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Equipment:</span>
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
                    <div class="cost-line">
                        <span>Cost per sq ft:</span>
                        <span>$${data.costs.costPerSqFt.toFixed(2)}</span>
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
        const subject = encodeURIComponent('Demolition Cost Estimate');
        const body = encodeURIComponent(`
Demolition Cost Estimate

Project Details:
- Type: ${data.project.type}
- Building Type: ${data.project.buildingType}
- Area: ${data.project.area.toLocaleString()} sq ft
- Floors: ${data.project.floors}
- Total Area: ${data.project.totalArea.toLocaleString()} sq ft
- Material: ${data.project.materialType}
- Hazmat: ${data.project.hasHazmat ? 'Yes' : 'No'}
- Access: ${data.project.accessDifficulty}
- Dumpster: ${data.project.dumpsterSize}
- Region: ${data.project.region}

Cost Breakdown:
- Demolition Labor: $${data.costs.laborCost.toFixed(2)}
- Dumpster/Disposal: $${data.costs.disposalCost.toFixed(2)}
- Equipment: $${data.costs.equipmentCost.toFixed(2)}
- Subtotal: $${data.costs.subtotal.toFixed(2)}
- Total: $${data.costs.total.toFixed(2)}
- Cost per sq ft: $${data.costs.costPerSqFt.toFixed(2)}

Generated: ${new Date().toLocaleString()}
        `);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    saveProject() {
        const data = this.getExportData();
        const projectData = JSON.stringify(data, null, 2);
        this.downloadFile(projectData, 'demolition-project.json', 'application/json');
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

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new DemolitionCalculator();
    }
    return calculatorInstance.init(el);
}

export function compute() {
    return { ok: false, msg: "Not implemented" };
}

export function explain() {
    return "TBD";
}

export function meta() {
    return {
        id: 'demolition',
        title: 'Demolition Calculator',
        category: 'sitework',
        description: 'Calculate costs for residential and commercial demolition projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default DemolitionCalculator;