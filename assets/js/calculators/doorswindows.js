/**
 * Doors & Windows Calculator
 * Calculates costs for doors and windows installation
 */

class DoorsWindowsCalculator {
  constructor() {
    this.pricing = null;
    this.container = null;
    this.state = {
      projectType: 'residential',
      doors: {
        exterior: { count: 0, type: 'standard' },
        interior: { count: 0, type: 'standard' },
        sliding: { count: 0, type: 'standard' }
      },
      windows: {
        standard: { count: 0, type: 'single_hung' },
        large: { count: 0, type: 'picture' },
        bay: { count: 0 }
      },
      includeInstallation: true,
      includeHardware: true,
      includeTrim: true,
      laborRate: 75,
      regionFactor: 1.0,
      costOverrides: {}
    };
  }

  async init(element) {
    if (!element) {
      console.error('Doors & Windows calculator: No DOM element provided');
      return;
    }

    this.container = element;

    try {
      await this.loadPricing();
      this.loadState();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Doors & Windows calculator initialization error:', error);
      this.container.innerHTML = '<div class="error">Failed to load calculator</div>';
    }
  }

  async loadPricing() {
    try {
      const response = await fetch('/assets/data/pricing.base.json');
      const data = await response.json();
      this.pricing = data.doors_windows;
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      throw error;
    }
  }

  loadState() {
    const saved = localStorage.getItem('doorswindows-calculator-state');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }

