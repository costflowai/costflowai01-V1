class GencondsCalculator {
    constructor() {
        this.container = null;
        this.state = {
            projectValue: 0,
            projectDuration: 6,
            projectType: 'commercial',
            complexity: 'standard',
            siteConditions: 'standard',
            climateZone: 'temperate',
            region: 'national',
            includeSupervision: true,
            includeTempFacilities: true,
            includeUtilities: true,
            includeSafety: true,
            includeCleaning: true
        };
        this.results = {};
        this.pricing = {};
        this.init = this.init.bind(this);
    }

    async init(container) {
        if (!container) {
            console.warn('Genconds calculator: No container element provided');
            container = document.getElementById('calculator-root') || document.querySelector('.calculator-container');
            if (!container) {
                console.error('Genconds calculator: No suitable container found');
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
            this.pricing = data.genconds || {};
        } catch (error) {
            console.error('Failed to load genconds pricing data:', error);
            this.pricing = this.getDefaultPricing();
        }
    }

    getDefaultPricing() {
        return {
            base_percentages: {
                supervision: 0.08,
                temp_facilities: 0.03,
                utilities: 0.025,
                safety_security: 0.015,
                cleaning: 0.01
            },
            project_factors: {
                residential: 0.85,
                commercial: 1.0,
                industrial: 1.2,
                infrastructure: 1.4,
                institutional: 1.1
            },
            complexity_factors: {
                simple: 0.8,
                standard: 1.0,
                complex: 1.3,
                very_complex: 1.6
            },
            site_factors: {
                greenfield: 0.9,
                standard: 1.0,
                urban_constrained: 1.2,
                occupied_renovation: 1.4,
                hazardous: 1.7
            },
            duration_factors: {
                short: 1.2,
                standard: 1.0,
                long: 0.9,
                very_long: 0.85
            },
            climate_factors: {
                mild: 0.95,
                temperate: 1.0,
                harsh_winter: 1.15,
                extreme_heat: 1.1,
                extreme_conditions: 1.25
            },
            monthly_base_costs: {
                site_office_trailer: 850,
                storage_container: 275,
                temporary_power: 450,
                temporary_water: 180,
                temporary_sanitation: 325,
                site_security: 1200,
                dumpster_service: 485,
                temporary_fencing: 380
            }
        };
    }

    loadState() {
        const saved = localStorage.getItem('genconds_calculator_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Failed to load genconds calculator state:', error);
            }
        }
    }

    saveState() {
        try {
            localStorage.setItem('genconds_calculator_state', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save genconds calculator state:', error);
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="genconds-calculator">
                <div class="calc-header">
                    <h1>General Conditions Cost Calculator</h1>
                    <p>Calculate general conditions costs for construction projects</p>
                </div>

                <div class="calc-form">
                    <div class="form-section">
                        <h3>Project Details</h3>

                        <div class="form-group">
                            <label for="projectValue">Total Project Value ($):</label>
                            <input type="number" id="projectValue" data-field="projectValue" value="${this.state.projectValue}" min="0" step="1000">
                            <small>Enter the total construction value excluding general conditions</small>
                        </div>

                        <div class="form-group">
                            <label for="projectDuration">Project Duration (months):</label>
                            <input type="number" id="projectDuration" data-field="projectDuration" value="${this.state.projectDuration}" min="1" step="1">
                        </div>

                        <div class="form-group">
                            <label for="projectType">Project Type:</label>
                            <select id="projectType" data-field="projectType">
                                <option value="residential" ${this.state.projectType === 'residential' ? 'selected' : ''}>Residential</option>
                                <option value="commercial" ${this.state.projectType === 'commercial' ? 'selected' : ''}>Commercial</option>
                                <option value="industrial" ${this.state.projectType === 'industrial' ? 'selected' : ''}>Industrial</option>
                                <option value="infrastructure" ${this.state.projectType === 'infrastructure' ? 'selected' : ''}>Infrastructure</option>
                                <option value="institutional" ${this.state.projectType === 'institutional' ? 'selected' : ''}>Institutional</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="complexity">Project Complexity:</label>
                            <select id="complexity" data-field="complexity">
                                <option value="simple" ${this.state.complexity === 'simple' ? 'selected' : ''}>Simple</option>
                                <option value="standard" ${this.state.complexity === 'standard' ? 'selected' : ''}>Standard</option>
                                <option value="complex" ${this.state.complexity === 'complex' ? 'selected' : ''}>Complex</option>
                                <option value="very_complex" ${this.state.complexity === 'very_complex' ? 'selected' : ''}>Very Complex</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Site & Environmental Factors</h3>

                        <div class="form-group">
                            <label for="siteConditions">Site Conditions:</label>
                            <select id="siteConditions" data-field="siteConditions">
                                <option value="greenfield" ${this.state.siteConditions === 'greenfield' ? 'selected' : ''}>Greenfield Site</option>
                                <option value="standard" ${this.state.siteConditions === 'standard' ? 'selected' : ''}>Standard Site</option>
                                <option value="urban_constrained" ${this.state.siteConditions === 'urban_constrained' ? 'selected' : ''}>Urban Constrained</option>
                                <option value="occupied_renovation" ${this.state.siteConditions === 'occupied_renovation' ? 'selected' : ''}>Occupied Renovation</option>
                                <option value="hazardous" ${this.state.siteConditions === 'hazardous' ? 'selected' : ''}>Hazardous/Contaminated</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="climateZone">Climate Zone:</label>
                            <select id="climateZone" data-field="climateZone">
                                <option value="mild" ${this.state.climateZone === 'mild' ? 'selected' : ''}>Mild Climate</option>
                                <option value="temperate" ${this.state.climateZone === 'temperate' ? 'selected' : ''}>Temperate</option>
                                <option value="harsh_winter" ${this.state.climateZone === 'harsh_winter' ? 'selected' : ''}>Harsh Winter</option>
                                <option value="extreme_heat" ${this.state.climateZone === 'extreme_heat' ? 'selected' : ''}>Extreme Heat</option>
                                <option value="extreme_conditions" ${this.state.climateZone === 'extreme_conditions' ? 'selected' : ''}>Extreme Conditions</option>
                            </select>
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

                    <div class="form-section">
                        <h3>Included Items</h3>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="includeSupervision" data-field="includeSupervision" ${this.state.includeSupervision ? 'checked' : ''}>
                                Supervision & Project Management
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="includeTempFacilities" data-field="includeTempFacilities" ${this.state.includeTempFacilities ? 'checked' : ''}>
                                Temporary Facilities (office, storage)
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="includeUtilities" data-field="includeUtilities" ${this.state.includeUtilities ? 'checked' : ''}>
                                Temporary Utilities (power, water, telecom)
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="includeSafety" data-field="includeSafety" ${this.state.includeSafety ? 'checked' : ''}>
                                Safety & Security
                            </label>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="includeCleaning" data-field="includeCleaning" ${this.state.includeCleaning ? 'checked' : ''}>
                                Site Cleaning & Maintenance
                            </label>
                        </div>
                    </div>
                </div>

                <div class="calc-results">
                    <div class="results-summary">
                        <h3>Cost Estimate</h3>
                        <div class="cost-breakdown">
                            <div class="cost-line">
                                <span>Supervision & Management:</span>
                                <span class="cost-value" id="supervisionCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Temporary Facilities:</span>
                                <span class="cost-value" id="facilitiesCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Temporary Utilities:</span>
                                <span class="cost-value" id="utilitiesCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Safety & Security:</span>
                                <span class="cost-value" id="safetyCost">$0</span>
                            </div>
                            <div class="cost-line">
                                <span>Cleaning & Maintenance:</span>
                                <span class="cost-value" id="cleaningCost">$0</span>
                            </div>
                            <div class="cost-line subtotal">
                                <span>Subtotal:</span>
                                <span class="cost-value" id="subtotal">$0</span>
                            </div>
                            <div class="cost-line total">
                                <span>Total General Conditions:</span>
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
        this.calculate();
    }

    calculate() {
        if (!this.state.projectValue || this.state.projectValue <= 0) {
            this.clearResults();
            return;
        }

        // Get all factors
        const projectFactor = this.pricing.project_factors[this.state.projectType] || 1.0;
        const complexityFactor = this.pricing.complexity_factors[this.state.complexity] || 1.0;
        const siteFactor = this.pricing.site_factors[this.state.siteConditions] || 1.0;
        const climateFactor = this.pricing.climate_factors[this.state.climateZone] || 1.0;
        const regionalFactor = this.getRegionalFactor();
        const durationFactor = this.getDurationFactor();

        // Combined factor for all adjustments
        const combinedFactor = projectFactor * complexityFactor * siteFactor *
                              climateFactor * regionalFactor * durationFactor;

        // Calculate each component
        let supervisionCost = 0;
        let facilitiesCost = 0;
        let utilitiesCost = 0;
        let safetyCost = 0;
        let cleaningCost = 0;

        if (this.state.includeSupervision) {
            supervisionCost = this.state.projectValue * this.pricing.base_percentages.supervision * combinedFactor;
        }

        if (this.state.includeTempFacilities) {
            // Percentage-based cost plus monthly fixed costs
            const percentageCost = this.state.projectValue * this.pricing.base_percentages.temp_facilities * combinedFactor;
            const monthlyCosts = (this.pricing.monthly_base_costs.site_office_trailer +
                                 this.pricing.monthly_base_costs.storage_container) *
                                this.state.projectDuration * regionalFactor;
            facilitiesCost = percentageCost + monthlyCosts;
        }

        if (this.state.includeUtilities) {
            // Percentage-based cost plus monthly utility costs
            const percentageCost = this.state.projectValue * this.pricing.base_percentages.utilities * combinedFactor;
            const monthlyCosts = (this.pricing.monthly_base_costs.temporary_power +
                                 this.pricing.monthly_base_costs.temporary_water) *
                                this.state.projectDuration * regionalFactor;
            utilitiesCost = percentageCost + monthlyCosts;
        }

        if (this.state.includeSafety) {
            // Percentage-based cost plus monthly security costs
            const percentageCost = this.state.projectValue * this.pricing.base_percentages.safety_security * combinedFactor;
            const monthlyCosts = (this.pricing.monthly_base_costs.site_security +
                                 this.pricing.monthly_base_costs.temporary_fencing) *
                                this.state.projectDuration * regionalFactor;
            safetyCost = percentageCost + monthlyCosts;
        }

        if (this.state.includeCleaning) {
            // Percentage-based cost plus monthly cleaning services
            const percentageCost = this.state.projectValue * this.pricing.base_percentages.cleaning * combinedFactor;
            const monthlyCosts = this.pricing.monthly_base_costs.dumpster_service *
                                this.state.projectDuration * regionalFactor;
            cleaningCost = percentageCost + monthlyCosts;
        }

        const subtotal = supervisionCost + facilitiesCost + utilitiesCost + safetyCost + cleaningCost;
        const total = subtotal;
        const percentage = (total / this.state.projectValue) * 100;

        this.results = {
            supervisionCost,
            facilitiesCost,
            utilitiesCost,
            safetyCost,
            cleaningCost,
            subtotal,
            total,
            percentage,
            projectFactor,
            complexityFactor,
            siteFactor,
            climateFactor,
            regionalFactor,
            durationFactor,
            combinedFactor
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

    getDurationFactor() {
        if (this.state.projectDuration <= 3) return this.pricing.duration_factors.short;
        if (this.state.projectDuration <= 12) return this.pricing.duration_factors.standard;
        if (this.state.projectDuration <= 24) return this.pricing.duration_factors.long;
        return this.pricing.duration_factors.very_long;
    }

    updateDisplay() {
        if (!this.container || !this.results) return;

        this.container.querySelector('#supervisionCost').textContent = `$${this.results.supervisionCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#facilitiesCost').textContent = `$${this.results.facilitiesCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#utilitiesCost').textContent = `$${this.results.utilitiesCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#safetyCost').textContent = `$${this.results.safetyCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#cleaningCost').textContent = `$${this.results.cleaningCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#subtotal').textContent = `$${this.results.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#totalCost').textContent = `$${this.results.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        this.container.querySelector('#percentage').textContent = `${this.results.percentage.toFixed(1)}%`;
    }

    clearResults() {
        if (!this.container) return;

        this.container.querySelector('#supervisionCost').textContent = '$0';
        this.container.querySelector('#facilitiesCost').textContent = '$0';
        this.container.querySelector('#utilitiesCost').textContent = '$0';
        this.container.querySelector('#safetyCost').textContent = '$0';
        this.container.querySelector('#cleaningCost').textContent = '$0';
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
                <p>Duration: ${this.state.projectDuration} months</p>
                <p>Type: ${this.state.projectType}</p>
                <p>Complexity: ${this.state.complexity}</p>
                <p>Site Conditions: ${this.state.siteConditions}</p>
                <p>Climate: ${this.state.climateZone}</p>
            </div>

            <div class="math-section">
                <h5>Cost Factors</h5>
                <p>Project Factor: ${this.results.projectFactor}x</p>
                <p>Complexity Factor: ${this.results.complexityFactor}x</p>
                <p>Site Factor: ${this.results.siteFactor}x</p>
                <p>Climate Factor: ${this.results.climateFactor}x</p>
                <p>Regional Factor: ${this.results.regionalFactor}x</p>
                <p>Duration Factor: ${this.results.durationFactor}x</p>
                <p><strong>Combined Factor: ${this.results.combinedFactor.toFixed(3)}x</strong></p>
            </div>

            <div class="math-section">
                <h5>Component Calculations</h5>
                ${this.state.includeSupervision ? `<p>Supervision: $${this.state.projectValue.toLocaleString()} × ${this.pricing.base_percentages.supervision} × ${this.results.combinedFactor.toFixed(3)} = $${this.results.supervisionCost.toFixed(2)}</p>` : ''}
                ${this.state.includeTempFacilities ? `<p>Temp Facilities: Base + Monthly costs = $${this.results.facilitiesCost.toFixed(2)}</p>` : ''}
                ${this.state.includeUtilities ? `<p>Utilities: Base + Monthly costs = $${this.results.utilitiesCost.toFixed(2)}</p>` : ''}
                ${this.state.includeSafety ? `<p>Safety & Security: Base + Monthly costs = $${this.results.safetyCost.toFixed(2)}</p>` : ''}
                ${this.state.includeCleaning ? `<p>Cleaning: Base + Monthly costs = $${this.results.cleaningCost.toFixed(2)}</p>` : ''}
            </div>

            <div class="math-section">
                <h5>Total</h5>
                <p>Total General Conditions: $${this.results.total.toFixed(2)}</p>
                <p><strong>Percentage of Project Value: ${this.results.percentage.toFixed(1)}%</strong></p>
            </div>
        `;

        this.container.querySelector('#mathBreakdown').innerHTML = breakdown;
    }

    getExportData() {
        return {
            project: {
                value: this.state.projectValue,
                duration: this.state.projectDuration,
                type: this.state.projectType,
                complexity: this.state.complexity,
                siteConditions: this.state.siteConditions,
                climateZone: this.state.climateZone,
                region: this.state.region,
                includeSupervision: this.state.includeSupervision,
                includeTempFacilities: this.state.includeTempFacilities,
                includeUtilities: this.state.includeUtilities,
                includeSafety: this.state.includeSafety,
                includeCleaning: this.state.includeCleaning
            },
            costs: this.results,
            timestamp: new Date().toISOString()
        };
    }

    exportCSV() {
        const data = this.getExportData();
        const rows = [
            ['General Conditions Cost Estimate'],
            [''],
            ['Project Details'],
            ['Project Value', `$${data.project.value.toLocaleString()}`],
            ['Duration (months)', data.project.duration],
            ['Type', data.project.type],
            ['Complexity', data.project.complexity],
            ['Site Conditions', data.project.siteConditions],
            ['Climate Zone', data.project.climateZone],
            ['Region', data.project.region],
            [''],
            ['Included Items'],
            ['Supervision', data.project.includeSupervision ? 'Yes' : 'No'],
            ['Temporary Facilities', data.project.includeTempFacilities ? 'Yes' : 'No'],
            ['Utilities', data.project.includeUtilities ? 'Yes' : 'No'],
            ['Safety & Security', data.project.includeSafety ? 'Yes' : 'No'],
            ['Cleaning', data.project.includeCleaning ? 'Yes' : 'No'],
            [''],
            ['Cost Breakdown'],
            ['Supervision & Management', `$${data.costs.supervisionCost.toFixed(2)}`],
            ['Temporary Facilities', `$${data.costs.facilitiesCost.toFixed(2)}`],
            ['Temporary Utilities', `$${data.costs.utilitiesCost.toFixed(2)}`],
            ['Safety & Security', `$${data.costs.safetyCost.toFixed(2)}`],
            ['Cleaning & Maintenance', `$${data.costs.cleaningCost.toFixed(2)}`],
            ['Subtotal', `$${data.costs.subtotal.toFixed(2)}`],
            ['Total', `$${data.costs.total.toFixed(2)}`],
            ['Percentage of Project Value', `${data.costs.percentage.toFixed(1)}%`],
            [''],
            ['Generated', new Date().toLocaleString()]
        ];

        const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        this.downloadFile(csvContent, 'genconds-estimate.csv', 'text/csv');
    }

    exportXLSX() {
        const data = this.getExportData();
        const workbook = XLSX.utils.book_new();

        const wsData = [
            ['General Conditions Cost Estimate'],
            [],
            ['Project Details'],
            ['Project Value', data.project.value],
            ['Duration (months)', data.project.duration],
            ['Type', data.project.type],
            ['Complexity', data.project.complexity],
            ['Site Conditions', data.project.siteConditions],
            ['Climate Zone', data.project.climateZone],
            ['Region', data.project.region],
            [],
            ['Included Items'],
            ['Supervision', data.project.includeSupervision ? 'Yes' : 'No'],
            ['Temporary Facilities', data.project.includeTempFacilities ? 'Yes' : 'No'],
            ['Utilities', data.project.includeUtilities ? 'Yes' : 'No'],
            ['Safety & Security', data.project.includeSafety ? 'Yes' : 'No'],
            ['Cleaning', data.project.includeCleaning ? 'Yes' : 'No'],
            [],
            ['Cost Breakdown'],
            ['Supervision & Management', data.costs.supervisionCost],
            ['Temporary Facilities', data.costs.facilitiesCost],
            ['Temporary Utilities', data.costs.utilitiesCost],
            ['Safety & Security', data.costs.safetyCost],
            ['Cleaning & Maintenance', data.costs.cleaningCost],
            ['Subtotal', data.costs.subtotal],
            ['Total', data.costs.total],
            ['Percentage of Project Value', data.costs.percentage],
            [],
            ['Generated', new Date().toLocaleString()]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'General Conditions');
        XLSX.writeFile(workbook, 'genconds-estimate.xlsx');
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = this.getExportData();

        doc.setFontSize(20);
        doc.text('General Conditions Cost Estimate', 20, 30);

        doc.setFontSize(14);
        doc.text('Project Details', 20, 50);

        doc.setFontSize(10);
        let yPos = 65;
        doc.text(`Project Value: $${data.project.value.toLocaleString()}`, 20, yPos);
        doc.text(`Duration: ${data.project.duration} months`, 20, yPos += 10);
        doc.text(`Type: ${data.project.type}`, 20, yPos += 10);
        doc.text(`Complexity: ${data.project.complexity}`, 20, yPos += 10);
        doc.text(`Site: ${data.project.siteConditions}`, 20, yPos += 10);
        doc.text(`Climate: ${data.project.climateZone}`, 20, yPos += 10);
        doc.text(`Region: ${data.project.region}`, 20, yPos += 10);

        doc.setFontSize(14);
        doc.text('Cost Breakdown', 20, yPos += 25);

        doc.setFontSize(10);
        doc.text(`Supervision: $${data.costs.supervisionCost.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Temp Facilities: $${data.costs.facilitiesCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Utilities: $${data.costs.utilitiesCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Safety: $${data.costs.safetyCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Cleaning: $${data.costs.cleaningCost.toFixed(2)}`, 20, yPos += 10);
        doc.text(`Subtotal: $${data.costs.subtotal.toFixed(2)}`, 20, yPos += 10);

        doc.setFontSize(12);
        doc.text(`Total: $${data.costs.total.toFixed(2)}`, 20, yPos += 15);
        doc.text(`Percentage: ${data.costs.percentage.toFixed(1)}%`, 20, yPos += 10);

        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos += 20);

        doc.save('genconds-estimate.pdf');
    }

    printResults() {
        const data = this.getExportData();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>General Conditions Cost Estimate</title>
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
                    <h1>General Conditions Cost Estimate</h1>

                    <h2>Project Details</h2>
                    <div class="detail-line"><strong>Project Value:</strong> $${data.project.value.toLocaleString()}</div>
                    <div class="detail-line"><strong>Duration:</strong> ${data.project.duration} months</div>
                    <div class="detail-line"><strong>Type:</strong> ${data.project.type}</div>
                    <div class="detail-line"><strong>Complexity:</strong> ${data.project.complexity}</div>
                    <div class="detail-line"><strong>Site:</strong> ${data.project.siteConditions}</div>
                    <div class="detail-line"><strong>Climate:</strong> ${data.project.climateZone}</div>
                    <div class="detail-line"><strong>Region:</strong> ${data.project.region}</div>

                    <h2>Cost Breakdown</h2>
                    <div class="cost-line">
                        <span>Supervision & Management:</span>
                        <span>$${data.costs.supervisionCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Temporary Facilities:</span>
                        <span>$${data.costs.facilitiesCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Temporary Utilities:</span>
                        <span>$${data.costs.utilitiesCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Safety & Security:</span>
                        <span>$${data.costs.safetyCost.toFixed(2)}</span>
                    </div>
                    <div class="cost-line">
                        <span>Cleaning & Maintenance:</span>
                        <span>$${data.costs.cleaningCost.toFixed(2)}</span>
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
                        <span>${data.costs.percentage.toFixed(1)}%</span>
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
        const subject = encodeURIComponent('General Conditions Cost Estimate');
        const body = encodeURIComponent(`
General Conditions Cost Estimate

Project Details:
- Project Value: $${data.project.value.toLocaleString()}
- Duration: ${data.project.duration} months
- Type: ${data.project.type}
- Complexity: ${data.project.complexity}
- Site: ${data.project.siteConditions}
- Climate: ${data.project.climateZone}
- Region: ${data.project.region}

Cost Breakdown:
- Supervision & Management: $${data.costs.supervisionCost.toFixed(2)}
- Temporary Facilities: $${data.costs.facilitiesCost.toFixed(2)}
- Temporary Utilities: $${data.costs.utilitiesCost.toFixed(2)}
- Safety & Security: $${data.costs.safetyCost.toFixed(2)}
- Cleaning & Maintenance: $${data.costs.cleaningCost.toFixed(2)}
- Subtotal: $${data.costs.subtotal.toFixed(2)}
- Total: $${data.costs.total.toFixed(2)}
- Percentage: ${data.costs.percentage.toFixed(1)}%

Generated: ${new Date().toLocaleString()}
        `);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    saveProject() {
        const data = this.getExportData();
        const projectData = JSON.stringify(data, null, 2);
        this.downloadFile(projectData, 'genconds-project.json', 'application/json');
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
        calculatorInstance = new GencondsCalculator();
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
        id: 'genconds',
        title: 'General Conditions Calculator',
        category: 'project',
        description: 'Calculate general conditions costs for construction projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default GencondsCalculator;