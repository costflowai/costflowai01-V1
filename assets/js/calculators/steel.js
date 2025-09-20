/**
 * Steel Calculator - Structural Steel Estimating
 * Calculates steel materials and costs in lbs/tons with connections
 */

class SteelCalculator {
  constructor() {
    this.pricing = null;
    this.container = null;
    this.state = {
      projectType: 'building_frame',
      buildingLength: '',
      buildingWidth: '',
      baySpacing: 25,
      eaveHeight: 16,
      roofSlope: 0.5,
      steelGrade: 'A992',
      includeColumns: true,
      includeBeams: true,
      includeRafters: true,
      includeBracing: true,
      includeConnections: true,
      connectionType: 'bolted',
      laborRate: 85,
      regionFactor: 1.0,
      costOverrides: {}
    };
  }

  async init(element) {
    if (!element) {
      console.error('Steel calculator: No DOM element provided');
      return;
    }

    this.container = element;

    try {
      await this.loadPricing();
      this.loadState();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Steel calculator initialization error:', error);
      this.container.innerHTML = '<div class="error">Failed to load calculator</div>';
    }
  }

  async loadPricing() {
    try {
      const response = await fetch('/assets/data/pricing.base.json');
      const data = await response.json();
      this.pricing = data.steel;
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      throw error;
    }
  }

  loadState() {
    const saved = localStorage.getItem('steel-calculator-state');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }

  saveState() {
    localStorage.setItem('steel-calculator-state', JSON.stringify(this.state));
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator-header">
        <h1>Steel Calculator</h1>
        <p>Calculate structural steel materials and costs for building frames</p>
      </div>

      <div class="calculator-content">
        <div class="calculator-inputs">
          <div class="input-section">
            <h3>Project Details</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="projectType">Project Type</label>
                <select id="projectType">
                  <option value="building_frame" ${this.state.projectType === 'building_frame' ? 'selected' : ''}>
                    Building Frame
                  </option>
                  <option value="warehouse" ${this.state.projectType === 'warehouse' ? 'selected' : ''}>
                    Warehouse/Industrial
                  </option>
                  <option value="office" ${this.state.projectType === 'office' ? 'selected' : ''}>
                    Office Building
                  </option>
                  <option value="retail" ${this.state.projectType === 'retail' ? 'selected' : ''}>
                    Retail Building
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label for="steelGrade">Steel Grade</label>
                <select id="steelGrade">
                  <option value="A992" ${this.state.steelGrade === 'A992' ? 'selected' : ''}>A992 (Standard)</option>
                  <option value="A572" ${this.state.steelGrade === 'A572' ? 'selected' : ''}>A572 Gr 50</option>
                  <option value="A36" ${this.state.steelGrade === 'A36' ? 'selected' : ''}>A36</option>
                </select>
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Building Dimensions</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="buildingLength">Building Length (ft)</label>
                <input type="number" id="buildingLength" value="${this.state.buildingLength}"
                       min="20" max="1000" step="1" placeholder="100">
              </div>
              <div class="input-group">
                <label for="buildingWidth">Building Width (ft)</label>
                <input type="number" id="buildingWidth" value="${this.state.buildingWidth}"
                       min="20" max="500" step="1" placeholder="80">
              </div>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="baySpacing">Bay Spacing (ft)</label>
                <input type="number" id="baySpacing" value="${this.state.baySpacing}"
                       min="15" max="40" step="5">
              </div>
              <div class="input-group">
                <label for="eaveHeight">Eave Height (ft)</label>
                <input type="number" id="eaveHeight" value="${this.state.eaveHeight}"
                       min="10" max="40" step="2">
              </div>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="roofSlope">Roof Slope (in/ft)</label>
                <input type="number" id="roofSlope" value="${this.state.roofSlope}"
                       min="0" max="4" step="0.25">
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Steel Components</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includeColumns"
                       ${this.state.includeColumns ? 'checked' : ''}>
                Include Columns
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeBeams"
                       ${this.state.includeBeams ? 'checked' : ''}>
                Include Beams & Girders
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeRafters"
                       ${this.state.includeRafters ? 'checked' : ''}>
                Include Roof Rafters
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="includeBracing"
                       ${this.state.includeBracing ? 'checked' : ''}>
                Include Bracing System
              </label>
            </div>
          </div>

          <div class="input-section">
            <h3>Connections</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="connectionType">Connection Type</label>
                <select id="connectionType" ${!this.state.includeConnections ? 'disabled' : ''}>
                  <option value="bolted" ${this.state.connectionType === 'bolted' ? 'selected' : ''}>
                    Bolted Connections
                  </option>
                  <option value="welded" ${this.state.connectionType === 'welded' ? 'selected' : ''}>
                    Welded Connections
                  </option>
                  <option value="mixed" ${this.state.connectionType === 'mixed' ? 'selected' : ''}>
                    Mixed (Bolt/Weld)
                  </option>
                </select>
              </div>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="includeConnections"
                       ${this.state.includeConnections ? 'checked' : ''}>
                Include Connection Materials
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
            <button id="calculateBtn" class="btn btn-primary">Calculate Steel</button>
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
    const inputs = ['projectType', 'buildingLength', 'buildingWidth', 'baySpacing',
                   'eaveHeight', 'roofSlope', 'steelGrade', 'includeColumns',
                   'includeBeams', 'includeRafters', 'includeBracing', 'includeConnections',
                   'connectionType', 'laborRate', 'regionFactor'];

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

    // Special handler for connections checkbox
    document.getElementById('includeConnections')?.addEventListener('change', (e) => {
      document.getElementById('connectionType').disabled = !e.target.checked;
    });
  }