  saveState() {
    localStorage.setItem('doorswindows-calculator-state', JSON.stringify(this.state));
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator-header">
        <h1>Doors & Windows Calculator</h1>
        <p>Calculate costs for doors and windows installation</p>
      </div>

      <div class="calculator-content">
        <div class="calculator-inputs">
          <div class="input-section">
            <h3>Project Type</h3>
            <div class="input-group">
              <label for="projectType">Project Type</label>
              <select id="projectType">
                <option value="residential" ${this.state.projectType === 'residential' ? 'selected' : ''}>
                  Residential
                </option>
                <option value="commercial" ${this.state.projectType === 'commercial' ? 'selected' : ''}>
                  Commercial
                </option>
                <option value="renovation" ${this.state.projectType === 'renovation' ? 'selected' : ''}>
                  Renovation/Replacement
                </option>
              </select>
            </div>
          </div>

          <div class="input-section">
            <h3>Doors</h3>
            <div class="door-types">
              <div class="door-type">
                <h4>Exterior Doors</h4>
                <div class="input-row">
                  <div class="input-group">
                    <label for="exteriorDoorCount">Count</label>
                    <input type="number" id="exteriorDoorCount" value="${this.state.doors.exterior.count}"
                           min="0" max="20" step="1">
                  </div>
                  <div class="input-group">
                    <label for="exteriorDoorType">Type</label>
                    <select id="exteriorDoorType">
                      <option value="standard" ${this.state.doors.exterior.type === 'standard' ? 'selected' : ''}>Standard Entry</option>
                      <option value="premium" ${this.state.doors.exterior.type === 'premium' ? 'selected' : ''}>Premium Entry</option>
                      <option value="steel" ${this.state.doors.exterior.type === 'steel' ? 'selected' : ''}>Steel Security</option>
                      <option value="french" ${this.state.doors.exterior.type === 'french' ? 'selected' : ''}>French Doors</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="door-type">
                <h4>Interior Doors</h4>
                <div class="input-row">
                  <div class="input-group">
                    <label for="interiorDoorCount">Count</label>
                    <input type="number" id="interiorDoorCount" value="${this.state.doors.interior.count}"
                           min="0" max="50" step="1">
                  </div>
                  <div class="input-group">
                    <label for="interiorDoorType">Type</label>
                    <select id="interiorDoorType">
                      <option value="standard" ${this.state.doors.interior.type === 'standard' ? 'selected' : ''}>Standard Hollow</option>
                      <option value="solid" ${this.state.doors.interior.type === 'solid' ? 'selected' : ''}>Solid Core</option>
                      <option value="panel" ${this.state.doors.interior.type === 'panel' ? 'selected' : ''}>Panel Door</option>
                      <option value="barn" ${this.state.doors.interior.type === 'barn' ? 'selected' : ''}>Barn Door</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="door-type">
                <h4>Sliding Doors</h4>
                <div class="input-row">
                  <div class="input-group">
                    <label for="slidingDoorCount">Count</label>
                    <input type="number" id="slidingDoorCount" value="${this.state.doors.sliding.count}"
                           min="0" max="10" step="1">
                  </div>
                  <div class="input-group">
                    <label for="slidingDoorType">Type</label>
                    <select id="slidingDoorType">
                      <option value="standard" ${this.state.doors.sliding.type === 'standard' ? 'selected' : ''}>Standard Patio</option>
                      <option value="premium" ${this.state.doors.sliding.type === 'premium' ? 'selected' : ''}>Premium Patio</option>
                      <option value="pocket" ${this.state.doors.sliding.type === 'pocket' ? 'selected' : ''}>Pocket Door</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Windows</h3>
            <div class="window-types">
              <div class="window-type">
                <h4>Standard Windows</h4>
                <div class="input-row">
                  <div class="input-group">
                    <label for="standardWindowCount">Count</label>
                    <input type="number" id="standardWindowCount" value="${this.state.windows.standard.count}"
                           min="0" max="50" step="1">
                  </div>
                  <div class="input-group">
                    <label for="standardWindowType">Type</label>
                    <select id="standardWindowType">
                      <option value="single_hung" ${this.state.windows.standard.type === 'single_hung' ? 'selected' : ''}>Single Hung</option>
                      <option value="double_hung" ${this.state.windows.standard.type === 'double_hung' ? 'selected' : ''}>Double Hung</option>
                      <option value="casement" ${this.state.windows.standard.type === 'casement' ? 'selected' : ''}>Casement</option>
                      <option value="awning" ${this.state.windows.standard.type === 'awning' ? 'selected' : ''}>Awning</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="window-type">
                <h4>Large Windows</h4>
                <div class="input-row">
                  <div class="input-group">
                    <label for="largeWindowCount">Count</label>
                    <input type="number" id="largeWindowCount" value="${this.state.windows.large.count}"
                           min="0" max="20" step="1">
                  </div>
                  <div class="input-group">
                    <label for="largeWindowType">Type</label>
                    <select id="largeWindowType">
                      <option value="picture" ${this.state.windows.large.type === 'picture' ? 'selected' : ''}>Picture Window</option>
                      <option value="slider" ${this.state.windows.large.type === 'slider' ? 'selected' : ''}>Large Slider</option>
                      <option value="fixed" ${this.state.windows.large.type === 'fixed' ? 'selected' : ''}>Fixed Glass</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="window-type">
                <h4>Bay Windows</h4>
                <div class="input-row">
                  <div class="input-group">
                    <label for="bayWindowCount">Count</label>
                    <input type="number" id="bayWindowCount" value="${this.state.windows.bay.count}"
                           min="0" max="5" step="1">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Installation Options</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includeInstallation"
                       ${this.state.includeInstallation ? 'checked' : ''}>
                Include Installation Labor
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeHardware"
                       ${this.state.includeHardware ? 'checked' : ''}>
                Include Hardware & Accessories
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeTrim"
                       ${this.state.includeTrim ? 'checked' : ''}>
                Include Trim & Casing
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
            <button id="calculateBtn" class="btn btn-primary">Calculate Doors & Windows</button>
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
    const inputs = ['projectType', 'exteriorDoorCount', 'exteriorDoorType',
                   'interiorDoorCount', 'interiorDoorType', 'slidingDoorCount', 'slidingDoorType',
                   'standardWindowCount', 'standardWindowType', 'largeWindowCount', 'largeWindowType',
                   'bayWindowCount', 'includeInstallation', 'includeHardware', 'includeTrim',
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
    this.state.projectType = document.getElementById('projectType')?.value || 'residential';

    // Door counts and types
    this.state.doors.exterior.count = parseInt(document.getElementById('exteriorDoorCount')?.value || 0);
    this.state.doors.exterior.type = document.getElementById('exteriorDoorType')?.value || 'standard';
    this.state.doors.interior.count = parseInt(document.getElementById('interiorDoorCount')?.value || 0);
    this.state.doors.interior.type = document.getElementById('interiorDoorType')?.value || 'standard';
    this.state.doors.sliding.count = parseInt(document.getElementById('slidingDoorCount')?.value || 0);
    this.state.doors.sliding.type = document.getElementById('slidingDoorType')?.value || 'standard';

    // Window counts and types
    this.state.windows.standard.count = parseInt(document.getElementById('standardWindowCount')?.value || 0);
    this.state.windows.standard.type = document.getElementById('standardWindowType')?.value || 'single_hung';
    this.state.windows.large.count = parseInt(document.getElementById('largeWindowCount')?.value || 0);
    this.state.windows.large.type = document.getElementById('largeWindowType')?.value || 'picture';
    this.state.windows.bay.count = parseInt(document.getElementById('bayWindowCount')?.value || 0);

    // Options
    this.state.includeInstallation = document.getElementById('includeInstallation')?.checked || false;
    this.state.includeHardware = document.getElementById('includeHardware')?.checked || false;
    this.state.includeTrim = document.getElementById('includeTrim')?.checked || false;
    this.state.laborRate = parseFloat(document.getElementById('laborRate')?.value || 75);
    this.state.regionFactor = parseFloat(document.getElementById('regionFactor')?.value || 1.0);

    this.saveState();
  }

  validate() {
    const errors = [];

    const totalItems = this.state.doors.exterior.count + this.state.doors.interior.count +
                      this.state.doors.sliding.count + this.state.windows.standard.count +
                      this.state.windows.large.count + this.state.windows.bay.count;

    if (totalItems === 0) {
      errors.push('Please specify at least one door or window');
    }
    if (totalItems > 100) {
      errors.push('Total number of doors and windows seems unreasonably large');
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
    const projectFactors = {
      'residential': 1.0,
      'commercial': 1.3,
      'renovation': 1.4
    };
    const projectFactor = projectFactors[this.state.projectType] || 1.0;

    // Calculate door costs
    const doorCosts = {
      exterior: this.calculateDoorCost('exterior', this.state.doors.exterior, projectFactor),
      interior: this.calculateDoorCost('interior', this.state.doors.interior, projectFactor),
      sliding: this.calculateDoorCost('sliding', this.state.doors.sliding, projectFactor)
    };

    // Calculate window costs
    const windowCosts = {
      standard: this.calculateWindowCost('standard', this.state.windows.standard, projectFactor),
      large: this.calculateWindowCost('large', this.state.windows.large, projectFactor),
      bay: this.calculateWindowCost('bay', { count: this.state.windows.bay.count, type: 'bay' }, projectFactor)
    };

    // Calculate additional costs
    const totalUnits = Object.values(doorCosts).reduce((sum, door) => sum + door.count, 0) +
                      Object.values(windowCosts).reduce((sum, window) => sum + window.count, 0);

    let hardwareCost = 0;
    if (this.state.includeHardware) {
      const hardwareRate = this.pricing?.hardware?.average || 45;
      hardwareCost = totalUnits * hardwareRate * this.state.regionFactor;
    }

    let trimCost = 0;
    if (this.state.includeTrim) {
      const trimRate = this.pricing?.trim?.standard || 35;
      trimCost = totalUnits * trimRate * this.state.regionFactor;
    }

    // Labor calculations
    let laborCost = 0;
    let laborHours = 0;
    if (this.state.includeInstallation) {
      // Installation time varies by type (hours per unit)
      const installationTimes = {
        door_exterior: 4, door_interior: 2, door_sliding: 6,
        window_standard: 3, window_large: 5, window_bay: 8
      };

      laborHours =
        doorCosts.exterior.count * installationTimes.door_exterior +
        doorCosts.interior.count * installationTimes.door_interior +
        doorCosts.sliding.count * installationTimes.door_sliding +
        windowCosts.standard.count * installationTimes.window_standard +
        windowCosts.large.count * installationTimes.window_large +
        windowCosts.bay.count * installationTimes.window_bay;

      laborCost = laborHours * this.state.laborRate * this.state.regionFactor;
    }

    // Equipment costs (tools, scaffolding)
    const equipmentCost = laborHours * 15; // $15/hour for tools and equipment

    // Totals
    const doorTotal = Object.values(doorCosts).reduce((sum, door) => sum + door.cost, 0);
    const windowTotal = Object.values(windowCosts).reduce((sum, window) => sum + window.cost, 0);
    const materialTotal = doorTotal + windowTotal + hardwareCost + trimCost;
    const totalCost = materialTotal + laborCost + equipmentCost;

    return {
      doors: doorCosts,
      windows: windowCosts,
      totalUnits,
      additionalCosts: {
        hardware: this.state.includeHardware ? {
          units: totalUnits,
          rate: (this.pricing?.hardware?.average || 45) * this.state.regionFactor,
          cost: hardwareCost,
          included: true
        } : { included: false },
        trim: this.state.includeTrim ? {
          units: totalUnits,
          rate: (this.pricing?.trim?.standard || 35) * this.state.regionFactor,
          cost: trimCost,
          included: true
        } : { included: false }
      },
      labor: this.state.includeInstallation ? {
        hours: laborHours,
        rate: this.state.laborRate * this.state.regionFactor,
        cost: laborCost,
        included: true
      } : { included: false },
      equipment: {
        hours: laborHours,
        rate: 15,
        cost: equipmentCost,
        description: "Tools and equipment rental"
      },
      totals: {
        doors: doorTotal,
        windows: windowTotal,
        materials: materialTotal,
        labor: laborCost,
        equipment: equipmentCost,
        total: totalCost,
        averagePerUnit: totalUnits > 0 ? totalCost / totalUnits : 0
      },
      projectFactor
    };
  }

  calculateDoorCost(category, doorSpec, projectFactor) {
    if (doorSpec.count === 0) {
      return { count: 0, cost: 0, unitPrice: 0, description: '' };
    }

    const basePrices = this.pricing?.doors?.[category]?.[doorSpec.type] || { price: 300, description: 'Standard door' };
    const unitPrice = basePrices.price * projectFactor * this.state.regionFactor;
    const cost = doorSpec.count * unitPrice;

    return {
      count: doorSpec.count,
      cost,
      unitPrice,
      description: `${category} ${doorSpec.type} door${doorSpec.count > 1 ? 's' : ''}`
    };
  }

  calculateWindowCost(category, windowSpec, projectFactor) {
    if (windowSpec.count === 0) {
      return { count: 0, cost: 0, unitPrice: 0, description: '' };
    }

    const basePrices = this.pricing?.windows?.[category]?.[windowSpec.type] ||
                      this.pricing?.windows?.[category] ||
                      { price: 400, description: 'Standard window' };
    const unitPrice = basePrices.price * projectFactor * this.state.regionFactor;
    const cost = windowSpec.count * unitPrice;

    return {
      count: windowSpec.count,
      cost,
      unitPrice,
      description: `${category} ${windowSpec.type || ''} window${windowSpec.count > 1 ? 's' : ''}`
    };
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = `
      <h3>Doors & Windows Estimate Results</h3>

      <div class="results-summary">
        <div class="result-card">
          <h4>Project Summary</h4>
          <div class="result-row">
            <span>Project Type:</span>
            <span>${this.state.projectType.toUpperCase()}</span>
          </div>
          <div class="result-row">
            <span>Total Units:</span>
            <span>${results.totalUnits} doors & windows</span>
          </div>
          <div class="result-row">
            <span>Project Factor:</span>
            <span>${results.projectFactor}x</span>
          </div>
        </div>

        <div class="result-card">
          <h4>Cost Breakdown</h4>
          <div class="result-row">
            <span>Doors:</span>
            <span>$${results.totals.doors.toLocaleString()}</span>
          </div>
          <div class="result-row">
            <span>Windows:</span>
            <span>$${results.totals.windows.toLocaleString()}</span>
          </div>
          ${results.additionalCosts.hardware.included ? `
          <div class="result-row">
            <span>Hardware:</span>
            <span>$${results.additionalCosts.hardware.cost.toLocaleString()}</span>
          </div>
          ` : ''}
          ${results.additionalCosts.trim.included ? `
          <div class="result-row">
            <span>Trim:</span>
            <span>$${results.additionalCosts.trim.cost.toLocaleString()}</span>
          </div>
          ` : ''}
          ${results.labor.included ? `
          <div class="result-row">
            <span>Labor:</span>
            <span>$${results.totals.labor.toLocaleString()}</span>
          </div>
          ` : ''}
          <div class="result-row">
            <span>Equipment:</span>
            <span>$${results.totals.equipment.toLocaleString()}</span>
          </div>
          <div class="result-row total-row">
            <span><strong>Total Cost:</strong></span>
            <span><strong>$${results.totals.total.toLocaleString()}</strong></span>
          </div>
          <div class="result-row">
            <span>Average per Unit:</span>
            <span>$${results.totals.averagePerUnit.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div class="items-breakdown">
        <h4>Items Detail</h4>
        <table class="results-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Count</th>
              <th>Unit Price</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(results.doors).filter(([key, door]) => door.count > 0).map(([key, door]) => `
              <tr>
                <td>${door.description}</td>
                <td>${door.count}</td>
                <td>$${door.unitPrice.toFixed(2)}</td>
                <td>$${door.cost.toFixed(2)}</td>
              </tr>
            `).join('')}
            ${Object.entries(results.windows).filter(([key, window]) => window.count > 0).map(([key, window]) => `
              <tr>
                <td>${window.description}</td>
                <td>${window.count}</td>
                <td>$${window.unitPrice.toFixed(2)}</td>
                <td>$${window.cost.toFixed(2)}</td>
              </tr>
            `).join('')}
            ${results.additionalCosts.hardware.included ? `
            <tr>
              <td>Hardware & Accessories</td>
              <td>${results.additionalCosts.hardware.units}</td>
              <td>$${results.additionalCosts.hardware.rate.toFixed(2)}</td>
              <td>$${results.additionalCosts.hardware.cost.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${results.additionalCosts.trim.included ? `
            <tr>
              <td>Trim & Casing</td>
              <td>${results.additionalCosts.trim.units}</td>
              <td>$${results.additionalCosts.trim.rate.toFixed(2)}</td>
              <td>$${results.additionalCosts.trim.cost.toFixed(2)}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      ${results.labor.included ? `
      <div class="labor-breakdown">
        <h4>Labor Detail</h4>
        <div class="result-row">
          <span>Installation Hours:</span>
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
      ` : ''}
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
        <h4>Project Factors</h4>
        <div class="math-step">
          <strong>Project Type Factor:</strong> ${results.projectFactor}x (${this.state.projectType})<br>
          <strong>Regional Factor:</strong> ${this.state.regionFactor}x
        </div>
      </div>

      <div class="math-section">
        <h4>Door Calculations</h4>
        ${Object.entries(results.doors).filter(([key, door]) => door.count > 0).map(([key, door]) => `
          <div class="math-step">
            <strong>${door.description}:</strong><br>
            ${door.count} units × $${(door.unitPrice / results.projectFactor / this.state.regionFactor).toFixed(2)} base × ${results.projectFactor} × ${this.state.regionFactor} = $${door.cost.toFixed(2)}
          </div>
        `).join('')}
      </div>

      <div class="math-section">
        <h4>Window Calculations</h4>
        ${Object.entries(results.windows).filter(([key, window]) => window.count > 0).map(([key, window]) => `
          <div class="math-step">
            <strong>${window.description}:</strong><br>
            ${window.count} units × $${(window.unitPrice / results.projectFactor / this.state.regionFactor).toFixed(2)} base × ${results.projectFactor} × ${this.state.regionFactor} = $${window.cost.toFixed(2)}
          </div>
        `).join('')}
      </div>

      ${results.additionalCosts.hardware.included || results.additionalCosts.trim.included ? `
      <div class="math-section">
        <h4>Additional Cost Calculations</h4>
        ${results.additionalCosts.hardware.included ? `
        <div class="math-step">
          <strong>Hardware & Accessories:</strong><br>
          ${results.additionalCosts.hardware.units} units × $${results.additionalCosts.hardware.rate.toFixed(2)}/unit = $${results.additionalCosts.hardware.cost.toFixed(2)}
        </div>
        ` : ''}
        ${results.additionalCosts.trim.included ? `
        <div class="math-step">
          <strong>Trim & Casing:</strong><br>
          ${results.additionalCosts.trim.units} units × $${results.additionalCosts.trim.rate.toFixed(2)}/unit = $${results.additionalCosts.trim.cost.toFixed(2)}
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${results.labor.included ? `
      <div class="math-section">
        <h4>Labor Calculations</h4>
        <div class="math-step">
          <strong>Installation Labor:</strong><br>
          ${results.labor.hours.toFixed(1)} hours × $${results.labor.rate.toFixed(2)}/hour = $${results.labor.cost.toFixed(2)}
        </div>
      </div>
      ` : ''}

      <div class="math-section">
        <h4>Final Totals</h4>
        <div class="math-step">
          <strong>Doors Total:</strong> $${results.totals.doors.toFixed(2)}<br>
          <strong>Windows Total:</strong> $${results.totals.windows.toFixed(2)}<br>
          <strong>Materials Total:</strong> $${results.totals.materials.toFixed(2)}<br>
          ${results.labor.included ? `<strong>Labor Total:</strong> $${results.totals.labor.toFixed(2)}<br>` : ''}
          <strong>Equipment Total:</strong> $${results.totals.equipment.toFixed(2)}<br>
          <strong>Grand Total:</strong> $${results.totals.total.toFixed(2)}<br>
          <strong>Average per Unit:</strong> $${results.totals.total.toFixed(2)} ÷ ${results.totalUnits} = $${results.totals.averagePerUnit.toFixed(2)}
        </div>
      </div>
    `;
  }

  clear() {
    this.state = {
      projectType: 'residential',
      doors: {
        exterior: { count: 0, type: 'standard' },
        interior: { count: 0, type: 'standard' },
        sliding: { count: 0, type: 'standard' }
      },
      windows: {
        standard: { count: 0, type: 'single_hung' },
        large: { count: 0, type: 'picture' },
        bay: { count: 0 }
      },
      includeInstallation: true,
      includeHardware: true,
      includeTrim: true,
      laborRate: 75,
      regionFactor: 1.0,
      costOverrides: {}
    };

    localStorage.removeItem('doorswindows-calculator-state');
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
      ['Doors & Windows Calculator Results'],
      [''],
      ['Project Details'],
      ['Project Type', this.state.projectType],
      ['Total Units', results.totalUnits],
      [''],
      ['Items Breakdown'],
      ['Item', 'Count', 'Unit Price', 'Total Cost'],
      ...Object.entries(results.doors).filter(([key, door]) => door.count > 0).map(([key, door]) => [
        door.description,
        door.count,
        `$${door.unitPrice.toFixed(2)}`,
        `$${door.cost.toFixed(2)}`
      ]),
      ...Object.entries(results.windows).filter(([key, window]) => window.count > 0).map(([key, window]) => [
        window.description,
        window.count,
        `$${window.unitPrice.toFixed(2)}`,
        `$${window.cost.toFixed(2)}`
      ]),
      ...(results.additionalCosts.hardware.included ? [['Hardware & Accessories', results.additionalCosts.hardware.units, `$${results.additionalCosts.hardware.rate.toFixed(2)}`, `$${results.additionalCosts.hardware.cost.toFixed(2)}`]] : []),
      ...(results.additionalCosts.trim.included ? [['Trim & Casing', results.additionalCosts.trim.units, `$${results.additionalCosts.trim.rate.toFixed(2)}`, `$${results.additionalCosts.trim.cost.toFixed(2)}`]] : []),
      [''],
      ['Cost Summary'],
      ['Doors Total', `$${results.totals.doors.toFixed(2)}`],
      ['Windows Total', `$${results.totals.windows.toFixed(2)}`],
      ['Materials Total', `$${results.totals.materials.toFixed(2)}`],
      ...(results.labor.included ? [['Labor Total', `$${results.totals.labor.toFixed(2)}`]] : []),
      ['Equipment Total', `$${results.totals.equipment.toFixed(2)}`],
      ['Grand Total', `$${results.totals.total.toFixed(2)}`],
      ['Average per Unit', `$${results.totals.averagePerUnit.toFixed(2)}`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doors-windows-estimate-${new Date().toISOString().split('T')[0]}.csv`;
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
      type: 'doorswindows',
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

    const subject = encodeURIComponent('Doors & Windows Calculator Estimate');
    const body = encodeURIComponent(`
      Doors & Windows Estimate Summary:

      Project: ${this.state.projectType.toUpperCase()}
      Total Units: ${this.currentResults.totalUnits} doors & windows

      Cost Breakdown:
      - Doors: $${this.currentResults.totals.doors.toFixed(2)}
      - Windows: $${this.currentResults.totals.windows.toFixed(2)}
      - Materials: $${this.currentResults.totals.materials.toFixed(2)}
      ${this.currentResults.labor.included ? `- Labor: $${this.currentResults.totals.labor.toFixed(2)}` : ''}
      - Equipment: $${this.currentResults.totals.equipment.toFixed(2)}

      Total Cost: $${this.currentResults.totals.total.toFixed(2)}
      Average per Unit: $${this.currentResults.totals.averagePerUnit.toFixed(2)}

      Generated by CostFlow AI Doors & Windows Calculator
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new DoorsWindowsCalculator();
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
        id: 'doorswindows',
        title: 'Doors & Windows Calculator',
        category: 'finishing',
        description: 'Calculate costs for doors and windows installation',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default DoorsWindowsCalculator;