/**
 * Electrical Calculator - Residential ROM Pricing
 * Calculates electrical work costs for residential projects
 */

class ElectricalCalculator {
  constructor() {
    this.pricing = null;
    this.container = null;
    this.state = {
      projectType: 'new_home',
      squareFootage: '',
      bedrooms: 3,
      bathrooms: 2,
      includePanel: true,
      includeOutlets: true,
      includeLighting: true,
      includeCeiling: true,
      includeExterior: true,
      panelSize: '200',
      laborRate: 85,
      regionFactor: 1.0,
      costOverrides: {}
    };
  }

  async init(element) {
    if (!element) {
      console.error('Electrical calculator: No DOM element provided');
      return;
    }

    this.container = element;

    try {
      await this.loadPricing();
      this.loadState();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Electrical calculator initialization error:', error);
      this.container.innerHTML = '<div class="error">Failed to load calculator</div>';
    }
  }

  async loadPricing() {
    try {
      const response = await fetch('/assets/data/pricing.base.json');
      const data = await response.json();
      this.pricing = data.electrical;
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      throw error;
    }
  }

  loadState() {
    const saved = localStorage.getItem('electrical-calculator-state');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }

  saveState() {
    localStorage.setItem('electrical-calculator-state', JSON.stringify(this.state));
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator-header">
        <h1>Electrical Calculator</h1>
        <p>Estimate electrical costs for residential projects using ROM pricing</p>
      </div>

      <div class="calculator-content">
        <div class="calculator-inputs">
          <div class="input-section">
            <h3>Project Details</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="projectType">Project Type</label>
                <select id="projectType">
                  <option value="new_home" ${this.state.projectType === 'new_home' ? 'selected' : ''}>
                    New Home Construction
                  </option>
                  <option value="addition" ${this.state.projectType === 'addition' ? 'selected' : ''}>
                    Home Addition
                  </option>
                  <option value="remodel" ${this.state.projectType === 'remodel' ? 'selected' : ''}>
                    Electrical Remodel
                  </option>
                  <option value="service_upgrade" ${this.state.projectType === 'service_upgrade' ? 'selected' : ''}>
                    Service Panel Upgrade
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label for="squareFootage">Square Footage</label>
                <input type="number" id="squareFootage" value="${this.state.squareFootage}"
                       min="500" max="10000" step="50" placeholder="2000">
              </div>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="bedrooms">Bedrooms</label>
                <input type="number" id="bedrooms" value="${this.state.bedrooms}"
                       min="1" max="10" step="1">
              </div>
              <div class="input-group">
                <label for="bathrooms">Bathrooms</label>
                <input type="number" id="bathrooms" value="${this.state.bathrooms}"
                       min="1" max="10" step="0.5">
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Electrical Panel</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="panelSize">Panel Size (Amps)</label>
                <select id="panelSize">
                  <option value="100" ${this.state.panelSize === '100' ? 'selected' : ''}>100 Amp</option>
                  <option value="200" ${this.state.panelSize === '200' ? 'selected' : ''}>200 Amp</option>
                  <option value="400" ${this.state.panelSize === '400' ? 'selected' : ''}>400 Amp</option>
                </select>
              </div>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includePanel"
                       ${this.state.includePanel ? 'checked' : ''}>
                Include Main Panel & Service
              </label>
            </div>
          </div>

          <div class="input-section">
            <h3>Electrical Systems</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includeOutlets"
                       ${this.state.includeOutlets ? 'checked' : ''}>
                Include Outlets & Receptacles
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeLighting"
                       ${this.state.includeLighting ? 'checked' : ''}>
                Include Interior Lighting
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeCeiling"
                       ${this.state.includeCeiling ? 'checked' : ''}>
                Include Ceiling Fans
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeExterior"
                       ${this.state.includeExterior ? 'checked' : ''}>
                Include Exterior Lighting & Outlets
              </label>
            </div>
          </div>

          <div class="input-section">
            <h3>Labor & Pricing</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="laborRate">Labor Rate ($/hour)</label>
                <input type="number" id="laborRate" value="${this.state.laborRate}"
                       min="50" max="150" step="5">
              </div>
              <div class="input-group">
                <label for="regionFactor">Regional Factor</label>
                <input type="number" id="regionFactor" value="${this.state.regionFactor}"
                       min="0.5" max="2.0" step="0.1">
              </div>
            </div>
          </div>

          <div class="button-row">
            <button id="calculateBtn" class="btn btn-primary">Calculate Electrical</button>
            <button id="clearBtn" class="btn btn-secondary">Clear</button>
          </div>
        </div>

        <div class="calculator-results" id="results" style="display: none;">
          <!-- Results will be populated here -->
        </div>
      </div>

      <div class="calculator-actions" id="calculatorActions" style="display: none;">
        <button id="showMathBtn" class="btn btn-info">Show Math</button>
        <div class="export-group">
          <button id="exportCsvBtn" class="btn btn-export">Export CSV</button>
          <button id="exportExcelBtn" class="btn btn-export">Export Excel</button>
          <button id="exportPdfBtn" class="btn btn-export">Export PDF</button>
          <button id="printBtn" class="btn btn-export">Print</button>
        </div>
        <div class="save-group">
          <button id="saveBtn" class="btn btn-save">Save Estimate</button>
          <button id="emailBtn" class="btn btn-save">Email</button>
        </div>
      </div>

      <div id="mathBreakdown" class="math-breakdown" style="display: none;">
        <!-- Math breakdown will be populated here -->
      </div>
    `;
  }

  bindEvents() {
    // Input change handlers
    const inputs = ['projectType', 'squareFootage', 'bedrooms', 'bathrooms',
                   'panelSize', 'includePanel', 'includeOutlets', 'includeLighting',
                   'includeCeiling', 'includeExterior', 'laborRate', 'regionFactor'];

    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.updateState());
        element.addEventListener('input', () => this.updateState());
      }
    });

    // Button handlers
    document.getElementById('calculateBtn')?.addEventListener('click', () => this.calculate());
    document.getElementById('clearBtn')?.addEventListener('click', () => this.clear());
    document.getElementById('showMathBtn')?.addEventListener('click', () => this.toggleMath());
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('exportExcelBtn')?.addEventListener('click', () => this.exportExcel());
    document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportPDF());
    document.getElementById('printBtn')?.addEventListener('click', () => this.print());
    document.getElementById('saveBtn')?.addEventListener('click', () => this.save());
    document.getElementById('emailBtn')?.addEventListener('click', () => this.email());
  }

  updateState() {
    // Update state from form inputs
    this.state.projectType = document.getElementById('projectType')?.value || 'new_home';
    this.state.squareFootage = parseFloat(document.getElementById('squareFootage')?.value || 0);
    this.state.bedrooms = parseInt(document.getElementById('bedrooms')?.value || 3);
    this.state.bathrooms = parseFloat(document.getElementById('bathrooms')?.value || 2);
    this.state.panelSize = document.getElementById('panelSize')?.value || '200';
    this.state.includePanel = document.getElementById('includePanel')?.checked || false;
    this.state.includeOutlets = document.getElementById('includeOutlets')?.checked || false;
    this.state.includeLighting = document.getElementById('includeLighting')?.checked || false;
    this.state.includeCeiling = document.getElementById('includeCeiling')?.checked || false;
    this.state.includeExterior = document.getElementById('includeExterior')?.checked || false;
    this.state.laborRate = parseFloat(document.getElementById('laborRate')?.value || 85);
    this.state.regionFactor = parseFloat(document.getElementById('regionFactor')?.value || 1.0);

    this.saveState();
  }

  validate() {
    const errors = [];

    if (!this.state.squareFootage || this.state.squareFootage <= 0) {
      errors.push('Square footage must be greater than 0');
    }
    if (this.state.squareFootage > 10000) {
      errors.push('Square footage seems unreasonably large');
    }
    if (this.state.bedrooms < 1) {
      errors.push('Number of bedrooms must be at least 1');
    }
    if (this.state.bathrooms < 1) {
      errors.push('Number of bathrooms must be at least 1');
    }

    return errors;
  }

  calculate() {
    this.updateState();

    const errors = this.validate();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    const results = this.performCalculations();
    this.displayResults(results);

    // Show action buttons
    document.getElementById('calculatorActions').style.display = 'block';
  }

  performCalculations() {
    const sqft = this.state.squareFootage;

    // ROM pricing factors based on project type
    const projectFactors = {
      'new_home': 1.0,
      'addition': 1.2,
      'remodel': 1.4,
      'service_upgrade': 0.3
    };

    const projectFactor = projectFactors[this.state.projectType] || 1.0;

    // Base electrical costs per sq ft by system
    const baseCosts = {
      panel: this.state.includePanel ? (this.pricing?.systems?.panel?.[this.state.panelSize] || 2500) : 0,
      outlets: this.state.includeOutlets ? sqft * (this.pricing?.systems?.outlets || 3.50) : 0,
      lighting: this.state.includeLighting ? sqft * (this.pricing?.systems?.lighting || 2.25) : 0,
      ceiling_fans: this.state.includeCeiling ? this.state.bedrooms * (this.pricing?.systems?.ceiling_fans || 350) : 0,
      exterior: this.state.includeExterior ? (this.pricing?.systems?.exterior || 800) : 0
    };

    // Apply project and regional factors
    const adjustedCosts = {};
    Object.keys(baseCosts).forEach(key => {
      adjustedCosts[key] = baseCosts[key] * projectFactor * this.state.regionFactor;
    });

    // Material costs (typically 40% of total for electrical)
    const materialTotal = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);
    const laborTotal = materialTotal * 1.5; // Labor is typically 1.5x material cost
    const totalCost = materialTotal + laborTotal;

    // Calculate labor hours
    const laborHours = laborTotal / this.state.laborRate;

    // Equipment costs (minimal for electrical - mostly hand tools)
    const equipmentCost = sqft * 0.15;

    return {
      squareFootage: sqft,
      projectType: this.state.projectType,
      systems: {
        panel: this.state.includePanel ? {
          description: `${this.state.panelSize} Amp Main Panel & Service`,
          cost: adjustedCosts.panel,
          included: true
        } : { included: false },
        outlets: this.state.includeOutlets ? {
          description: `Outlets & Receptacles (${sqft} sq ft)`,
          cost: adjustedCosts.outlets,
          rate: (this.pricing?.systems?.outlets || 3.50) * projectFactor * this.state.regionFactor,
          included: true
        } : { included: false },
        lighting: this.state.includeLighting ? {
          description: `Interior Lighting (${sqft} sq ft)`,
          cost: adjustedCosts.lighting,
          rate: (this.pricing?.systems?.lighting || 2.25) * projectFactor * this.state.regionFactor,
          included: true
        } : { included: false },
        ceiling_fans: this.state.includeCeiling ? {
          description: `Ceiling Fans (${this.state.bedrooms} units)`,
          cost: adjustedCosts.ceiling_fans,
          rate: (this.pricing?.systems?.ceiling_fans || 350) * projectFactor * this.state.regionFactor,
          included: true
        } : { included: false },
        exterior: this.state.includeExterior ? {
          description: 'Exterior Lighting & Outlets',
          cost: adjustedCosts.exterior,
          included: true
        } : { included: false }
      },
      labor: {
        hours: laborHours,
        rate: this.state.laborRate,
        cost: laborTotal
      },
      equipment: {
        cost: equipmentCost,
        description: "Hand tools and basic equipment"
      },
      totals: {
        materials: materialTotal,
        labor: laborTotal,
        equipment: equipmentCost,
        total: totalCost + equipmentCost,
        costPerSqFt: (totalCost + equipmentCost) / sqft
      },
      factors: {
        project: projectFactor,
        regional: this.state.regionFactor
      }
    };
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = `
      <h3>Electrical Estimate Results</h3>

      <div class="results-summary">
        <div class="result-card">
          <h4>Project Summary</h4>
          <div class="result-row">
            <span>Project Type:</span>
            <span>${this.state.projectType.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="result-row">
            <span>Square Footage:</span>
            <span>${results.squareFootage.toLocaleString()} sq ft</span>
          </div>
          <div class="result-row">
            <span>Bedrooms/Bathrooms:</span>
            <span>${this.state.bedrooms}BR / ${this.state.bathrooms}BA</span>
          </div>
          <div class="result-row">
            <span>Project Factor:</span>
            <span>${results.factors.project}x</span>
          </div>
        </div>

        <div class="result-card">
          <h4>Cost Breakdown</h4>
          <div class="result-row">
            <span>Materials:</span>
            <span>$${results.totals.materials.toLocaleString()}</span>
          </div>
          <div class="result-row">
            <span>Labor:</span>
            <span>$${results.totals.labor.toLocaleString()}</span>
          </div>
          <div class="result-row">
            <span>Equipment:</span>
            <span>$${results.totals.equipment.toLocaleString()}</span>
          </div>
          <div class="result-row total-row">
            <span><strong>Total Cost:</strong></span>
            <span><strong>$${results.totals.total.toLocaleString()}</strong></span>
          </div>
          <div class="result-row">
            <span>Cost per Sq Ft:</span>
            <span>$${results.totals.costPerSqFt.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="systems-breakdown">
        <h4>Electrical Systems Detail</h4>
        <table class="results-table">
          <thead>
            <tr>
              <th>System</th>
              <th>Description</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(results.systems).filter(([key, system]) => system.included).map(([key, system]) => `
              <tr>
                <td>${key.replace('_', ' ').toUpperCase()}</td>
                <td>${system.description}</td>
                <td>$${system.cost.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="labor-breakdown">
        <h4>Labor Detail</h4>
        <div class="result-row">
          <span>Labor Hours:</span>
          <span>${results.labor.hours.toFixed(1)} hours</span>
        </div>
        <div class="result-row">
          <span>Labor Rate:</span>
          <span>$${results.labor.rate.toFixed(2)}/hour</span>
        </div>
        <div class="result-row">
          <span>Total Labor Cost:</span>
          <span>$${results.labor.cost.toFixed(2)}</span>
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
    this.currentResults = results;
  }

  toggleMath() {
    const mathDiv = document.getElementById('mathBreakdown');
    if (mathDiv.style.display === 'none') {
      this.showMathBreakdown();
      mathDiv.style.display = 'block';
      document.getElementById('showMathBtn').textContent = 'Hide Math';
    } else {
      mathDiv.style.display = 'none';
      document.getElementById('showMathBtn').textContent = 'Show Math';
    }
  }

  showMathBreakdown() {
    if (!this.currentResults) return;

    const mathDiv = document.getElementById('mathBreakdown');
    const results = this.currentResults;

    mathDiv.innerHTML = `
      <h3>Calculation Breakdown</h3>

      <div class="math-section">
        <h4>ROM Factors Applied</h4>
        <div class="math-step">
          <strong>Project Type Factor:</strong> ${results.factors.project}x (${this.state.projectType.replace('_', ' ')})<br>
          <strong>Regional Factor:</strong> ${results.factors.regional}x
        </div>
      </div>

      <div class="math-section">
        <h4>System Calculations</h4>
        ${Object.entries(results.systems).filter(([key, system]) => system.included).map(([key, system]) => `
          <div class="math-step">
            <strong>${system.description}:</strong><br>
            ${system.rate ? `Base Rate: $${(system.rate / results.factors.project / results.factors.regional).toFixed(2)} × ${results.factors.project} × ${results.factors.regional}` : 'Fixed Cost'} = $${system.cost.toFixed(2)}
          </div>
        `).join('')}
      </div>

      <div class="math-section">
        <h4>Labor Calculations</h4>
        <div class="math-step">
          <strong>Labor Hours:</strong><br>
          Total Labor Cost: $${results.labor.cost.toFixed(2)} ÷ $${results.labor.rate}/hour = ${results.labor.hours.toFixed(1)} hours
        </div>
      </div>

      <div class="math-section">
        <h4>Final Totals</h4>
        <div class="math-step">
          <strong>Materials Total:</strong> $${results.totals.materials.toFixed(2)}<br>
          <strong>Labor Total:</strong> $${results.totals.labor.toFixed(2)}<br>
          <strong>Equipment Total:</strong> $${results.totals.equipment.toFixed(2)}<br>
          <strong>Grand Total:</strong> $${results.totals.total.toFixed(2)}<br>
          <strong>Cost per Sq Ft:</strong> $${results.totals.total.toFixed(2)} ÷ ${results.squareFootage} sq ft = $${results.totals.costPerSqFt.toFixed(2)}
        </div>
      </div>
    `;
  }

  clear() {
    this.state = {
      projectType: 'new_home',
      squareFootage: '',
      bedrooms: 3,
      bathrooms: 2,
      includePanel: true,
      includeOutlets: true,
      includeLighting: true,
      includeCeiling: true,
      includeExterior: true,
      panelSize: '200',
      laborRate: 85,
      regionFactor: 1.0,
      costOverrides: {}
    };

    localStorage.removeItem('electrical-calculator-state');
    this.render();
    this.bindEvents();

    // Hide results and actions
    document.getElementById('results').style.display = 'none';
    document.getElementById('calculatorActions').style.display = 'none';
    document.getElementById('mathBreakdown').style.display = 'none';
  }

  exportCSV() {
    if (!this.currentResults) return;

    const results = this.currentResults;
    const csvData = [
      ['Electrical Calculator Results'],
      [''],
      ['Project Details'],
      ['Project Type', this.state.projectType.replace('_', ' ')],
      ['Square Footage', results.squareFootage],
      ['Bedrooms', this.state.bedrooms],
      ['Bathrooms', this.state.bathrooms],
      [''],
      ['Systems Breakdown'],
      ['System', 'Description', 'Cost'],
      ...Object.entries(results.systems).filter(([key, system]) => system.included).map(([key, system]) => [
        key.replace('_', ' ').toUpperCase(),
        system.description,
        `$${system.cost.toFixed(2)}`
      ]),
      [''],
      ['Cost Summary'],
      ['Materials Total', `$${results.totals.materials.toFixed(2)}`],
      ['Labor Total', `$${results.totals.labor.toFixed(2)}`],
      ['Equipment Total', `$${results.totals.equipment.toFixed(2)}`],
      ['Grand Total', `$${results.totals.total.toFixed(2)}`],
      ['Cost per Sq Ft', `$${results.totals.costPerSqFt.toFixed(2)}`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrical-estimate-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportExcel() {
    alert('Excel export functionality requires SheetJS library integration');
  }

  exportPDF() {
    alert('PDF export functionality requires jsPDF library integration');
  }

  print() {
    window.print();
  }

  save() {
    const estimate = {
      timestamp: new Date().toISOString(),
      type: 'electrical',
      state: this.state,
      results: this.currentResults
    };

    const savedEstimates = JSON.parse(localStorage.getItem('saved-estimates') || '[]');
    savedEstimates.push(estimate);
    localStorage.setItem('saved-estimates', JSON.stringify(savedEstimates));

    alert('Estimate saved successfully!');
  }

  email() {
    if (!this.currentResults) return;

    const subject = encodeURIComponent('Electrical Calculator Estimate');
    const body = encodeURIComponent(`
      Electrical Estimate Summary:

      Project: ${this.state.projectType.replace('_', ' ').toUpperCase()}
      Area: ${this.currentResults.squareFootage.toLocaleString()} sq ft
      Layout: ${this.state.bedrooms}BR / ${this.state.bathrooms}BA

      Cost Breakdown:
      - Materials: $${this.currentResults.totals.materials.toFixed(2)}
      - Labor: $${this.currentResults.totals.labor.toFixed(2)}
      - Equipment: $${this.currentResults.totals.equipment.toFixed(2)}

      Total Cost: $${this.currentResults.totals.total.toFixed(2)}
      Cost per Sq Ft: $${this.currentResults.totals.costPerSqFt.toFixed(2)}

      Generated by CostFlow AI Electrical Calculator
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new ElectricalCalculator();
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
        id: 'electrical',
        title: 'Electrical Calculator',
        category: 'mep',
        description: 'Calculate costs for electrical projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default ElectricalCalculator;