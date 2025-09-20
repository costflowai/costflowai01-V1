// Roofing Calculator - Shingle and Flat Roofing
import { validateInput, validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  // Defensive check for DOM element
  if (!el) {
    console.error('Roofing calculator: No container element provided');
    return;
  }

  const savedState = loadState('roofing') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Roofing Calculator</h2>
        <p>Calculate shingle and flat roofing materials, labor, and costs</p>
      </div>

      <div class="input-section">
        <h3>Roof Dimensions</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="roof-area">Roof Area (sq ft)</label>
            <input type="number" id="roof-area" min="1" step="1" value="${savedState.roofArea || ''}" required>
            <span class="input-help">Total roof area to be covered</span>
          </div>

          <div class="input-group">
            <label for="pitch-factor">Pitch Factor</label>
            <select id="pitch-factor">
              <option value="1.0" ${savedState.pitchFactor === '1.0' ? 'selected' : ''}>Flat (1.0)</option>
              <option value="1.05" ${savedState.pitchFactor === '1.05' ? 'selected' : ''}>Low Slope 2/12 (1.05)</option>
              <option value="1.15" ${savedState.pitchFactor === '1.15' ? 'selected' : ''}>Medium 4/12 (1.15)</option>
              <option value="1.25" ${savedState.pitchFactor === '1.25' ? 'selected' : ''}>Standard 6/12 (1.25)</option>
              <option value="1.35" ${savedState.pitchFactor === '1.35' ? 'selected' : ''}>Steep 8/12 (1.35)</option>
              <option value="1.50" ${savedState.pitchFactor === '1.50' ? 'selected' : ''}>Very Steep 12/12 (1.50)</option>
            </select>
            <span class="input-help">Roof pitch complexity factor</span>
          </div>

          <div class="input-group">
            <label for="waste-percent">Waste Factor (%)</label>
            <input type="number" id="waste-percent" min="5" max="25" step="1" value="${savedState.wastePercent || '10'}" required>
            <span class="input-help">Material waste allowance (typically 10-15%)</span>
          </div>
        </div>
      </div>

      <div class="input-section">
        <h3>Material Specifications</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="shingle-type">Shingle Type</label>
            <select id="shingle-type">
              <option value="arch" ${savedState.shingleType === 'arch' ? 'selected' : ''}>Architectural</option>
              <option value="3tab" ${savedState.shingleType === '3tab' ? 'selected' : ''}>3-Tab</option>
            </select>
            <span class="input-help">Shingle grade and quality</span>
          </div>

          <div class="input-group">
            <label for="underlayment-type">Underlayment</label>
            <select id="underlayment-type">
              <option value="felt" ${savedState.underlaymentType === 'felt' ? 'selected' : ''}>Felt Paper</option>
              <option value="synthetic" ${savedState.underlaymentType === 'synthetic' ? 'selected' : ''}>Synthetic</option>
            </select>
            <span class="input-help">Roof underlayment material</span>
          </div>

          <div class="input-group">
            <label for="ridge-length">Ridge Length (LF)</label>
            <input type="number" id="ridge-length" min="0" step="1" value="${savedState.ridgeLength || ''}" required>
            <span class="input-help">Total linear feet of ridge cap needed</span>
          </div>

          <div class="input-group">
            <label for="drip-edge-length">Drip Edge (LF)</label>
            <input type="number" id="drip-edge-length" min="0" step="1" value="${savedState.dripEdgeLength || ''}" required>
            <span class="input-help">Perimeter linear feet for drip edge</span>
          </div>

          <div class="input-group">
            <label for="roof-vents">Roof Vents (qty)</label>
            <input type="number" id="roof-vents" min="0" step="1" value="${savedState.roofVents || '4'}" required>
            <span class="input-help">Number of roof vents to install</span>
          </div>
        </div>
      </div>

      <div class="input-section">
        <h3>Labor & Regional Factors</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="productivity">Productivity (sq/hour)</label>
            <input type="number" id="productivity" min="10" max="50" step="1" value="${savedState.productivity || '25'}" required>
            <span class="input-help">Squares installed per hour</span>
          </div>

          <div class="input-group">
            <label for="regional-factor">Regional Factor</label>
            <input type="number" id="regional-factor" min="0.5" max="2.0" step="0.1" value="${savedState.regionalFactor || '1.0'}" required>
            <span class="input-help">Local cost adjustment (1.0 = average)</span>
          </div>
        </div>
      </div>

      <div class="input-section override-section">
        <h3>Cost Overrides (Optional)</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="material-override">Material Rate Override ($/sq)</label>
            <input type="number" id="material-override" min="0" step="0.01" value="${savedState.materialOverride || ''}" placeholder="Leave blank for default">
            <span class="input-help">Override default material pricing</span>
          </div>

          <div class="input-group">
            <label for="labor-override">Labor Rate Override ($/hour)</label>
            <input type="number" id="labor-override" min="0" step="0.01" value="${savedState.laborOverride || ''}" placeholder="Leave blank for default">
            <span class="input-help">Override default labor rate</span>
          </div>
        </div>
      </div>

      <div class="calculate-section">
        <button id="calculate-btn" class="btn btn-primary" disabled>Calculate Roofing Cost</button>
      </div>

      <div id="results" class="results-section" style="display: none;">
        <h3>Roofing Cost Estimate</h3>

        <div class="results-summary">
          <div class="result-item">
            <span class="label">Total Project Cost:</span>
            <span class="value total-cost">$0.00</span>
          </div>
        </div>

        <div class="results-breakdown">
          <h4>Material Quantities</h4>
          <div class="breakdown-grid">
            <div class="breakdown-item">
              <span class="label">Roofing Squares:</span>
              <span class="value" id="result-squares">0</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Underlayment Rolls:</span>
              <span class="value" id="result-underlayment">0</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Ridge Cap (LF):</span>
              <span class="value" id="result-ridge">0</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Drip Edge (LF):</span>
              <span class="value" id="result-drip-edge">0</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Roof Vents:</span>
              <span class="value" id="result-vents">0</span>
            </div>
          </div>

          <h4>Cost Breakdown</h4>
          <div class="breakdown-grid">
            <div class="breakdown-item">
              <span class="label">Materials:</span>
              <span class="value" id="result-materials">$0.00</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Labor:</span>
              <span class="value" id="result-labor">$0.00</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Equipment:</span>
              <span class="value" id="result-equipment">$0.00</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Total:</span>
              <span class="value total-cost">$0.00</span>
            </div>
          </div>
        </div>

        <div class="show-math-section">
          <button id="show-math-btn" class="btn btn-secondary">Show Math</button>
          <div id="math-breakdown" class="math-breakdown" style="display: none;"></div>
        </div>

        <div class="export-section">
          <h4>Export Results</h4>
          <div class="export-buttons">
            <button id="export-csv" class="btn btn-outline">Export CSV</button>
            <button id="export-xlsx" class="btn btn-outline">Export Excel</button>
            <button id="export-pdf" class="btn btn-outline">Export PDF</button>
            <button id="print-results" class="btn btn-outline">Print</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize functionality
  initializeRoofingCalculator();
}

