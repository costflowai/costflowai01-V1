/**
 * Flooring Calculator - Tile, LVP, Carpet
 * Calculates materials, labor, and costs for various flooring types
 */

class FlooringCalculator {
  constructor() {
    this.pricing = null;
    this.container = null;
    this.state = {
      roomLength: '',
      roomWidth: '',
      flooringType: 'lvp',
      materialGrade: 'standard',
      includeUnderlayment: true,
      includeTransition: true,
      wasteFactor: 10,
      laborRate: 4.50,
      regionFactor: 1.0,
      costOverrides: {}
    };
  }

  async init(element) {
    if (!element) {
      console.error('Flooring calculator: No DOM element provided');
      return;
    }

    this.container = element;

    try {
      await this.loadPricing();
      this.loadState();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Flooring calculator initialization error:', error);
      this.container.innerHTML = '<div class="error">Failed to load calculator</div>';
    }
  }

  async loadPricing() {
    try {
      const response = await fetch('/assets/data/pricing.base.json');
      const data = await response.json();
      this.pricing = data.flooring;
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      throw error;
    }
  }

  loadState() {
    const saved = localStorage.getItem('flooring-calculator-state');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }

  saveState() {
    localStorage.setItem('flooring-calculator-state', JSON.stringify(this.state));
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator-header">
        <h1>Flooring Calculator</h1>
        <p>Calculate materials and costs for tile, LVP, and carpet installations</p>
      </div>

      <div class="calculator-content">
        <div class="calculator-inputs">
          <div class="input-section">
            <h3>Room Dimensions</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="roomLength">Room Length (ft)</label>
                <input type="number" id="roomLength" value="${this.state.roomLength}"
                       min="1" max="1000" step="0.1" placeholder="12">
              </div>
              <div class="input-group">
                <label for="roomWidth">Room Width (ft)</label>
                <input type="number" id="roomWidth" value="${this.state.roomWidth}"
                       min="1" max="1000" step="0.1" placeholder="10">
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Flooring Type</h3>
            <div class="input-group">
              <label for="flooringType">Flooring Type</label>
              <select id="flooringType">
                <option value="lvp" ${this.state.flooringType === 'lvp' ? 'selected' : ''}>
                  Luxury Vinyl Plank (LVP)
                </option>
                <option value="tile" ${this.state.flooringType === 'tile' ? 'selected' : ''}>
                  Ceramic/Porcelain Tile
                </option>
                <option value="carpet" ${this.state.flooringType === 'carpet' ? 'selected' : ''}>
                  Carpet
                </option>
                <option value="laminate" ${this.state.flooringType === 'laminate' ? 'selected' : ''}>
                  Laminate
                </option>
                <option value="hardwood" ${this.state.flooringType === 'hardwood' ? 'selected' : ''}>
                  Hardwood
                </option>
              </select>
            </div>
          </div>

          <div class="input-section">
            <h3>Material Grade</h3>
            <div class="input-group">
              <label for="materialGrade">Material Grade</label>
              <select id="materialGrade">
                <option value="basic" ${this.state.materialGrade === 'basic' ? 'selected' : ''}>
                  Basic Grade
                </option>
                <option value="standard" ${this.state.materialGrade === 'standard' ? 'selected' : ''}>
                  Standard Grade
                </option>
                <option value="premium" ${this.state.materialGrade === 'premium' ? 'selected' : ''}>
                  Premium Grade
                </option>
              </select>
            </div>
          </div>

          <div class="input-section">
            <h3>Options</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includeUnderlayment"
                       ${this.state.includeUnderlayment ? 'checked' : ''}>
                Include Underlayment/Padding
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeTransition"
                       ${this.state.includeTransition ? 'checked' : ''}>
                Include Transition Strips
              </label>
            </div>
          </div>

          <div class="input-section">
            <h3>Labor & Pricing</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="wasteFactor">Waste Factor (%)</label>
                <input type="number" id="wasteFactor" value="${this.state.wasteFactor}"
                       min="5" max="25" step="1">
              </div>
              <div class="input-group">
                <label for="laborRate">Labor Rate ($/sq ft)</label>
                <input type="number" id="laborRate" value="${this.state.laborRate}"
                       min="1" max="20" step="0.25">
              </div>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="regionFactor">Regional Factor</label>
                <input type="number" id="regionFactor" value="${this.state.regionFactor}"
                       min="0.5" max="2.0" step="0.1">
              </div>
            </div>
          </div>

          <div class="button-row">
            <button id="calculateBtn" class="btn btn-primary">Calculate Flooring</button>
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
    const inputs = ['roomLength', 'roomWidth', 'flooringType', 'materialGrade',
                   'includeUnderlayment', 'includeTransition', 'wasteFactor',
                   'laborRate', 'regionFactor'];

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
    this.state.roomLength = parseFloat(document.getElementById('roomLength')?.value || 0);
    this.state.roomWidth = parseFloat(document.getElementById('roomWidth')?.value || 0);
    this.state.flooringType = document.getElementById('flooringType')?.value || 'lvp';
    this.state.materialGrade = document.getElementById('materialGrade')?.value || 'standard';
    this.state.includeUnderlayment = document.getElementById('includeUnderlayment')?.checked || false;
    this.state.includeTransition = document.getElementById('includeTransition')?.checked || false;
    this.state.wasteFactor = parseFloat(document.getElementById('wasteFactor')?.value || 10);
    this.state.laborRate = parseFloat(document.getElementById('laborRate')?.value || 4.50);
    this.state.regionFactor = parseFloat(document.getElementById('regionFactor')?.value || 1.0);

    this.saveState();
  }

