/**
 * Plumbing Calculator - Residential ROM Pricing
 * Calculates plumbing costs for residential projects
 */

class PlumbingCalculator {
  constructor() {
    this.pricing = null;
    this.container = null;
    this.state = {
      projectType: 'new_home',
      squareFootage: '',
      bedrooms: 3,
      bathrooms: 2,
      halfBaths: 1,
      kitchen: true,
      laundryRoom: true,
      waterHeater: true,
      waterHeaterType: 'tank',
      includeRoughIn: true,
      includeFixtures: true,
      laborRate: 85,
      regionFactor: 1.0,
      costOverrides: {}
    };
  }

  async init(element) {
    if (!element) {
      console.error('Plumbing calculator: No DOM element provided');
      return;
    }

    this.container = element;

    try {
      await this.loadPricing();
      this.loadState();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Plumbing calculator initialization error:', error);
      this.container.innerHTML = '<div class="error">Failed to load calculator</div>';
    }
  }

  async loadPricing() {
    try {
      const response = await fetch('/assets/data/pricing.base.json');
      const data = await response.json();
      this.pricing = data.plumbing;
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      throw error;
    }
  }

  loadState() {
    const saved = localStorage.getItem('plumbing-calculator-state');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }

  saveState() {
    localStorage.setItem('plumbing-calculator-state', JSON.stringify(this.state));
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator-header">
        <h1>Plumbing Calculator</h1>
        <p>Estimate plumbing costs for residential projects using ROM pricing</p>
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
                    Plumbing Remodel
                  </option>
                  <option value="service_upgrade" ${this.state.projectType === 'service_upgrade' ? 'selected' : ''}>
                    Service Line Upgrade
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label for="squareFootage">Square Footage</label>
                <input type="number" id="squareFootage" value="${this.state.squareFootage}"
                       min="500" max="10000" step="50" placeholder="2000">
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Fixture Count</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="bedrooms">Bedrooms</label>
                <input type="number" id="bedrooms" value="${this.state.bedrooms}"
                       min="1" max="10" step="1">
              </div>
              <div class="input-group">
                <label for="bathrooms">Full Bathrooms</label>
                <input type="number" id="bathrooms" value="${this.state.bathrooms}"
                       min="1" max="10" step="1">
              </div>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="halfBaths">Half Bathrooms</label>
                <input type="number" id="halfBaths" value="${this.state.halfBaths}"
                       min="0" max="5" step="1">
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Additional Areas</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="kitchen"
                       ${this.state.kitchen ? 'checked' : ''}>
                Include Kitchen Plumbing
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="laundryRoom"
                       ${this.state.laundryRoom ? 'checked' : ''}>
                Include Laundry Room
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="waterHeater"
                       ${this.state.waterHeater ? 'checked' : ''}>
                Include Water Heater
              </label>
            </div>
          </div>

          <div class="input-section">
            <h3>Water Heater Type</h3>
            <div class="input-group">
              <label for="waterHeaterType">Water Heater Type</label>
              <select id="waterHeaterType" ${!this.state.waterHeater ? 'disabled' : ''}>
                <option value="tank" ${this.state.waterHeaterType === 'tank' ? 'selected' : ''}>
                  Tank Water Heater (40-50 gal)
                </option>
                <option value="tankless" ${this.state.waterHeaterType === 'tankless' ? 'selected' : ''}>
                  Tankless Water Heater
                </option>
                <option value="hybrid" ${this.state.waterHeaterType === 'hybrid' ? 'selected' : ''}>
                  Hybrid Heat Pump
                </option>
              </select>
            </div>
          </div>

          <div class="input-section">
            <h3>Plumbing Scope</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includeRoughIn"
                       ${this.state.includeRoughIn ? 'checked' : ''}>
                Include Rough-In Plumbing
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeFixtures"
                       ${this.state.includeFixtures ? 'checked' : ''}>
                Include Fixture Installation
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
            <button id="calculateBtn" class="btn btn-primary">Calculate Plumbing</button>
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
    const inputs = ['projectType', 'squareFootage', 'bedrooms', 'bathrooms', 'halfBaths',
                   'kitchen', 'laundryRoom', 'waterHeater', 'waterHeaterType',
                   'includeRoughIn', 'includeFixtures', 'laborRate', 'regionFactor'];

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

    // Special handler for water heater checkbox to enable/disable type dropdown
    document.getElementById('waterHeater')?.addEventListener('change', (e) => {
      document.getElementById('waterHeaterType').disabled = !e.target.checked;
    });
  }