  updateState() {
    // Update state from form inputs
    this.state.projectType = document.getElementById('projectType')?.value || 'building_frame';
    this.state.buildingLength = parseFloat(document.getElementById('buildingLength')?.value || 0);
    this.state.buildingWidth = parseFloat(document.getElementById('buildingWidth')?.value || 0);
    this.state.baySpacing = parseFloat(document.getElementById('baySpacing')?.value || 25);
    this.state.eaveHeight = parseFloat(document.getElementById('eaveHeight')?.value || 16);
    this.state.roofSlope = parseFloat(document.getElementById('roofSlope')?.value || 0.5);
    this.state.steelGrade = document.getElementById('steelGrade')?.value || 'A992';
    this.state.includeColumns = document.getElementById('includeColumns')?.checked || false;
    this.state.includeBeams = document.getElementById('includeBeams')?.checked || false;
    this.state.includeRafters = document.getElementById('includeRafters')?.checked || false;
    this.state.includeBracing = document.getElementById('includeBracing')?.checked || false;
    this.state.includeConnections = document.getElementById('includeConnections')?.checked || false;
    this.state.connectionType = document.getElementById('connectionType')?.value || 'bolted';
    this.state.laborRate = parseFloat(document.getElementById('laborRate')?.value || 85);
    this.state.regionFactor = parseFloat(document.getElementById('regionFactor')?.value || 1.0);

    this.saveState();
  }

