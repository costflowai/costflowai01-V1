class FeesCalculator {
    constructor() {
        this.container = null;
        this.state = {
            projectValue: 0,
            projectType: 'commercial',
            buildingType: 'new_construction',
            squareFootage: 0,
            numberOfUnits: 0,
            hasElectrical: true,
            hasPlumbing: true,
            hasMechanical: true,
            hasStructural: false,
            jurisdiction: 'standard',
            expeditedPermits: false,
            region: 'national'
        };
        this.results = {};
        this.pricing = {};
        this.init = this.init.bind(this);
    }

    async init(container) {
        if (!container) {
            console.warn('Fees calculator: No container element provided');
            container = document.getElementById('calculator-root') || document.querySelector('.calculator-container');
            if (!container) {
                console.error('Fees calculator: No suitable container found');
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
            this.pricing = data.fees || {};
        } catch (error) {
            console.error('Failed to load fees pricing data:', error);
            this.pricing = this.getDefaultPricing();
        }
    }

    getDefaultPricing() {
        return {
            permit_types: {
                building: {
                    base_fee: 250,
                    per_1000_valuation: 8.50,
                    min_fee: 150,
                    max_fee: 15000
                },
                electrical: {
                    base_fee: 125,
                    per_1000_valuation: 3.25,
                    min_fee: 75,
                    max_fee: 5000
                },
                plumbing: {
                    base_fee: 100,
                    per_1000_valuation: 2.75,
                    min_fee: 60,
                    max_fee: 4000
                },
                mechanical: {
                    base_fee: 100,
                    per_1000_valuation: 2.50,
                    min_fee: 60,
                    max_fee: 4000
                },
                structural: {
                    base_fee: 200,
                    per_1000_valuation: 4.00,
                    min_fee: 120,
                    max_fee: 8000
                }
            },
            inspection_fees: {
                building_inspections: 450,
                electrical_inspections: 275,
                plumbing_inspections: 225,
                mechanical_inspections: 200,
                structural_inspections: 350,
                final_inspection: 175
            },
            project_factors: {
                residential: 0.85,
                commercial: 1.0,
                industrial: 1.2,
                institutional: 1.1
            },
            building_factors: {
                new_construction: 1.0,
                addition: 0.8,
                renovation: 0.7,
                alteration: 0.6,
                tenant_improvement: 0.5
            },
            jurisdiction_factors: {
                rural: 0.7,
                standard: 1.0,
                urban: 1.3,
                metro: 1.6,
                premium: 2.0
            },
            expedited_factor: 1.5,
            plan_review_percentage: 0.65,
            additional_fees: {
                soil_test_review: 150,
                environmental_review: 300,
                traffic_impact: 500,
                variance_request: 750,
                conditional_use: 1200
            }
        };
    }

    loadState() {
        const saved = localStorage.getItem('fees_calculator_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Failed to load fees calculator state:', error);
            }
        }
    }

    saveState() {
        try {
            localStorage.setItem('fees_calculator_state', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save fees calculator state:', error);
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="fees-calculator">
                <div class="calc-header">
                    <h1>Permit & Fees Calculator</h1>
                    <p>Calculate building permits, inspections, and related fees</p>
                </div>

                <div class="calc-form">
                    <div class="form-section">
                        <h3>Project Details</h3>

                        <div class="form-group">
                            <label for="projectValue">Total Project Value ($):</label>
                            <input type="number" id="projectValue" data-field="projectValue" value="${this.state.projectValue}" min="0" step="1000">
                            <small>Total construction value for permit fee calculation</small>
                        </div>

                        <div class="form-group">
                            <label for="squareFootage">Square Footage:</label>
                            <input type="number" id="squareFootage" data-field="squareFootage" value="${this.state.squareFootage}" min="0" step="100">
                        </div>

                        <div class="form-group">
                            <label for="projectType">Project Type:</label>
                            <select id="projectType" data-field="projectType">
                                <option value="residential" ${this.state.projectType === 'residential' ? 'selected' : ''}>Residential</option>
                                <option value="commercial" ${this.state.projectType === 'commercial' ? 'selected' : ''}>Commercial</option>
                                <option value="industrial" ${this.state.projectType === 'industrial' ? 'selected' : ''}>Industrial</option>
                                <option value="institutional" ${this.state.projectType === 'institutional' ? 'selected' : ''}>Institutional</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="buildingType">Building Type:</label>
                            <select id="buildingType" data-field="buildingType">
                                <option value="new_construction" ${this.state.buildingType === 'new_construction' ? 'selected' : ''}>New Construction</option>
                                <option value="addition" ${this.state.buildingType === 'addition' ? 'selected' : ''}>Addition</option>
                                <option value="renovation" ${this.state.buildingType === 'renovation' ? 'selected' : ''}>Renovation</option>
                                <option value="alteration" ${this.state.buildingType === 'alteration' ? 'selected' : ''}>Alteration</option>
                                <option value="tenant_improvement" ${this.state.buildingType === 'tenant_improvement' ? 'selected' : ''}>Tenant Improvement</option>
                            </select>
                        </div>

                        <div class="form-group" id="unitsGroup" style="${this.state.projectType === 'residential' ? 'display: block;' : 'display: none;'}">
                            <label for="numberOfUnits">Number of Units:</label>
                            <input type="number" id="numberOfUnits" data-field="numberOfUnits" value="${this.state.numberOfUnits}" min="0" step="1">
                            <small>For residential projects</small>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Required Permits</h3>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="hasElectrical" data-field="hasElectrical" ${this.state.hasElectrical ? 'checked' : ''}>
                                Electrical Permit & Inspections
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="hasPlumbing" data-field="hasPlumbing" ${this.state.hasPlumbing ? 'checked' : ''}>
                                Plumbing Permit & Inspections
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="hasMechanical" data-field="hasMechanical" ${this.state.hasMechanical ? 'checked' : ''}>
                                Mechanical/HVAC Permit & Inspections
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="hasStructural" data-field="hasStructural" ${this.state.hasStructural ? 'checked' : ''}>
                                Structural Permit & Inspections
                            </label>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Jurisdiction & Options</h3>

                        <div class="form-group">
                            <label for="jurisdiction">Jurisdiction Type:</label>
                            <select id="jurisdiction" data-field="jurisdiction">
                                <option value="rural" ${this.state.jurisdiction === 'rural' ? 'selected' : ''}>Rural/County</option>
                                <option value="standard" ${this.state.jurisdiction === 'standard' ? 'selected' : ''}>Standard City</option>
                                <option value="urban" ${this.state.jurisdiction === 'urban' ? 'selected' : ''}>Urban Area</option>
                                <option value="metro" ${this.state.jurisdiction === 'metro' ? 'selected' : ''}>Metro/Major City</option>
                                <option value="premium" ${this.state.jurisdiction === 'premium' ? 'selected' : ''}>Premium Jurisdiction</option>
                            </select>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="expeditedPermits" data-field="expeditedPermits" ${this.state.expeditedPermits ? 'checked' : ''}>
                                Expedited Processing (+50%)
                            </label>
                        </div>

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
                    </div>
                </div>

                <div class="calc-results">
                    <div class="results-summary">
                        <h3>Fee Estimate</h3>
                        <div class="cost-breakdown">
                            <div class="cost-line">
                                <span>Building Permit:</span>
                                <span class="cost-value" id="buildingPermitCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Trade Permits:</span>
                                <span class="cost-value" id="tradePermitsCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Plan Review:</span>
                                <span class="cost-value" id="planReviewCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Inspections:</span>
                                <span class="cost-value" id="inspectionsCost">$0</span>
                            </div>
                            <div class="cost-line subtotal">
                                <span>Subtotal:</span>
                                <span class="cost-value" id="subtotal">$0</span>
                            </div>
                            <div class="cost-line total">
                                <span>Total Fees:</span>
                                <span class="cost-value" id="totalCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Percentage of Project Value:</span>
                                <span class="cost-value" id="percentage">0%</span>
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

        // Show/hide units field based on project type
        if (field === 'projectType') {
            const unitsGroup = this.container.querySelector('#unitsGroup');
            if (unitsGroup) {
                unitsGroup.style.display = value === 'residential' ? 'block' : 'none';
            }
        }

        this.calculate();
    }

    calculate() {
        if (!this.state.projectValue || this.state.projectValue <= 0) {
            this.clearResults();
            return;
        }

        // Get factors
        const projectFactor = this.pricing.project_factors[this.state.projectType] || 1.0;
        const buildingFactor = this.pricing.building_factors[this.state.buildingType] || 1.0;
        const jurisdictionFactor = this.pricing.jurisdiction_factors[this.state.jurisdiction] || 1.0;
        const regionalFactor = this.getRegionalFactor();
        const expeditedFactor = this.state.expeditedPermits ? this.pricing.expedited_factor : 1.0;

        // Combined factor for all permit fees
        const combinedFactor = projectFactor * buildingFactor * jurisdictionFactor * regionalFactor * expeditedFactor;

        // Calculate building permit
        const buildingPermit = this.pricing.permit_types.building;
        let buildingPermitCost = this.calculatePermitFee(buildingPermit, this.state.projectValue) * combinedFactor;

        // Calculate trade permits
        let tradePermitsCost = 0;

        if (this.state.hasElectrical) {
            const electricalPermit = this.pricing.permit_types.electrical;
            tradePermitsCost += this.calculatePermitFee(electricalPermit, this.state.projectValue) * combinedFactor;
        }

        if (this.state.hasPlumbing) {
            const plumbingPermit = this.pricing.permit_types.plumbing;
            tradePermitsCost += this.calculatePermitFee(plumbingPermit, this.state.projectValue) * combinedFactor;
        }

        if (this.state.hasMechanical) {
            const mechanicalPermit = this.pricing.permit_types.mechanical;
            tradePermitsCost += this.calculatePermitFee(mechanicalPermit, this.state.projectValue) * combinedFactor;
        }

        if (this.state.hasStructural) {
            const structuralPermit = this.pricing.permit_types.structural;
            tradePermitsCost += this.calculatePermitFee(structuralPermit, this.state.projectValue) * combinedFactor;
        }

        // Calculate plan review (typically 65% of permit fees)
        const planReviewCost = (buildingPermitCost + tradePermitsCost) * this.pricing.plan_review_percentage;

        // Calculate inspections
        let inspectionsCost = this.pricing.inspection_fees.building_inspections;
        inspectionsCost += this.pricing.inspection_fees.final_inspection;

        if (this.state.hasElectrical) {
            inspectionsCost += this.pricing.inspection_fees.electrical_inspections;
        }

        if (this.state.hasPlumbing) {
            inspectionsCost += this.pricing.inspection_fees.plumbing_inspections;
        }

        if (this.state.hasMechanical) {
            inspectionsCost += this.pricing.inspection_fees.mechanical_inspections;
        }

        if (this.state.hasStructural) {
            inspectionsCost += this.pricing.inspection_fees.structural_inspections;
        }

        // Apply factors to inspections
        inspectionsCost *= combinedFactor;

        const subtotal = buildingPermitCost + tradePermitsCost + planReviewCost + inspectionsCost;
        const total = subtotal;
        const percentage = (total / this.state.projectValue) * 100;

        this.results = {
            buildingPermitCost,
            tradePermitsCost,
            planReviewCost,
            inspectionsCost,
            subtotal,
            total,
            percentage,
            projectFactor,
            buildingFactor,
            jurisdictionFactor,
            regionalFactor,
            expeditedFactor,
            combinedFactor
        };

        this.updateDisplay();
    }

    calculatePermitFee(permitType, projectValue) {
        const valuationFee = (projectValue / 1000) * permitType.per_1000_valuation;
        const calculatedFee = permitType.base_fee + valuationFee;

        // Apply min/max constraints
        return Math.max(permitType.min_fee, Math.min(calculatedFee, permitType.max_fee));
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

        this.container.querySelector('#buildingPermitCost').textContent = `$${this.results.buildingPermitCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#tradePermitsCost').textContent = `$${this.results.tradePermitsCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#planReviewCost').textContent = `$${this.results.planReviewCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#inspectionsCost').textContent = `$${this.results.inspectionsCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#subtotal').textContent = `$${this.results.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#totalCost').textContent = `$${this.results.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#percentage').textContent = `${this.results.percentage.toFixed(2)}%`;
    }

    clearResults() {
        if (!this.container) return;

        this.container.querySelector('#buildingPermitCost').textContent = '$0';
        this.container.querySelector('#tradePermitsCost').textContent = '$0';
        this.container.querySelector('#planReviewCost').textContent = '$0';
        this.container.querySelector('#inspectionsCost').textContent = '$0';
        this.container.querySelector('#subtotal').textContent = '$0';
        this.container.querySelector('#totalCost').textContent = '$0';
        this.container.querySelector('#percentage').textContent = '0%';
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
                <p>Project Value: $${this.state.projectValue.toLocaleString()}</p>
                <p>Project Type: ${this.state.projectType}</p>
                <p>Building Type: ${this.state.buildingType}</p>
                <p>Square Footage: ${this.state.squareFootage.toLocaleString()}</p>
                <p>Jurisdiction: ${this.state.jurisdiction}</p>
                <p>Expedited: ${this.state.expeditedPermits ? 'Yes' : 'No'}</p>
            </div>

            <div class="math-section">
                <h5>Fee Factors</h5>
                <p>Project Factor: ${this.results.projectFactor}x</p>
                <p>Building Factor: ${this.results.buildingFactor}x</p>
                <p>Jurisdiction Factor: ${this.results.jurisdictionFactor}x</p>
                <p>Regional Factor: ${this.results.regionalFactor}x</p>
                <p>Expedited Factor: ${this.results.expeditedFactor}x</p>
                <p><strong>Combined Factor: ${this.results.combinedFactor.toFixed(3)}x</strong></p>
            </div>

            <div class="math-section">
                <h5>Permit Calculations</h5>
                <p>Building Permit: $${this.results.buildingPermitCost.toFixed(2)}</p>
                <p>Trade Permits: $${this.results.tradePermitsCost.toFixed(2)}</p>
                <p>Plan Review (65% of permits): $${this.results.planReviewCost.toFixed(2)}</p>
                <p>Inspections: $${this.results.inspectionsCost.toFixed(2)}</p>
            </div>

            <div class="math-section">
                <h5>Included Permits & Inspections</h5>
                <p>Building: Always included</p>
                ${this.state.hasElectrical ? '<p>Electrical: Included</p>' : '<p>Electrical: Not included</p>'}
                ${this.state.hasPlumbing ? '<p>Plumbing: Included</p>' : '<p>Plumbing: Not included</p>'}
                ${this.state.hasMechanical ? '<p>Mechanical: Included</p>' : '<p>Mechanical: Not included</p>'}
                ${this.state.hasStructural ? '<p>Structural: Included</p>' : '<p>Structural: Not included</p>'}
            </div>

            <div class="math-section">
                <h5>Total</h5>
                <p>Total Fees: $${this.results.total.toFixed(2)}</p>
                <p><strong>Percentage of Project Value: ${this.results.percentage.toFixed(2)}%</strong></p>
            </div>
        `;

        this.container.querySelector('#mathBreakdown').innerHTML = breakdown;
    }

    getExportData() {
        return {
            project: {
                value: this.state.projectValue,
                type: this.state.projectType,
                buildingType: this.state.buildingType,
                squareFootage: this.state.squareFootage,
                numberOfUnits: this.state.numberOfUnits,
                hasElectrical: this.state.hasElectrical,
                hasPlumbing: this.state.hasPlumbing,
                hasMechanical: this.state.hasMechanical,
                hasStructural: this.state.hasStructural,
                jurisdiction: this.state.jurisdiction,
                expeditedPermits: this.state.expeditedPermits,
                region: this.state.region
            },
            costs: this.results,
            timestamp: new Date().toISOString()
        };
    }

    exportCSV() {
        const data = this.getExportData();
        const rows = [
            ['Permit & Fees Cost Estimate'],
            [''],
            ['Project Details'],
            ['Project Value', `$${data.project.value.toLocaleString()}`],
            ['Project Type', data.project.type],
            ['Building Type', data.project.buildingType],
            ['Square Footage', data.project.squareFootage.toLocaleString()],
            ['Number of Units', data.project.numberOfUnits],
            ['Jurisdiction', data.project.jurisdiction],
            ['Expedited', data.project.expeditedPermits ? 'Yes' : 'No'],
            ['Region', data.project.region],
            [''],
            ['Permits Included'],
            ['Electrical', data.project.hasElectrical ? 'Yes' : 'No'],
            ['Plumbing', data.project.hasPlumbing ? 'Yes' : 'No'],
            ['Mechanical', data.project.hasMechanical ? 'Yes' : 'No'],
            ['Structural', data.project.hasStructural ? 'Yes' : 'No'],
            [''],
            ['Fee Breakdown'],
            ['Building Permit', `$${data.costs.buildingPermitCost.toFixed(2)}`],
            ['Trade Permits', `$${data.costs.tradePermitsCost.toFixed(2)}`],
            ['Plan Review', `$${data.costs.planReviewCost.toFixed(2)}`],
            ['Inspections', `$${data.costs.inspectionsCost.toFixed(2)}`],
            ['Subtotal', `$${data.costs.subtotal.toFixed(2)}`],
            ['Total', `$${data.costs.total.toFixed(2)}`],
            ['Percentage of Project Value', `${data.costs.percentage.toFixed(2)}%`],
            [''],
            ['Generated', new Date().toLocaleString()]
        ];

        const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        this.downloadFile(csvContent, 'fees-estimate.csv', 'text/csv');
    }

    exportXLSX() {
        const data = this.getExportData();
        const workbook = XLSX.utils.book_new();

        const wsData = [
            ['Permit & Fees Cost Estimate'],
            [],
            ['Project Details'],
            ['Project Value', data.project.value],
            ['Project Type', data.project.type],
            ['Building Type', data.project.buildingType],
            ['Square Footage', data.project.squareFootage],
            ['Number of Units', data.project.numberOfUnits],
            ['Jurisdiction', data.project.jurisdiction],
            ['Expedited', data.project.expeditedPermits ? 'Yes' : 'No'],
            ['Region', data.project.region],
            [],
            ['Permits Included'],
            ['Electrical', data.project.hasElectrical ? 'Yes' : 'No'],
            ['Plumbing', data.project.hasPlumbing ? 'Yes' : 'No'],
            ['Mechanical', data.project.hasMechanical ? 'Yes' : 'No'],
            ['Structural', data.project.hasStructural ? 'Yes' : 'No'],
            [],
            ['Fee Breakdown'],
            ['Building Permit', data.costs.buildingPermitCost],
            ['Trade Permits', data.costs.tradePermitsCost],
            ['Plan Review', data.costs.planReviewCost],
            ['Inspections', data.costs.inspectionsCost],
            ['Subtotal', data.costs.subtotal],
            ['Total', data.costs.total],
            ['Percentage of Project Value', data.costs.percentage],
            [],
            ['Generated', new Date().toLocaleString()]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Permit Fees');
        XLSX.writeFile(workbook, 'fees-estimate.xlsx');
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = this.getExportData();

        doc.setFontSize(20);
        doc.text('Permit & Fees Cost Estimate', 20, 30);

        doc.setFontSize(14);
        doc.text('Project Details', 20, 50);

        doc.setFontSize(10);
        let yPos = 65;
        doc.text(`Project Value: $${data.project.value.toLocaleString()}`, 20, yPos);
        doc.text(`Type: ${data.project.type}`, 20, yPos += 10);
        doc.text(`Building Type: ${data.project.buildingType}`, 20, yPos += 10);
        doc.text(`Square Footage: ${data.project.squareFootage.toLocaleString()}`, 20, yPos += 10);
        doc.text(`Jurisdiction: ${data.project.jurisdiction}`, 20, yPos += 10);
        doc.text(`Expedited: ${data.project.expeditedPermits ? 'Yes' : 'No'}`, 20, yPos += 10);
        doc.text(`Region: ${data.project.region}`, 20, yPos += 10);

        doc.setFontSize(14);
        doc.text('Fee Breakdown', 20, yPos += 25);

        doc.setFontSize(10);
        doc.text(`Building Permit: $${data.costs.buildingPermitCost.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Trade Permits: $${data.costs.tradePermitsCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Plan Review: $${data.costs.planReviewCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Inspections: $${data.costs.inspectionsCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Subtotal: $${data.costs.subtotal.toFixed(2)}`, 20, yPos += 10);

        doc.setFontSize(12);
        doc.text(`Total: $${data.costs.total.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Percentage: ${data.costs.percentage.toFixed(2)}%`, 20, yPos += 10);

        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos += 20);

        doc.save('fees-estimate.pdf');
    }

    printResults() {
        const data = this.getExportData();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Permit & Fees Cost Estimate</title>
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
                    <h1>Permit & Fees Cost Estimate</h1>

                    <h2>Project Details</h2>
                    <div class="detail-line"><strong>Project Value:</strong> $${data.project.value.toLocaleString()}</div>
                    <div class="detail-line"><strong>Type:</strong> ${data.project.type}</div>
                    <div class="detail-line"><strong>Building Type:</strong> ${data.project.buildingType}</div>
                    <div class="detail-line"><strong>Square Footage:</strong> ${data.project.squareFootage.toLocaleString()}</div>
                    <div class="detail-line"><strong>Jurisdiction:</strong> ${data.project.jurisdiction}</div>
                    <div class="detail-line"><strong>Expedited:</strong> ${data.project.expeditedPermits ? 'Yes' : 'No'}</div>
                    <div class="detail-line"><strong>Region:</strong> ${data.project.region}</div>

                    <h2>Fee Breakdown</h2>
                    <div class="cost-line">
                        <span>Building Permit:</span>
                        <span>$${data.costs.buildingPermitCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Trade Permits:</span>
                        <span>$${data.costs.tradePermitsCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Plan Review:</span>
                        <span>$${data.costs.planReviewCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Inspections:</span>
                        <span>$${data.costs.inspectionsCost.toFixed(2)}</span>
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
                        <span>Percentage of Project Value:</span>
                        <span>${data.costs.percentage.toFixed(2)}%</span>
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
        const subject = encodeURIComponent('Permit & Fees Cost Estimate');
        const body = encodeURIComponent(`
Permit & Fees Cost Estimate

Project Details:
- Project Value: $${data.project.value.toLocaleString()}
- Type: ${data.project.type}
- Building Type: ${data.project.buildingType}
- Square Footage: ${data.project.squareFootage.toLocaleString()}
- Jurisdiction: ${data.project.jurisdiction}
- Expedited: ${data.project.expeditedPermits ? 'Yes' : 'No'}
- Region: ${data.project.region}

Fee Breakdown:
- Building Permit: $${data.costs.buildingPermitCost.toFixed(2)}
- Trade Permits: $${data.costs.tradePermitsCost.toFixed(2)}
- Plan Review: $${data.costs.planReviewCost.toFixed(2)}
- Inspections: $${data.costs.inspectionsCost.toFixed(2)}
- Subtotal: $${data.costs.subtotal.toFixed(2)}
- Total: $${data.costs.total.toFixed(2)}
- Percentage: ${data.costs.percentage.toFixed(2)}%

Generated: ${new Date().toLocaleString()}
        `);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    saveProject() {
        const data = this.getExportData();
        const projectData = JSON.stringify(data, null, 2);
        this.downloadFile(projectData, 'fees-project.json', 'application/json');
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
        calculatorInstance = new FeesCalculator();
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
        id: 'fees',
        title: 'Permit & Fees Calculator',
        category: 'project',
        description: 'Calculate building permits, inspections, and related fees',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default FeesCalculator;