  updateState() {
    // Update state from form inputs
    this.state.projectType = document.getElementById('projectType')?.value || 'new_home';
    this.state.squareFootage = parseFloat(document.getElementById('squareFootage')?.value || 0);
    this.state.bedrooms = parseInt(document.getElementById('bedrooms')?.value || 3);
    this.state.bathrooms = parseInt(document.getElementById('bathrooms')?.value || 2);
    this.state.halfBaths = parseInt(document.getElementById('halfBaths')?.value || 1);
    this.state.kitchen = document.getElementById('kitchen')?.checked || false;
    this.state.laundryRoom = document.getElementById('laundryRoom')?.checked || false;
    this.state.waterHeater = document.getElementById('waterHeater')?.checked || false;
    this.state.waterHeaterType = document.getElementById('waterHeaterType')?.value || 'tank';
    this.state.includeRoughIn = document.getElementById('includeRoughIn')?.checked || false;
    this.state.includeFixtures = document.getElementById('includeFixtures')?.checked || false;
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
      errors.push('Number of full bathrooms must be at least 1');
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
      'addition': 1.3,
      'remodel': 1.6,
      'service_upgrade': 0.4
    };

    const projectFactor = projectFactors[this.state.projectType] || 1.0;

    // Base plumbing costs by fixture/system
    const baseCosts = {
      rough_in: this.state.includeRoughIn ? sqft * (this.pricing?.systems?.rough_in || 4.50) : 0,
      full_bath: this.state.bathrooms * (this.pricing?.fixtures?.full_bath || 2800),
      half_bath: this.state.halfBaths * (this.pricing?.fixtures?.half_bath || 1200),
      kitchen: this.state.kitchen ? (this.pricing?.fixtures?.kitchen || 1800) : 0,
      laundry: this.state.laundryRoom ? (this.pricing?.fixtures?.laundry || 800) : 0,
      water_heater: this.state.waterHeater ? (this.pricing?.fixtures?.water_heater?.[this.state.waterHeaterType] || 1500) : 0
    };

    // Apply project and regional factors
    const adjustedCosts = {};
    Object.keys(baseCosts).forEach(key => {
      adjustedCosts[key] = baseCosts[key] * projectFactor * this.state.regionFactor;
    });

    // If fixtures not included, reduce fixture costs by 60% (rough-in only)
    if (!this.state.includeFixtures) {
      ['full_bath', 'half_bath', 'kitchen', 'laundry', 'water_heater'].forEach(key => {
        adjustedCosts[key] *= 0.4; // Keep only rough-in portion
      });
    }

