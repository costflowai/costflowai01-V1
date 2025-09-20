/**
 * Asphalt Calculator - Driveways and Parking Lots
 * Calculates asphalt materials and costs for paving projects
 */

class AsphaltCalculator {
  constructor() {
    this.pricing = null;
    this.container = null;
    this.state = {
      projectType: 'driveway',
      length: '',
      width: '',
      thickness: 3,
      baseRequired: true,
      baseThickness: 4,
      sealcoating: false,
      striping: false,
      asphaltMix: 'standard',
      compaction: 'standard',
      laborRate: 65,
      regionFactor: 1.0,
      costOverrides: {}
    };
  }

  async init(element) {
    if (!element) {
      console.error('Asphalt calculator: No DOM element provided');
      return;
    }

    this.container = element;

    try {
      await this.loadPricing();
      this.loadState();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Asphalt calculator initialization error:', error);
      this.container.innerHTML = '<div class="error">Failed to load calculator</div>';
    }
  }

  async loadPricing() {
    try {
      const response = await fetch('/assets/data/pricing.base.json');
      const data = await response.json();
      this.pricing = data.asphalt;
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      throw error;
    }
  }

  loadState() {
    const saved = localStorage.getItem('asphalt-calculator-state');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }

  saveState() {
    localStorage.setItem('asphalt-calculator-state', JSON.stringify(this.state));
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator-header">
        <h1>Asphalt Calculator</h1>
        <p>Calculate materials and costs for asphalt driveways and parking lots</p>
      </div>

      <div class="calculator-content">
        <div class="calculator-inputs">
          <div class="input-section">
            <h3>Project Details</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="projectType">Project Type</label>
                <select id="projectType">
                  <option value="driveway" ${this.state.projectType === 'driveway' ? 'selected' : ''}>
                    Residential Driveway
                  </option>
                  <option value="parking_lot" ${this.state.projectType === 'parking_lot' ? 'selected' : ''}>
                    Parking Lot
                  </option>
                  <option value="road" ${this.state.projectType === 'road' ? 'selected' : ''}>
                    Private Road
                  </option>
                  <option value="pathway" ${this.state.projectType === 'pathway' ? 'selected' : ''}>
                    Walkway/Path
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label for="asphaltMix">Asphalt Mix Type</label>
                <select id="asphaltMix">
                  <option value="standard" ${this.state.asphaltMix === 'standard' ? 'selected' : ''}>Standard Mix</option>
                  <option value="premium" ${this.state.asphaltMix === 'premium' ? 'selected' : ''}>Premium Mix</option>
                  <option value="recycled" ${this.state.asphaltMix === 'recycled' ? 'selected' : ''}>Recycled Mix</option>
                </select>
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Dimensions</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="length">Length (ft)</label>
                <input type="number" id="length" value="${this.state.length}"
                       min="1" max="1000" step="1" placeholder="50">
              </div>
              <div class="input-group">
                <label for="width">Width (ft)</label>
                <input type="number" id="width" value="${this.state.width}"
                       min="1" max="200" step="1" placeholder="12">
              </div>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="thickness">Asphalt Thickness (inches)</label>
                <input type="number" id="thickness" value="${this.state.thickness}"
                       min="2" max="6" step="0.5">
              </div>
              <div class="input-group">
                <label for="baseThickness">Base Thickness (inches)</label>
                <input type="number" id="baseThickness" value="${this.state.baseThickness}"
                       min="2" max="8" step="1" ${!this.state.baseRequired ? 'disabled' : ''}>
              </div>
            </div>
          </div>

          <div class="input-section">
            <h3>Additional Work</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="baseRequired"
                       ${this.state.baseRequired ? 'checked' : ''}>
                Include Gravel Base
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="sealcoating"
                       ${this.state.sealcoating ? 'checked' : ''}>
                Include Sealcoating
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="striping"
                       ${this.state.striping ? 'checked' : ''}>
                Include Line Striping
              </label>
            </div>
          </div>

          <div class="input-section">
            <h3>Labor & Pricing</h3>
            <div class="input-row">
              <div class="input-group">
                <label for="compaction">Compaction Level</label>
                <select id="compaction">
                  <option value="standard" ${this.state.compaction === 'standard' ? 'selected' : ''}>Standard</option>
                  <option value="heavy_duty" ${this.state.compaction === 'heavy_duty' ? 'selected' : ''}>Heavy Duty</option>
                </select>
              </div>
              <div class="input-group">
                <label for="laborRate">Labor Rate ($/hour)</label>
                <input type="number" id="laborRate" value="${this.state.laborRate}"
                       min="40" max="120" step="5">
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
            <button id="calculateBtn" class="btn btn-primary">Calculate Asphalt</button>
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
    const inputs = ['projectType', 'length', 'width', 'thickness', 'baseThickness',
                   'baseRequired', 'sealcoating', 'striping', 'asphaltMix',
                   'compaction', 'laborRate', 'regionFactor'];

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

    // Special handler for base checkbox
    document.getElementById('baseRequired')?.addEventListener('change', (e) => {
      document.getElementById('baseThickness').disabled = !e.target.checked;
    });
  }