function initializeRoofingCalculator() {
  const inputs = [
    'roof-area', 'pitch-factor', 'waste-percent', 'shingle-type',
    'underlayment-type', 'ridge-length', 'drip-edge-length', 'roof-vents',
    'productivity', 'regional-factor', 'material-override', 'labor-override'
  ];

  const calculateBtn = document.getElementById('calculate-btn');
  const resultsDiv = document.getElementById('results');

  // Add event listeners for input validation
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', () => {
        validateInputs();
        saveCurrentState();
      });
      input.addEventListener('change', () => {
        validateInputs();
        saveCurrentState();
      });
    }
  });

  // Calculate button
  calculateBtn.addEventListener('click', calculateRoofing);

  // Show math button
  document.getElementById('show-math-btn')?.addEventListener('click', toggleMath);

  // Export buttons
  document.getElementById('export-csv')?.addEventListener('click', () => exportResults('csv'));
  document.getElementById('export-xlsx')?.addEventListener('click', () => exportResults('xlsx'));
  document.getElementById('export-pdf')?.addEventListener('click', () => exportResults('pdf'));
  document.getElementById('print-results')?.addEventListener('click', () => window.print());

  // Initial validation
  validateInputs();
}

function validateInputs() {
  const roofArea = document.getElementById('roof-area').value;
  const ridgeLength = document.getElementById('ridge-length').value;
  const dripEdgeLength = document.getElementById('drip-edge-length').value;
  const productivity = document.getElementById('productivity').value;
  const regionalFactor = document.getElementById('regional-factor').value;

  const isValid = validateNumber(roofArea, 1) &&
                  validateNumber(ridgeLength, 0) &&
                  validateNumber(dripEdgeLength, 0) &&
                  validateNumber(productivity, 10, 50) &&
                  validateNumber(regionalFactor, 0.5, 2.0);

  document.getElementById('calculate-btn').disabled = !isValid;
}