    // Material and labor split (plumbing is typically 45% material, 55% labor)
    const materialTotal = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);
    const laborTotal = materialTotal * 1.22; // Labor is typically 1.22x material cost
    const totalCost = materialTotal + laborTotal;

    // Calculate labor hours
    const laborHours = laborTotal / this.state.laborRate;

    // Equipment costs (pipe threading, cutting tools)
    const equipmentCost = sqft * 0.25;

    // Total fixture count for summary
    const totalFixtures = this.state.bathrooms + this.state.halfBaths +
                         (this.state.kitchen ? 1 : 0) +
                         (this.state.laundryRoom ? 1 : 0) +
                         (this.state.waterHeater ? 1 : 0);

    return {
      squareFootage: sqft,
      projectType: this.state.projectType,
      fixtureCount: totalFixtures,
      systems: {
        rough_in: this.state.includeRoughIn ? {
          description: `Rough-In Plumbing (${sqft} sq ft)`,
          cost: adjustedCosts.rough_in,
          rate: (this.pricing?.systems?.rough_in || 4.50) * projectFactor * this.state.regionFactor,
          included: true
        } : { included: false },
        full_bath: this.state.bathrooms > 0 ? {
          description: `Full Bathrooms (${this.state.bathrooms} units)`,
          cost: adjustedCosts.full_bath,
          rate: (this.pricing?.fixtures?.full_bath || 2800) * projectFactor * this.state.regionFactor,
          included: true
        } : { included: false },
        half_bath: this.state.halfBaths > 0 ? {
          description: `Half Bathrooms (${this.state.halfBaths} units)`,
          cost: adjustedCosts.half_bath,
          rate: (this.pricing?.fixtures?.half_bath || 1200) * projectFactor * this.state.regionFactor,
          included: true
        } : { included: false },
        kitchen: this.state.kitchen ? {
          description: 'Kitchen Plumbing',
          cost: adjustedCosts.kitchen,
          included: true
        } : { included: false },
        laundry: this.state.laundryRoom ? {
          description: 'Laundry Room Plumbing',
          cost: adjustedCosts.laundry,
          included: true
        } : { included: false },
        water_heater: this.state.waterHeater ? {
          description: `${this.state.waterHeaterType.toUpperCase()} Water Heater`,
          cost: adjustedCosts.water_heater,
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
        description: "Plumbing tools and equipment"
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
        regional: this.state.regionFactor,
        fixturesIncluded: this.state.includeFixtures
      }
    };
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = `
      <h3>Plumbing Estimate Results</h3>

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
            <span>Total Fixtures:</span>
            <span>${results.fixtureCount} fixtures</span>
          </div>
          <div class="result-row">
            <span>Scope:</span>
            <span>${this.state.includeRoughIn ? 'Rough-in' : ''} ${this.state.includeFixtures ? '+ Fixtures' : 'Only'}</span>
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
        <h4>Plumbing Systems Detail</h4>
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
          <strong>Regional Factor:</strong> ${results.factors.regional}x<br>
          <strong>Fixtures Included:</strong> ${results.factors.fixturesIncluded ? 'Yes' : 'No (rough-in only)'}
        </div>
      </div>

      <div class="math-section">
        <h4>System Calculations</h4>
        ${Object.entries(results.systems).filter(([key, system]) => system.included).map(([key, system]) => `
          <div class="math-step">
            <strong>${system.description}:</strong><br>
            ${system.rate ? `Base Rate: $${(system.rate / results.factors.project / results.factors.regional).toFixed(2)} × ${results.factors.project} × ${results.factors.regional}` : 'Fixed Cost'} = $${system.cost.toFixed(2)}
            ${!results.factors.fixturesIncluded && key !== 'rough_in' ? '<br><em>Reduced 60% for rough-in only</em>' : ''}
          </div>
        `).join('')}
      </div>

      <div class="math-section">
        <h4>Labor Calculations</h4>
        <div class="math-step">
          <strong>Labor Cost Ratio:</strong><br>
          Material Total: $${results.totals.materials.toFixed(2)} × 1.22 = $${results.labor.cost.toFixed(2)}<br>
          <strong>Labor Hours:</strong><br>
          $${results.labor.cost.toFixed(2)} ÷ $${results.labor.rate}/hour = ${results.labor.hours.toFixed(1)} hours
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
      halfBaths: 1,
      kitchen: true,
      laundryRoom: true,
      waterHeater: true,
      waterHeaterType: 'tank',
      includeRoughIn: true,
      includeFixtures: true,
      laborRate: 85,
      regionFactor: 1.0,
      costOverrides: {}
    };

    localStorage.removeItem('plumbing-calculator-state');
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
      ['Plumbing Calculator Results'],
      [''],
      ['Project Details'],
      ['Project Type', this.state.projectType.replace('_', ' ')],
      ['Square Footage', results.squareFootage],
      ['Bedrooms', this.state.bedrooms],
      ['Full Bathrooms', this.state.bathrooms],
      ['Half Bathrooms', this.state.halfBaths],
      ['Total Fixtures', results.fixtureCount],
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
    a.download = `plumbing-estimate-${new Date().toISOString().split('T')[0]}.csv`;
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
      type: 'plumbing',
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

    const subject = encodeURIComponent('Plumbing Calculator Estimate');
    const body = encodeURIComponent(`
      Plumbing Estimate Summary:

      Project: ${this.state.projectType.replace('_', ' ').toUpperCase()}
      Area: ${this.currentResults.squareFootage.toLocaleString()} sq ft
      Fixtures: ${this.currentResults.fixtureCount} total (${this.state.bathrooms} full bath, ${this.state.halfBaths} half bath)

      Cost Breakdown:
      - Materials: $${this.currentResults.totals.materials.toFixed(2)}
      - Labor: $${this.currentResults.totals.labor.toFixed(2)}
      - Equipment: $${this.currentResults.totals.equipment.toFixed(2)}

      Total Cost: $${this.currentResults.totals.total.toFixed(2)}
      Cost per Sq Ft: $${this.currentResults.totals.costPerSqFt.toFixed(2)}

      Generated by CostFlow AI Plumbing Calculator
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new PlumbingCalculator();
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
        id: 'plumbing',
        title: 'Plumbing Calculator',
        category: 'mep',
        description: 'Calculate costs for plumbing projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default PlumbingCalculator;