  validate() {
    const errors = [];

    if (!this.state.roomLength || this.state.roomLength <= 0) {
      errors.push('Room length must be greater than 0');
    }
    if (!this.state.roomWidth || this.state.roomWidth <= 0) {
      errors.push('Room width must be greater than 0');
    }
    if (this.state.roomLength > 1000 || this.state.roomWidth > 1000) {
      errors.push('Room dimensions seem unreasonably large');
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
    const area = this.state.roomLength * this.state.roomWidth;
    const areaWithWaste = area * (1 + this.state.wasteFactor / 100);

    // Get material pricing
    const materialPricing = this.pricing.materials[this.state.flooringType]?.[this.state.materialGrade] || {
      price_per_sqft: 2.50,
      description: "Standard pricing"
    };

    // Material calculations
    const materialCost = areaWithWaste * materialPricing.price_per_sqft * this.state.regionFactor;

    // Underlayment/padding costs
    let underlaymentCost = 0;
    if (this.state.includeUnderlayment) {
      const underlaymentPrice = this.pricing.materials.underlayment?.standard?.price_per_sqft || 0.75;
      underlaymentCost = areaWithWaste * underlaymentPrice * this.state.regionFactor;
    }

    // Transition strip costs
    let transitionCost = 0;
    if (this.state.includeTransition) {
      const perimeter = 2 * (this.state.roomLength + this.state.roomWidth);
      const transitionPrice = this.pricing.materials.transition?.standard?.price_per_lf || 8.50;
      transitionCost = perimeter * transitionPrice * this.state.regionFactor;
    }

    // Adhesive/supplies for tile
    let suppliesCost = 0;
    if (this.state.flooringType === 'tile') {
      const adhesivePrice = this.pricing.materials.adhesive?.standard?.price_per_sqft || 0.50;
      const groutPrice = this.pricing.materials.grout?.standard?.price_per_sqft || 0.25;
      suppliesCost = areaWithWaste * (adhesivePrice + groutPrice) * this.state.regionFactor;
    }

    // Labor calculations
    const laborProductivity = this.getLaborProductivity();
    const laborHours = area / laborProductivity;
    const laborCost = area * this.state.laborRate * this.state.regionFactor;

    // Equipment costs (minimal for flooring)
    const equipmentCost = area * 0.25; // Basic tools/equipment

    // Totals
    const materialTotal = materialCost + underlaymentCost + transitionCost + suppliesCost;
    const totalCost = materialTotal + laborCost + equipmentCost;

    return {
      area,
      areaWithWaste,
      materials: {
        flooring: {
          quantity: areaWithWaste,
          unit: 'sq ft',
          unitPrice: materialPricing.price_per_sqft * this.state.regionFactor,
          cost: materialCost,
          description: materialPricing.description
        },
        underlayment: this.state.includeUnderlayment ? {
          quantity: areaWithWaste,
          unit: 'sq ft',
          unitPrice: (this.pricing.materials.underlayment?.standard?.price_per_sqft || 0.75) * this.state.regionFactor,
          cost: underlaymentCost,
          description: "Underlayment/padding"
        } : null,
        transition: this.state.includeTransition ? {
          quantity: 2 * (this.state.roomLength + this.state.roomWidth),
          unit: 'ln ft',
          unitPrice: (this.pricing.materials.transition?.standard?.price_per_lf || 8.50) * this.state.regionFactor,
          cost: transitionCost,
          description: "Transition strips"
        } : null,
        supplies: this.state.flooringType === 'tile' ? {
          quantity: areaWithWaste,
          unit: 'sq ft',
          unitPrice: 0.75 * this.state.regionFactor,
          cost: suppliesCost,
          description: "Adhesive and grout"
        } : null
      },
      labor: {
        hours: laborHours,
        productivity: laborProductivity,
        rate: this.state.laborRate * this.state.regionFactor,
        cost: laborCost
      },
      equipment: {
        cost: equipmentCost,
        description: "Basic tools and equipment"
      },
      totals: {
        materials: materialTotal,
        labor: laborCost,
        equipment: equipmentCost,
        total: totalCost,
        costPerSqFt: totalCost / area
      }
    };
  }

  getLaborProductivity() {
    // Square feet per hour based on flooring type
    const productivityRates = {
      'lvp': 80,      // 80 sq ft/hour
      'laminate': 75,  // 75 sq ft/hour
      'tile': 25,     // 25 sq ft/hour (includes setting and grouting)
      'carpet': 100,   // 100 sq ft/hour
      'hardwood': 35   // 35 sq ft/hour
    };

    return productivityRates[this.state.flooringType] || 60;
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = `
      <h3>Flooring Estimate Results</h3>

      <div class="results-summary">
        <div class="result-card">
          <h4>Project Summary</h4>
          <div class="result-row">
            <span>Room Area:</span>
            <span>${results.area.toFixed(1)} sq ft</span>
          </div>
          <div class="result-row">
            <span>Area with Waste (${this.state.wasteFactor}%):</span>
            <span>${results.areaWithWaste.toFixed(1)} sq ft</span>
          </div>
          <div class="result-row">
            <span>Flooring Type:</span>
            <span>${this.state.flooringType.toUpperCase()} - ${this.state.materialGrade}</span>
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

      <div class="materials-breakdown">
        <h4>Materials Detail</h4>
        <table class="results-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(results.materials).filter(([key, item]) => item).map(([key, item]) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity.toFixed(1)}</td>
                <td>${item.unit}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td>$${item.cost.toFixed(2)}</td>
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
          <span>Productivity Rate:</span>
          <span>${results.labor.productivity} sq ft/hour</span>
        </div>
        <div class="result-row">
          <span>Labor Rate:</span>
          <span>$${results.labor.rate.toFixed(2)}/sq ft</span>
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
        <h4>Area Calculations</h4>
        <div class="math-step">
          <strong>Room Area:</strong><br>
          ${this.state.roomLength} ft × ${this.state.roomWidth} ft = ${results.area.toFixed(1)} sq ft
        </div>
        <div class="math-step">
          <strong>Area with Waste:</strong><br>
          ${results.area.toFixed(1)} sq ft × (1 + ${this.state.wasteFactor}%) = ${results.areaWithWaste.toFixed(1)} sq ft
        </div>
      </div>

      <div class="math-section">
        <h4>Material Calculations</h4>
        ${Object.entries(results.materials).filter(([key, item]) => item).map(([key, item]) => `
          <div class="math-step">
            <strong>${item.description}:</strong><br>
            ${item.quantity.toFixed(1)} ${item.unit} × $${item.unitPrice.toFixed(2)} = $${item.cost.toFixed(2)}
          </div>
        `).join('')}
      </div>

      <div class="math-section">
        <h4>Labor Calculations</h4>
        <div class="math-step">
          <strong>Labor Hours:</strong><br>
          ${results.area.toFixed(1)} sq ft ÷ ${results.labor.productivity} sq ft/hour = ${results.labor.hours.toFixed(1)} hours
        </div>
        <div class="math-step">
          <strong>Labor Cost:</strong><br>
          ${results.area.toFixed(1)} sq ft × $${results.labor.rate.toFixed(2)}/sq ft = $${results.labor.cost.toFixed(2)}
        </div>
      </div>

      <div class="math-section">
        <h4>Regional Adjustments</h4>
        <div class="math-step">
          All material and labor costs multiplied by regional factor: ${this.state.regionFactor}
        </div>
      </div>

      <div class="math-section">
        <h4>Final Totals</h4>
        <div class="math-step">
          <strong>Materials Total:</strong> $${results.totals.materials.toFixed(2)}<br>
          <strong>Labor Total:</strong> $${results.totals.labor.toFixed(2)}<br>
          <strong>Equipment Total:</strong> $${results.totals.equipment.toFixed(2)}<br>
          <strong>Grand Total:</strong> $${results.totals.total.toFixed(2)}
        </div>
      </div>
    `;
  }

  clear() {
    this.state = {
      roomLength: '',
      roomWidth: '',
      flooringType: 'lvp',
      materialGrade: 'standard',
      includeUnderlayment: true,
      includeTransition: true,
      wasteFactor: 10,
      laborRate: 4.50,
      regionFactor: 1.0,
      costOverrides: {}
    };

    localStorage.removeItem('flooring-calculator-state');
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
      ['Flooring Calculator Results'],
      [''],
      ['Project Details'],
      ['Room Length (ft)', this.state.roomLength],
      ['Room Width (ft)', this.state.roomWidth],
      ['Room Area (sq ft)', results.area.toFixed(1)],
      ['Flooring Type', this.state.flooringType.toUpperCase()],
      ['Material Grade', this.state.materialGrade],
      ['Waste Factor (%)', this.state.wasteFactor],
      [''],
      ['Materials Breakdown'],
      ['Item', 'Quantity', 'Unit', 'Unit Price', 'Total Cost'],
      ...Object.entries(results.materials).filter(([key, item]) => item).map(([key, item]) => [
        item.description,
        item.quantity.toFixed(1),
        item.unit,
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.cost.toFixed(2)}`
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
    a.download = `flooring-estimate-${new Date().toISOString().split('T')[0]}.csv`;
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
      type: 'flooring',
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

    const subject = encodeURIComponent('Flooring Calculator Estimate');
    const body = encodeURIComponent(`
      Flooring Estimate Summary:

      Room: ${this.state.roomLength}' × ${this.state.roomWidth}' (${this.currentResults.area.toFixed(1)} sq ft)
      Flooring Type: ${this.state.flooringType.toUpperCase()} - ${this.state.materialGrade}

      Cost Breakdown:
      - Materials: $${this.currentResults.totals.materials.toFixed(2)}
      - Labor: $${this.currentResults.totals.labor.toFixed(2)}
      - Equipment: $${this.currentResults.totals.equipment.toFixed(2)}

      Total Cost: $${this.currentResults.totals.total.toFixed(2)}
      Cost per Sq Ft: $${this.currentResults.totals.costPerSqFt.toFixed(2)}

      Generated by CostFlow AI Flooring Calculator
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new FlooringCalculator();
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
        id: 'flooring',
        title: 'Flooring Calculator',
        category: 'finishing',
        description: 'Calculate costs for flooring installation projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default FlooringCalculator;