  updateState() {
    // Update state from form inputs
    this.state.projectType = document.getElementById('projectType')?.value || 'driveway';
    this.state.length = parseFloat(document.getElementById('length')?.value || 0);
    this.state.width = parseFloat(document.getElementById('width')?.value || 0);
    this.state.thickness = parseFloat(document.getElementById('thickness')?.value || 3);
    this.state.baseThickness = parseFloat(document.getElementById('baseThickness')?.value || 4);
    this.state.baseRequired = document.getElementById('baseRequired')?.checked || false;
    this.state.sealcoating = document.getElementById('sealcoating')?.checked || false;
    this.state.striping = document.getElementById('striping')?.checked || false;
    this.state.asphaltMix = document.getElementById('asphaltMix')?.value || 'standard';
    this.state.compaction = document.getElementById('compaction')?.value || 'standard';
    this.state.laborRate = parseFloat(document.getElementById('laborRate')?.value || 65);
    this.state.regionFactor = parseFloat(document.getElementById('regionFactor')?.value || 1.0);

    this.saveState();
  }

  validate() {
    const errors = [];

    if (!this.state.length || this.state.length <= 0) {
      errors.push('Length must be greater than 0');
    }
    if (!this.state.width || this.state.width <= 0) {
      errors.push('Width must be greater than 0');
    }
    if (this.state.length > 1000 || this.state.width > 200) {
      errors.push('Dimensions seem unreasonably large');
    }
    if (this.state.thickness < 2 || this.state.thickness > 6) {
      errors.push('Asphalt thickness should be between 2-6 inches');
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
    const area = this.state.length * this.state.width;
    const asphaltVolume = area * (this.state.thickness / 12); // Convert inches to feet

    // Asphalt weight: ~150 lbs per cubic foot
    const asphaltWeight = asphaltVolume * 150;
    const asphaltTons = asphaltWeight / 2000;

    // Base material calculations
    let baseVolume = 0;
    let baseWeight = 0;
    let baseTons = 0;
    if (this.state.baseRequired) {
      baseVolume = area * (this.state.baseThickness / 12);
      baseWeight = baseVolume * 120; // Gravel ~120 lbs per cubic foot
      baseTons = baseWeight / 2000;
    }

    // Material pricing
    const asphaltMixFactors = { 'standard': 1.0, 'premium': 1.2, 'recycled': 0.8 };
    const mixFactor = asphaltMixFactors[this.state.asphaltMix] || 1.0;

    const asphaltPricePerTon = (this.pricing?.materials?.asphalt_mix || 85) * mixFactor * this.state.regionFactor;
    const basePricePerTon = (this.pricing?.materials?.gravel_base || 25) * this.state.regionFactor;

    // Material costs
    const asphaltCost = asphaltTons * asphaltPricePerTon;
    const baseCost = this.state.baseRequired ? baseTons * basePricePerTon : 0;

    // Additional services
    let sealcoatingCost = 0;
    if (this.state.sealcoating) {
      const sealcoatRate = this.pricing?.services?.sealcoating || 0.35;
      sealcoatingCost = area * sealcoatRate * this.state.regionFactor;
    }

    let stripingCost = 0;
    if (this.state.striping) {
      // Estimate based on typical parking lot striping
      const stripingRate = this.pricing?.services?.striping || 3.50;
      const estimatedLines = Math.max(area / 200, 100); // Linear feet of striping
      stripingCost = estimatedLines * stripingRate * this.state.regionFactor;
    }

    // Labor calculations
    const compactionFactors = { 'standard': 1.0, 'heavy_duty': 1.3 };
    const compactionFactor = compactionFactors[this.state.compaction] || 1.0;

    // Labor productivity: ~300 sq ft per hour for asphalt paving
    const laborProductivity = 300;
    const laborHours = (area / laborProductivity) * compactionFactor;
    const laborCost = laborHours * this.state.laborRate * this.state.regionFactor;

    // Equipment costs (paver, roller, truck)
    const equipmentRate = this.pricing?.equipment?.paving_crew || 125;
    const equipmentCost = laborHours * equipmentRate;

    // Totals
    const materialTotal = asphaltCost + baseCost + sealcoatingCost + stripingCost;
    const totalCost = materialTotal + laborCost + equipmentCost;

    return {
      area,
      asphalt: {
        volume: asphaltVolume,
        weight: asphaltWeight,
        tons: asphaltTons,
        pricePerTon: asphaltPricePerTon,
        cost: asphaltCost,
        mix: this.state.asphaltMix,
        thickness: this.state.thickness
      },
      base: this.state.baseRequired ? {
        volume: baseVolume,
        weight: baseWeight,
        tons: baseTons,
        pricePerTon: basePricePerTon,
        cost: baseCost,
        thickness: this.state.baseThickness,
        included: true
      } : { included: false },
      services: {
        sealcoating: this.state.sealcoating ? {
          area,
          rate: this.pricing?.services?.sealcoating || 0.35,
          cost: sealcoatingCost,
          included: true
        } : { included: false },
        striping: this.state.striping ? {
          linearFeet: Math.max(area / 200, 100),
          rate: this.pricing?.services?.striping || 3.50,
          cost: stripingCost,
          included: true
        } : { included: false }
      },
      labor: {
        hours: laborHours,
        productivity: laborProductivity,
        compactionFactor,
        rate: this.state.laborRate * this.state.regionFactor,
        cost: laborCost
      },
      equipment: {
        hours: laborHours,
        rate: equipmentRate,
        cost: equipmentCost,
        description: "Paver, roller, and support equipment"
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

  displayResults(results) {
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = `
      <h3>Asphalt Estimate Results</h3>

      <div class="results-summary">
        <div class="result-card">
          <h4>Project Summary</h4>
          <div class="result-row">
            <span>Project Type:</span>
            <span>${this.state.projectType.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="result-row">
            <span>Area:</span>
            <span>${results.area.toLocaleString()} sq ft (${this.state.length}' × ${this.state.width}')</span>
          </div>
          <div class="result-row">
            <span>Asphalt:</span>
            <span>${results.asphalt.tons.toFixed(1)} tons (${this.state.thickness}" thick)</span>
          </div>
          ${results.base.included ? `
          <div class="result-row">
            <span>Base Material:</span>
            <span>${results.base.tons.toFixed(1)} tons (${this.state.baseThickness}" thick)</span>
          </div>
          ` : ''}
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
              <th>Material</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Asphalt (${results.asphalt.mix})</td>
              <td>${results.asphalt.tons.toFixed(1)} tons</td>
              <td>$${results.asphalt.pricePerTon.toFixed(2)}/ton</td>
              <td>$${results.asphalt.cost.toFixed(2)}</td>
            </tr>
            ${results.base.included ? `
            <tr>
              <td>Gravel Base</td>
              <td>${results.base.tons.toFixed(1)} tons</td>
              <td>$${results.base.pricePerTon.toFixed(2)}/ton</td>
              <td>$${results.base.cost.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${results.services.sealcoating.included ? `
            <tr>
              <td>Sealcoating</td>
              <td>${results.services.sealcoating.area.toLocaleString()} sq ft</td>
              <td>$${results.services.sealcoating.rate.toFixed(2)}/sq ft</td>
              <td>$${results.services.sealcoating.cost.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${results.services.striping.included ? `
            <tr>
              <td>Line Striping</td>
              <td>${results.services.striping.linearFeet.toFixed(0)} ln ft</td>
              <td>$${results.services.striping.rate.toFixed(2)}/ln ft</td>
              <td>$${results.services.striping.cost.toFixed(2)}</td>
            </tr>
            ` : ''}
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
          <span>Compaction Factor:</span>
          <span>${results.labor.compactionFactor}x (${this.state.compaction})</span>
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
        <h4>Area Calculations</h4>
        <div class="math-step">
          <strong>Paving Area:</strong><br>
          ${this.state.length} ft × ${this.state.width} ft = ${results.area.toLocaleString()} sq ft
        </div>
      </div>

      <div class="math-section">
        <h4>Volume Calculations</h4>
        <div class="math-step">
          <strong>Asphalt Volume:</strong><br>
          ${results.area.toLocaleString()} sq ft × ${this.state.thickness}" ÷ 12 = ${results.asphalt.volume.toFixed(1)} cu ft<br>
          ${results.asphalt.volume.toFixed(1)} cu ft × 150 lbs/cu ft = ${results.asphalt.weight.toLocaleString()} lbs<br>
          ${results.asphalt.weight.toLocaleString()} lbs ÷ 2,000 = ${results.asphalt.tons.toFixed(1)} tons
        </div>
        ${results.base.included ? `
        <div class="math-step">
          <strong>Base Volume:</strong><br>
          ${results.area.toLocaleString()} sq ft × ${this.state.baseThickness}" ÷ 12 = ${results.base.volume.toFixed(1)} cu ft<br>
          ${results.base.volume.toFixed(1)} cu ft × 120 lbs/cu ft = ${results.base.weight.toLocaleString()} lbs<br>
          ${results.base.weight.toLocaleString()} lbs ÷ 2,000 = ${results.base.tons.toFixed(1)} tons
        </div>
        ` : ''}
      </div>

      <div class="math-section">
        <h4>Material Cost Calculations</h4>
        <div class="math-step">
          <strong>Asphalt Cost:</strong><br>
          ${results.asphalt.tons.toFixed(1)} tons × $${results.asphalt.pricePerTon.toFixed(2)}/ton = $${results.asphalt.cost.toFixed(2)}<br>
          <em>Price includes ${this.state.asphaltMix} mix factor</em>
        </div>
        ${results.base.included ? `
        <div class="math-step">
          <strong>Base Cost:</strong><br>
          ${results.base.tons.toFixed(1)} tons × $${results.base.pricePerTon.toFixed(2)}/ton = $${results.base.cost.toFixed(2)}
        </div>
        ` : ''}
        ${results.services.sealcoating.included ? `
        <div class="math-step">
          <strong>Sealcoating Cost:</strong><br>
          ${results.services.sealcoating.area.toLocaleString()} sq ft × $${results.services.sealcoating.rate.toFixed(2)}/sq ft = $${results.services.sealcoating.cost.toFixed(2)}
        </div>
        ` : ''}
        ${results.services.striping.included ? `
        <div class="math-step">
          <strong>Striping Cost:</strong><br>
          ${results.services.striping.linearFeet.toFixed(0)} ln ft × $${results.services.striping.rate.toFixed(2)}/ln ft = $${results.services.striping.cost.toFixed(2)}
        </div>
        ` : ''}
      </div>

      <div class="math-section">
        <h4>Labor Calculations</h4>
        <div class="math-step">
          <strong>Labor Hours:</strong><br>
          ${results.area.toLocaleString()} sq ft ÷ ${results.labor.productivity} sq ft/hour × ${results.labor.compactionFactor} = ${results.labor.hours.toFixed(1)} hours
        </div>
        <div class="math-step">
          <strong>Labor Cost:</strong><br>
          ${results.labor.hours.toFixed(1)} hours × $${results.labor.rate.toFixed(2)}/hour = $${results.labor.cost.toFixed(2)}
        </div>
      </div>

      <div class="math-section">
        <h4>Final Totals</h4>
        <div class="math-step">
          <strong>Materials Total:</strong> $${results.totals.materials.toFixed(2)}<br>
          <strong>Labor Total:</strong> $${results.totals.labor.toFixed(2)}<br>
          <strong>Equipment Total:</strong> $${results.totals.equipment.toFixed(2)}<br>
          <strong>Grand Total:</strong> $${results.totals.total.toFixed(2)}<br>
          <strong>Cost per Sq Ft:</strong> $${results.totals.total.toFixed(2)} ÷ ${results.area} sq ft = $${results.totals.costPerSqFt.toFixed(2)}
        </div>
      </div>
    `;
  }

  clear() {
    this.state = {
      projectType: 'driveway',
      length: '',
      width: '',
      thickness: 3,
      baseRequired: true,
      baseThickness: 4,
      sealcoating: false,
      striping: false,
      asphaltMix: 'standard',
      compaction: 'standard',
      laborRate: 65,
      regionFactor: 1.0,
      costOverrides: {}
    };

    localStorage.removeItem('asphalt-calculator-state');
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
      ['Asphalt Calculator Results'],
      [''],
      ['Project Details'],
      ['Project Type', this.state.projectType.replace('_', ' ')],
      ['Dimensions', `${this.state.length}' × ${this.state.width}'`],
      ['Area', `${results.area} sq ft`],
      ['Asphalt Thickness', `${this.state.thickness}"`],
      ['Asphalt Mix', this.state.asphaltMix],
      [''],
      ['Materials Breakdown'],
      ['Material', 'Quantity', 'Unit Price', 'Total Cost'],
      ['Asphalt', `${results.asphalt.tons.toFixed(1)} tons`, `$${results.asphalt.pricePerTon.toFixed(2)}`, `$${results.asphalt.cost.toFixed(2)}`],
      ...(results.base.included ? [['Gravel Base', `${results.base.tons.toFixed(1)} tons`, `$${results.base.pricePerTon.toFixed(2)}`, `$${results.base.cost.toFixed(2)}`]] : []),
      ...(results.services.sealcoating.included ? [['Sealcoating', `${results.services.sealcoating.area} sq ft`, `$${results.services.sealcoating.rate.toFixed(2)}`, `$${results.services.sealcoating.cost.toFixed(2)}`]] : []),
      ...(results.services.striping.included ? [['Line Striping', `${results.services.striping.linearFeet.toFixed(0)} ln ft`, `$${results.services.striping.rate.toFixed(2)}`, `$${results.services.striping.cost.toFixed(2)}`]] : []),
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
    a.download = `asphalt-estimate-${new Date().toISOString().split('T')[0]}.csv`;
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
      type: 'asphalt',
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

    const subject = encodeURIComponent('Asphalt Calculator Estimate');
    const body = encodeURIComponent(`
      Asphalt Estimate Summary:

      Project: ${this.state.projectType.replace('_', ' ').toUpperCase()}
      Area: ${this.currentResults.area.toLocaleString()} sq ft (${this.state.length}' × ${this.state.width}')
      Asphalt: ${this.currentResults.asphalt.tons.toFixed(1)} tons (${this.state.thickness}" thick)

      Cost Breakdown:
      - Materials: $${this.currentResults.totals.materials.toFixed(2)}
      - Labor: $${this.currentResults.totals.labor.toFixed(2)}
      - Equipment: $${this.currentResults.totals.equipment.toFixed(2)}

      Total Cost: $${this.currentResults.totals.total.toFixed(2)}
      Cost per Sq Ft: $${this.currentResults.totals.costPerSqFt.toFixed(2)}

      Generated by CostFlow AI Asphalt Calculator
    `);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// Singleton instance for legacy API compatibility
let calculatorInstance = null;

// Legacy API compatibility functions
export function init(el) {
    if (!calculatorInstance) {
        calculatorInstance = new AsphaltCalculator();
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
        id: 'asphalt',
        title: 'Asphalt Calculator',
        category: 'sitework',
        description: 'Calculate costs for asphalt paving projects',
        version: '1.0.0'
    };
}

// Export for use by the calculator loader
export default AsphaltCalculator;