  validate() {
    const errors = [];

    if (!this.state.buildingLength || this.state.buildingLength <= 0) {
      errors.push('Building length must be greater than 0');
    }
    if (!this.state.buildingWidth || this.state.buildingWidth <= 0) {
      errors.push('Building width must be greater than 0');
    }
    if (this.state.buildingLength > 1000 || this.state.buildingWidth > 500) {
      errors.push('Building dimensions seem unreasonably large');
    }
    if (this.state.baySpacing > this.state.buildingLength) {
      errors.push('Bay spacing cannot be larger than building length');
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
    const area = this.state.buildingLength * this.state.buildingWidth;

    // Calculate number of bays and frames
    const numBaysLength = Math.ceil(this.state.buildingLength / this.state.baySpacing);
    const numFrames = numBaysLength + 1;

    // Steel weight factors (lbs per sq ft) based on project type
    const weightFactors = {
      'building_frame': { base: 4.5, columns: 1.2, beams: 1.8, rafters: 1.0, bracing: 0.5 },
      'warehouse': { base: 3.8, columns: 1.0, beams: 1.5, rafters: 0.8, bracing: 0.5 },
      'office': { base: 5.2, columns: 1.5, beams: 2.0, rafters: 1.2, bracing: 0.5 },
      'retail': { base: 4.0, columns: 1.1, beams: 1.6, rafters: 0.9, bracing: 0.4 }
    };

    const factors = weightFactors[this.state.projectType] || weightFactors.building_frame;

    // Calculate steel weights by component
    const weights = {
      columns: this.state.includeColumns ? area * factors.columns : 0,
      beams: this.state.includeBeams ? area * factors.beams : 0,
      rafters: this.state.includeRafters ? area * factors.rafters : 0,
      bracing: this.state.includeBracing ? area * factors.bracing : 0
    };

    // Apply height factor for columns (taller = heavier)
    if (this.state.includeColumns && this.state.eaveHeight > 16) {
      const heightFactor = 1 + ((this.state.eaveHeight - 16) * 0.05);
      weights.columns *= heightFactor;
    }

    // Total steel weight
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const totalTons = totalWeight / 2000;

    // Steel pricing per pound (includes grade factor)
    const gradeFactors = { 'A992': 1.0, 'A572': 1.1, 'A36': 0.9 };
    const gradeFactor = gradeFactors[this.state.steelGrade] || 1.0;
    const steelPricePerLb = (this.pricing?.materials?.steel_price || 1.25) * gradeFactor * this.state.regionFactor;

    // Material costs
    const steelCost = totalWeight * steelPricePerLb;

    // Connection costs
    let connectionCost = 0;
    if (this.state.includeConnections) {
      const connectionFactors = { 'bolted': 0.15, 'welded': 0.20, 'mixed': 0.18 };
      const connectionFactor = connectionFactors[this.state.connectionType] || 0.15;
      connectionCost = steelCost * connectionFactor;
    }

    // Labor calculations (steel erection)
    const laborProductivity = 0.8; // tons per hour (typical steel erection rate)
    const laborHours = totalTons / laborProductivity;
    const laborCost = laborHours * this.state.laborRate * this.state.regionFactor;

    // Equipment costs (crane, welding, etc.)
    const equipmentCost = totalTons * 150; // $150 per ton for equipment

    // Totals
    const materialTotal = steelCost + connectionCost;
    const totalCost = materialTotal + laborCost + equipmentCost;

    return {
      buildingArea: area,
      numFrames,
      numBays: numBaysLength,
      weights: {
        columns: this.state.includeColumns ? {
          weight: weights.columns,
          description: `Columns (${numFrames} frames)`,
          included: true
        } : { included: false },
        beams: this.state.includeBeams ? {
          weight: weights.beams,
          description: `Beams & Girders`,
          included: true
        } : { included: false },
        rafters: this.state.includeRafters ? {
          weight: weights.rafters,
          description: `Roof Rafters`,
          included: true
        } : { included: false },
        bracing: this.state.includeBracing ? {
          weight: weights.bracing,
          description: `Bracing System`,
          included: true
        } : { included: false }
      },
      steel: {
        totalWeight,
        totalTons,
        pricePerLb: steelPricePerLb,
        cost: steelCost,
        grade: this.state.steelGrade,
        gradeFactor
      },
      connections: this.state.includeConnections ? {
        type: this.state.connectionType,
        cost: connectionCost,
        factor: connectionCost / steelCost,
        included: true
      } : { included: false },
      labor: {
        hours: laborHours,
        productivity: laborProductivity,
        rate: this.state.laborRate * this.state.regionFactor,
        cost: laborCost
      },
      equipment: {
        cost: equipmentCost,
        ratePerTon: 150,
        description: "Crane, welding, and erection equipment"
      },
      totals: {
        materials: materialTotal,
        labor: laborCost,
        equipment: equipmentCost,
        total: totalCost,
        costPerSqFt: totalCost / area,
        costPerTon: totalCost / totalTons
      }
    };
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = `
      <h3>Steel Estimate Results</h3>

      <div class="results-summary">
        <div class="result-card">
          <h4>Project Summary</h4>
          <div class="result-row">
            <span>Building Area:</span>
            <span>${results.buildingArea.toLocaleString()} sq ft</span>
          </div>
          <div class="result-row">
            <span>Steel Weight:</span>
            <span>${results.steel.totalWeight.toLocaleString()} lbs (${results.steel.totalTons.toFixed(1)} tons)</span>
          </div>
          <div class="result-row">
            <span>Steel Grade:</span>
            <span>${results.steel.grade}</span>
          </div>
          <div class="result-row">
            <span>Frames/Bays:</span>
            <span>${results.numFrames} frames / ${results.numBays} bays</span>
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
          <div class="result-row">
            <span>Cost per Ton:</span>
            <span>$${results.totals.costPerTon.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="steel-breakdown">
        <h4>Steel Components Detail</h4>
        <table class="results-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Description</th>
              <th>Weight (lbs)</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(results.weights).filter(([key, comp]) => comp.included).map(([key, comp]) => `
              <tr>
                <td>${key.toUpperCase()}</td>
                <td>${comp.description}</td>
                <td>${comp.weight.toLocaleString()}</td>
                <td>${((comp.weight / results.steel.totalWeight) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td><strong>All Steel Components</strong></td>
              <td><strong>${results.steel.totalWeight.toLocaleString()}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="material-breakdown">
        <h4>Material Cost Detail</h4>
        <div class="result-row">
          <span>Steel Cost:</span>
          <span>${results.steel.totalWeight.toLocaleString()} lbs × $${results.steel.pricePerLb.toFixed(2)}/lb = $${results.steel.cost.toLocaleString()}</span>
        </div>
        ${results.connections.included ? `
          <div class="result-row">
            <span>Connection Cost:</span>
            <span>${results.connections.type.toUpperCase()} (${(results.connections.factor * 100).toFixed(0)}% of steel) = $${results.connections.cost.toLocaleString()}</span>
          </div>
        ` : ''}
      </div>

      <div class="labor-breakdown">
        <h4>Labor Detail</h4>
        <div class="result-row">
          <span>Labor Hours:</span>
          <span>${results.labor.hours.toFixed(1)} hours</span>
        </div>
        <div class="result-row">
          <span>Productivity Rate:</span>
          <span>${results.labor.productivity} tons/hour</span>
        </div>
        <div class="result-row">
          <span>Labor Rate:</span>
          <span>$${results.labor.rate.toFixed(2)}/hour</span>
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
        <h4>Building Geometry</h4>
        <div class="math-step">
          <strong>Building Area:</strong><br>
          ${this.state.buildingLength} ft × ${this.state.buildingWidth} ft = ${results.buildingArea.toLocaleString()} sq ft
        </div>
        <div class="math-step">
          <strong>Framing Layout:</strong><br>
          Bays: ${this.state.buildingLength} ft ÷ ${this.state.baySpacing} ft = ${results.numBays} bays<br>
          Frames: ${results.numBays} bays + 1 = ${results.numFrames} frames
        </div>
      </div>

      <div class="math-section">
        <h4>Steel Weight Calculations</h4>
        ${Object.entries(results.weights).filter(([key, comp]) => comp.included).map(([key, comp]) => `
          <div class="math-step">
            <strong>${comp.description}:</strong><br>
            ${results.buildingArea.toLocaleString()} sq ft × weight factor = ${comp.weight.toLocaleString()} lbs
          </div>
        `).join('')}
        <div class="math-step">
          <strong>Total Steel Weight:</strong><br>
          ${results.steel.totalWeight.toLocaleString()} lbs ÷ 2,000 = ${results.steel.totalTons.toFixed(1)} tons
        </div>
      </div>

      <div class="math-section">
        <h4>Material Cost Calculations</h4>
        <div class="math-step">
          <strong>Steel Cost:</strong><br>
          ${results.steel.totalWeight.toLocaleString()} lbs × $${results.steel.pricePerLb.toFixed(2)}/lb = $${results.steel.cost.toLocaleString()}<br>
          <em>Price includes ${results.steel.grade} grade factor: ${results.steel.gradeFactor}x</em>
        </div>
        ${results.connections.included ? `
          <div class="math-step">
            <strong>Connection Cost:</strong><br>
            $${results.steel.cost.toLocaleString()} × ${(results.connections.factor * 100).toFixed(0)}% = $${results.connections.cost.toLocaleString()}
          </div>
        ` : ''}
      </div>

      <div class="math-section">
        <h4>Labor Calculations</h4>
        <div class="math-step">
          <strong>Labor Hours:</strong><br>
          ${results.steel.totalTons.toFixed(1)} tons ÷ ${results.labor.productivity} tons/hour = ${results.labor.hours.toFixed(1)} hours
        </div>
        <div class="math-step">
          <strong>Labor Cost:</strong><br>
          ${results.labor.hours.toFixed(1)} hours × $${results.labor.rate.toFixed(2)}/hour = $${results.labor.cost.toLocaleString()}
        </div>
      </div>

      <div class="math-section">
        <h4>Equipment Calculations</h4>
        <div class="math-step">
          <strong>Equipment Cost:</strong><br>
          ${results.steel.totalTons.toFixed(1)} tons × $${results.equipment.ratePerTon}/ton = $${results.equipment.cost.toLocaleString()}
        </div>
      </div>

      <div class="math-section">
        <h4>Final Totals</h4>
        <div class="math-step">
          <strong>Materials Total:</strong> $${results.totals.materials.toLocaleString()}<br>
          <strong>Labor Total:</strong> $${results.totals.labor.toLocaleString()}<br>
          <strong>Equipment Total:</strong> $${results.totals.equipment.toLocaleString()}<br>
          <strong>Grand Total:</strong> $${results.totals.total.toLocaleString()}<br>
          <strong>Cost per Sq Ft:</strong> $${results.totals.total.toLocaleString()} ÷ ${results.buildingArea} sq ft = $${results.totals.costPerSqFt.toFixed(2)}
        </div>
      </div>
    `;
  }

  clear() {
    this.state = {
      projectType: 'building_frame',
      buildingLength: '',
      buildingWidth: '',
      baySpacing: 25,
      eaveHeight: 16,
      roofSlope: 0.5,
      steelGrade: 'A992',
      includeColumns: true,
      includeBeams: true,
      includeRafters: true,
      includeBracing: true,
      includeConnections: true,
      connectionType: 'bolted',
      laborRate: 85,
      regionFactor: 1.0,
      costOverrides: {}
    };

    localStorage.removeItem('steel-calculator-state');
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
      ['Steel Calculator Results'],
      [''],
      ['Project Details'],
      ['Project Type', this.state.projectType.replace('_', ' ')],
      ['Building Dimensions', `${this.state.buildingLength}' × ${this.state.buildingWidth}'`],
      ['Building Area', `${results.buildingArea} sq ft`],
      ['Steel Grade', results.steel.grade],
      ['Bay Spacing', `${this.state.baySpacing} ft`],
      [''],
      ['Steel Components'],
      ['Component', 'Weight (lbs)', '% of Total'],
      ...Object.entries(results.weights).filter(([key, comp]) => comp.included).map(([key, comp]) => [
        key.toUpperCase(),
        comp.weight.toFixed(0),
        `${((comp.weight / results.steel.totalWeight) * 100).toFixed(1)}%`
      ]),
      ['TOTAL', results.steel.totalWeight.toFixed(0), '100%'],
      [''],
      ['Cost Summary'],
      ['Materials Total', `$${results.totals.materials.toFixed(2)}`],
      ['Labor Total', `$${results.totals.labor.toFixed(2)}`],
      ['Equipment Total', `$${results.totals.equipment.toFixed(2)}`],
      ['Grand Total', `$${results.totals.total.toFixed(2)}`],
      ['Cost per Sq Ft', `$${results.totals.costPerSqFt.toFixed(2)}`],
      ['Cost per Ton', `$${results.totals.costPerTon.toFixed(2)}`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steel-estimate-${new Date().toISOString().split('T')[0]}.csv`;
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
      type: 'steel',
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

    const subject = encodeURIComponent('Steel Calculator Estimate');
    const body = encodeURIComponent(`
      Steel Estimate Summary:

      Building: ${this.state.buildingLength}' × ${this.state.buildingWidth}' (${this.currentResults.buildingArea.toLocaleString()} sq ft)
      Steel: ${this.currentResults.steel.totalWeight.toLocaleString()} lbs (${this.currentResults.steel.totalTons.toFixed(1)} tons)
      Grade: ${this.currentResults.steel.grade}

      Cost Breakdown:
      - Materials: $${this.currentResults.totals.materials.toFixed(2)}
      - Labor: $${this.currentResults.totals.labor.toFixed(2)}
      - Equipment: $${this.currentResults.totals.equipment.toFixed(2)}

      Total Cost: $${this.currentResults.totals.total.toFixed(2)}
      Cost per Sq Ft: $${this.currentResults.totals.costPerSqFt.toFixed(2)}
      Cost per Ton: $${this.currentResults.totals.costPerTon.toFixed(2)}

      Generated by CostFlow AI Steel Calculator
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new SteelCalculator();
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
        id: 'steel',
        title: 'Steel Calculator',
        category: 'structural',
        description: 'Calculate costs for structural steel projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default SteelCalculator;