function saveCurrentState() {
  const state = {
    roofArea: document.getElementById('roof-area').value,
    pitchFactor: document.getElementById('pitch-factor').value,
    wastePercent: document.getElementById('waste-percent').value,
    shingleType: document.getElementById('shingle-type').value,
    underlaymentType: document.getElementById('underlayment-type').value,
    ridgeLength: document.getElementById('ridge-length').value,
    dripEdgeLength: document.getElementById('drip-edge-length').value,
    roofVents: document.getElementById('roof-vents').value,
    productivity: document.getElementById('productivity').value,
    regionalFactor: document.getElementById('regional-factor').value,
    materialOverride: document.getElementById('material-override').value,
    laborOverride: document.getElementById('labor-override').value
  };

  saveState('roofing', state);
}

function calculateRoofing() {
  try {
    // Get input values
    const roofArea = parseFloat(document.getElementById('roof-area').value);
    const pitchFactor = parseFloat(document.getElementById('pitch-factor').value);
    const wastePercent = parseFloat(document.getElementById('waste-percent').value);
    const shingleType = document.getElementById('shingle-type').value;
    const underlaymentType = document.getElementById('underlayment-type').value;
    const ridgeLength = parseFloat(document.getElementById('ridge-length').value);
    const dripEdgeLength = parseFloat(document.getElementById('drip-edge-length').value);
    const roofVents = parseInt(document.getElementById('roof-vents').value);
    const productivity = parseFloat(document.getElementById('productivity').value);
    const regionalFactor = parseFloat(document.getElementById('regional-factor').value);
    const materialOverride = document.getElementById('material-override').value;
    const laborOverride = document.getElementById('labor-override').value;

    // Apply pitch factor and waste
    const adjustedArea = roofArea * pitchFactor * (1 + wastePercent / 100);

    // Calculate squares (100 sq ft = 1 square)
    const squares = Math.ceil(adjustedArea / 100);

    // Calculate materials
    const shingleCostPerSquare = shingleType === 'arch' ? 125 : 95; // From pricing
    const shingleCost = squares * shingleCostPerSquare;

    // Underlayment calculation
    const underlaymentCoverage = underlaymentType === 'synthetic' ? 1000 : 400;
    const underlaymentRolls = Math.ceil(adjustedArea / underlaymentCoverage);
    const underlaymentCostPerRoll = underlaymentType === 'synthetic' ? 65 : 35;
    const underlaymentCost = underlaymentRolls * underlaymentCostPerRoll;

    // Linear materials
    const ridgeCost = ridgeLength * 4.50;
    const dripEdgeCost = dripEdgeLength * 2.80;
    const ventCost = roofVents * 15.00;

    // Total material cost
    let materialCost = shingleCost + underlaymentCost + ridgeCost + dripEdgeCost + ventCost;

    // Apply material override if provided
    if (materialOverride) {
      materialCost = squares * parseFloat(materialOverride);
    }

    // Calculate labor
    const laborHours = squares / productivity * pitchFactor; // Pitch affects labor time
    const laborRate = laborOverride ? parseFloat(laborOverride) : 35.00; // From pricing
    const laborCost = laborHours * laborRate;

    // Equipment cost (10% of labor for roofing)
    const equipmentCost = laborCost * 0.10;

    // Apply regional factor
    const subtotal = (materialCost + laborCost + equipmentCost) * regionalFactor;

    // Store results for export
    window.roofingResults = {
      inputs: {
        roofArea,
        pitchFactor,
        wastePercent,
        shingleType,
        underlaymentType,
        ridgeLength,
        dripEdgeLength,
        roofVents,
        productivity,
        regionalFactor
      },
      quantities: {
        adjustedArea: Math.round(adjustedArea),
        squares,
        underlaymentRolls,
        ridgeLength,
        dripEdgeLength,
        roofVents
      },
      costs: {
        materials: materialCost * regionalFactor,
        labor: laborCost * regionalFactor,
        equipment: equipmentCost * regionalFactor,
        total: subtotal
      },
      math: generateMathBreakdown(roofArea, pitchFactor, wastePercent, adjustedArea, squares,
                                  shingleCostPerSquare, materialCost, laborHours, laborRate,
                                  laborCost, equipmentCost, regionalFactor, subtotal)
    };

    // Display results
    displayResults(window.roofingResults);

  } catch (error) {
    console.error('Roofing calculation error:', error);
    alert('Error in calculation. Please check your inputs.');
  }
}

function generateMathBreakdown(roofArea, pitchFactor, wastePercent, adjustedArea, squares,
                              shingleCostPerSquare, materialCost, laborHours, laborRate,
                              laborCost, equipmentCost, regionalFactor, total) {
  return `
    <h5>Area Calculations:</h5>
    <p>Roof Area: ${formatNumber(roofArea)} sq ft</p>
    <p>Pitch Factor: ${pitchFactor}</p>
    <p>Waste Factor: ${wastePercent}%</p>
    <p>Adjusted Area: ${formatNumber(roofArea)} × ${pitchFactor} × ${(1 + wastePercent/100)} = ${formatNumber(adjustedArea)} sq ft</p>
    <p>Roofing Squares: ${formatNumber(adjustedArea)} ÷ 100 = ${squares} squares</p>

    <h5>Material Costs:</h5>
    <p>Shingles: ${squares} squares × ${formatCurrency(shingleCostPerSquare)} = ${formatCurrency(squares * shingleCostPerSquare)}</p>
    <p>Total Materials: ${formatCurrency(materialCost)}</p>

    <h5>Labor Calculations:</h5>
    <p>Labor Hours: ${squares} squares ÷ ${formatNumber(laborHours/squares)} prod/hr × ${pitchFactor} pitch = ${formatNumber(laborHours)} hours</p>
    <p>Labor Cost: ${formatNumber(laborHours)} hours × ${formatCurrency(laborRate)}/hr = ${formatCurrency(laborCost)}</p>
    <p>Equipment: ${formatCurrency(laborCost)} × 10% = ${formatCurrency(equipmentCost)}</p>

    <h5>Regional & Final:</h5>
    <p>Subtotal: ${formatCurrency((materialCost + laborCost + equipmentCost))}</p>
    <p>Regional Factor: ${regionalFactor}</p>
    <p>Total Cost: ${formatCurrency((materialCost + laborCost + equipmentCost))} × ${regionalFactor} = ${formatCurrency(total)}</p>
  `;
}

function displayResults(results) {
  // Update quantities
  document.getElementById('result-squares').textContent = results.quantities.squares;
  document.getElementById('result-underlayment').textContent = results.quantities.underlaymentRolls;
  document.getElementById('result-ridge').textContent = formatNumber(results.quantities.ridgeLength);
  document.getElementById('result-drip-edge').textContent = formatNumber(results.quantities.dripEdgeLength);
  document.getElementById('result-vents').textContent = results.quantities.roofVents;

  // Update costs
  document.getElementById('result-materials').textContent = formatCurrency(results.costs.materials);
  document.getElementById('result-labor').textContent = formatCurrency(results.costs.labor);
  document.getElementById('result-equipment').textContent = formatCurrency(results.costs.equipment);

  // Update total cost in multiple places
  document.querySelectorAll('.total-cost').forEach(el => {
    el.textContent = formatCurrency(results.costs.total);
  });

  // Show results section
  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function toggleMath() {
  const mathDiv = document.getElementById('math-breakdown');
  const btn = document.getElementById('show-math-btn');

  if (mathDiv.style.display === 'none') {
    mathDiv.innerHTML = window.roofingResults.math;
    mathDiv.style.display = 'block';
    btn.textContent = 'Hide Math';
  } else {
    mathDiv.style.display = 'none';
    btn.textContent = 'Show Math';
  }
}

function exportResults(format) {
  if (!window.roofingResults) {
    alert('No results to export. Please calculate first.');
    return;
  }

  const data = window.roofingResults;
  const exportData = {
    projectName: 'Roofing Cost Estimate',
    date: new Date().toLocaleDateString(),
    inputs: data.inputs,
    quantities: data.quantities,
    costs: data.costs,
    total: data.costs.total
  };

  switch (format) {
    case 'csv':
      exportToCsv(exportData, 'roofing-estimate');
      break;
    case 'xlsx':
      exportToXlsx(exportData, 'roofing-estimate');
      break;
    case 'pdf':
      exportToPdf(exportData, 'roofing-estimate');
      break;
  }
}

// Export metadata for calculator hub
export function meta() {
  return {
    name: 'Roofing Calculator',
    description: 'Calculate shingle and flat roofing materials, labor costs, and total project estimates',
    category: 'Exterior',
    tags: ['roofing', 'shingles', 'materials', 'labor'],
    version: '1.0'
  };
}

export function compute(state) {
  return { ok: false, msg: "Not implemented" };
}

export function explain(state) {
  return "TBD";
}

export function meta() {
  return {
    id: "roofing",
    title: "Roofing Calculator",
    category: "exterior"
  };
}