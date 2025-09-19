// Drywall & ACT Calculator
import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  const savedState = loadState('drywall') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Drywall & ACT Calculator</h2>
        <p>Calculate drywall sheets, tape, mud, and finishing materials</p>
      </div>

      <div class="input-section">
        <h3>Areas</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="wall-area">Wall Area (sq ft)</label>
            <input type="number" id="wall-area" step="0.1" min="0" value="${savedState.wallArea || ''}" />
          </div>
          <div class="input-group">
            <label for="ceiling-area">Ceiling Area (sq ft)</label>
            <input type="number" id="ceiling-area" step="0.1" min="0" value="${savedState.ceilingArea || ''}" />
          </div>
        </div>

        <h3>Configuration</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="sheet-size">Sheet Size</label>
            <select id="sheet-size">
              <option value="4x8" ${savedState.sheetSize === '4x8' ? 'selected' : ''}>4' x 8' (32 sq ft)</option>
              <option value="4x12" ${savedState.sheetSize === '4x12' ? 'selected' : ''}>4' x 12' (48 sq ft)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="waste-percent">Waste % (typical 10%)</label>
            <input type="number" id="waste-percent" step="0.1" min="0" max="50" value="${savedState.wastePercent || '10'}" />
          </div>
          <div class="input-group">
            <label for="tape-coverage">Tape Coverage (LF/roll)</label>
            <input type="number" id="tape-coverage" step="1" min="0" value="${savedState.tapeCoverage || '250'}" />
          </div>
          <div class="input-group">
            <label for="mud-coverage">Mud Coverage (sq ft/gal)</label>
            <input type="number" id="mud-coverage" step="1" min="0" value="${savedState.mudCoverage || '400'}" />
          </div>
        </div>

        <h3>Installation Details</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="screws-per-sqft">Screws per sq ft</label>
            <input type="number" id="screws-per-sqft" step="0.1" min="0" value="${savedState.screwsPerSqft || '1.2'}" />
          </div>
          <div class="input-group">
            <label for="corner-bead">Corner Bead (LF)</label>
            <input type="number" id="corner-bead" step="0.1" min="0" value="${savedState.cornerBead || ''}" />
          </div>
        </div>

        <h3>Pricing (Optional)</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="sheet-price">Sheet Price ($/ea)</label>
            <input type="number" id="sheet-price" step="0.01" min="0" value="${savedState.sheetPrice || ''}" />
          </div>
          <div class="input-group">
            <label for="tape-price">Tape Price ($/roll)</label>
            <input type="number" id="tape-price" step="0.01" min="0" value="${savedState.tapePrice || ''}" />
          </div>
          <div class="input-group">
            <label for="mud-price">Mud Price ($/gal)</label>
            <input type="number" id="mud-price" step="0.01" min="0" value="${savedState.mudPrice || ''}" />
          </div>
          <div class="input-group">
            <label for="screw-price">Screw Price ($/lb)</label>
            <input type="number" id="screw-price" step="0.01" min="0" value="${savedState.screwPrice || ''}" />
          </div>
          <div class="input-group">
            <label for="labor-rate">Labor Rate ($/hr)</label>
            <input type="number" id="labor-rate" step="0.01" min="0" value="${savedState.laborRate || ''}" />
          </div>
          <div class="input-group">
            <label for="productivity">Productivity (sq ft/hr)</label>
            <input type="number" id="productivity" step="0.1" min="0" value="${savedState.productivity || '25'}" />
          </div>
        </div>
      </div>

      <div class="button-section">
        <button id="calculate-btn" class="btn-primary" disabled>Calculate</button>
        <button id="clear-btn" class="btn-secondary">Clear</button>
      </div>

      <div id="results-section" class="results-section" style="display: none;">
        <h3>Results</h3>
        <div id="results-content"></div>

        <div class="export-section">
          <h4>Export Results</h4>
          <div class="export-buttons">
            <button id="export-csv" class="btn-export">CSV</button>
            <button id="export-xlsx" class="btn-export">XLSX</button>
            <button id="export-pdf" class="btn-export">PDF</button>
            <button id="print-btn" class="btn-export">Print</button>
          </div>
        </div>

        <div class="math-section">
          <button id="show-math-btn" class="btn-secondary">Show Math</button>
          <div id="math-details" class="math-details" style="display: none;"></div>
        </div>
      </div>
    </div>
  `;

  setupEventListeners();
}

function setupEventListeners() {
  const inputs = document.querySelectorAll('#wall-area, #ceiling-area, #sheet-size, #waste-percent, #tape-coverage, #mud-coverage, #screws-per-sqft, #corner-bead');
  inputs.forEach(input => {
    input.addEventListener('input', validateAndCalculate);
  });

  document.getElementById('calculate-btn').addEventListener('click', calculateDrywall);
  document.getElementById('clear-btn').addEventListener('click', clearInputs);
  document.getElementById('show-math-btn')?.addEventListener('click', toggleMath);

  document.getElementById('export-csv')?.addEventListener('click', () => exportResults('csv'));
  document.getElementById('export-xlsx')?.addEventListener('click', () => exportResults('xlsx'));
  document.getElementById('export-pdf')?.addEventListener('click', () => exportResults('pdf'));
  document.getElementById('print-btn')?.addEventListener('click', () => window.print());

  validateAndCalculate();
}

function validateAndCalculate() {
  const state = getCurrentState();
  const isValid = validateInputs(state);

  document.getElementById('calculate-btn').disabled = !isValid;

  if (isValid) {
    calculateDrywall();
  }

  saveState('drywall', state);
}

function getCurrentState() {
  return {
    wallArea: parseFloat(document.getElementById('wall-area').value) || 0,
    ceilingArea: parseFloat(document.getElementById('ceiling-area').value) || 0,
    sheetSize: document.getElementById('sheet-size').value,
    wastePercent: parseFloat(document.getElementById('waste-percent').value) || 10,
    tapeCoverage: parseFloat(document.getElementById('tape-coverage').value) || 250,
    mudCoverage: parseFloat(document.getElementById('mud-coverage').value) || 400,
    screwsPerSqft: parseFloat(document.getElementById('screws-per-sqft').value) || 1.2,
    cornerBead: parseFloat(document.getElementById('corner-bead').value) || 0,
    sheetPrice: parseFloat(document.getElementById('sheet-price').value) || 0,
    tapePrice: parseFloat(document.getElementById('tape-price').value) || 0,
    mudPrice: parseFloat(document.getElementById('mud-price').value) || 0,
    screwPrice: parseFloat(document.getElementById('screw-price').value) || 0,
    laborRate: parseFloat(document.getElementById('labor-rate').value) || 0,
    productivity: parseFloat(document.getElementById('productivity').value) || 25
  };
}

function validateInputs(state) {
  return (state.wallArea > 0 || state.ceilingArea > 0);
}

function calculateDrywall() {
  const state = getCurrentState();
  const result = compute(state);

  if (result.ok) {
    displayResults(result.data, state);
    document.getElementById('results-section').style.display = 'block';
  }
}

function displayResults(data, state) {
  const resultsContent = document.getElementById('results-content');

  resultsContent.innerHTML = `
    <div class="results-table">
      <table>
        <tr><th colspan="2">Material Requirements</th></tr>
        <tr><td>Total Area</td><td>${formatNumber(data.totalArea)} sq ft</td></tr>
        <tr><td>Drywall Sheets</td><td>${data.sheets}</td></tr>
        <tr><td>Tape Required</td><td>${formatNumber(data.tapeRolls)} rolls</td></tr>
        <tr><td>Mud Required</td><td>${formatNumber(data.mudGallons)} gallons</td></tr>
        <tr><td>Screws Required</td><td>${formatNumber(data.screwsPounds)} lbs</td></tr>
        ${data.cornerBead > 0 ? `<tr><td>Corner Bead</td><td>${formatNumber(data.cornerBead)} LF</td></tr>` : ''}

        ${data.materialCost > 0 ? `
        <tr><th colspan="2">Material Costs</th></tr>
        <tr><td>Sheet Cost</td><td>${formatCurrency(data.sheetCost)}</td></tr>
        <tr><td>Tape Cost</td><td>${formatCurrency(data.tapeCost)}</td></tr>
        <tr><td>Mud Cost</td><td>${formatCurrency(data.mudCost)}</td></tr>
        <tr><td>Screw Cost</td><td>${formatCurrency(data.screwCost)}</td></tr>
        <tr><td><strong>Total Material</strong></td><td><strong>${formatCurrency(data.materialCost)}</strong></td></tr>
        ` : ''}

        ${data.laborCost > 0 ? `
        <tr><th colspan="2">Labor</th></tr>
        <tr><td>Labor Hours</td><td>${formatNumber(data.laborHours)} hrs</td></tr>
        <tr><td>Labor Cost</td><td>${formatCurrency(data.laborCost)}</td></tr>
        ` : ''}

        ${data.totalCost > 0 ? `
        <tr><th colspan="2">Total Project</th></tr>
        <tr><td><strong>Total Cost</strong></td><td><strong>${formatCurrency(data.totalCost)}</strong></td></tr>
        ` : ''}
      </table>
    </div>

    <div class="assumptions">
      <h4>Assumptions</h4>
      <ul>
        <li>Sheet size: ${state.sheetSize}</li>
        <li>Waste factor: ${state.wastePercent}%</li>
        <li>Tape coverage: ${state.tapeCoverage} LF per roll</li>
        <li>Mud coverage: ${state.mudCoverage} sq ft per gallon</li>
        <li>Screws: ${state.screwsPerSqft} per sq ft</li>
        <li>Productivity: ${state.productivity} sq ft/hour</li>
      </ul>
    </div>
  `;
}

function clearInputs() {
  document.querySelectorAll('input, select').forEach(input => {
    if (input.type === 'number') {
      input.value = '';
    } else {
      input.selectedIndex = 0;
    }
  });

  document.getElementById('results-section').style.display = 'none';
  saveState('drywall', {});
}

function toggleMath() {
  const mathDetails = document.getElementById('math-details');
  const isVisible = mathDetails.style.display !== 'none';

  if (isVisible) {
    mathDetails.style.display = 'none';
    document.getElementById('show-math-btn').textContent = 'Show Math';
  } else {
    const state = getCurrentState();
    const explanation = explain(state);
    mathDetails.innerHTML = explanation;
    mathDetails.style.display = 'block';
    document.getElementById('show-math-btn').textContent = 'Hide Math';
  }
}

function exportResults(format) {
  const state = getCurrentState();
  const result = compute(state);

  if (!result.ok) return;

  const data = result.data;
  const exportData = [
    ['Drywall Calculator Results', ''],
    ['Wall Area', `${state.wallArea} sq ft`],
    ['Ceiling Area', `${state.ceilingArea} sq ft`],
    ['Total Area', `${data.totalArea} sq ft`],
    ['Sheet Size', state.sheetSize],
    [''],
    ['Drywall Sheets', data.sheets],
    ['Tape Rolls', formatNumber(data.tapeRolls)],
    ['Mud Gallons', formatNumber(data.mudGallons)],
    ['Screws (lbs)', formatNumber(data.screwsPounds)],
    [''],
    ['Material Cost', formatCurrency(data.materialCost)],
    ['Labor Cost', formatCurrency(data.laborCost)],
    ['Total Cost', formatCurrency(data.totalCost)]
  ];

  switch (format) {
    case 'csv':
      exportToCsv(exportData, 'drywall-calculation.csv');
      break;
    case 'xlsx':
      exportToXlsx(exportData, 'drywall-calculation.xlsx');
      break;
    case 'pdf':
      exportToPdf(exportData, 'Drywall Calculator Results', 'drywall-calculation.pdf');
      break;
  }
}

export function compute(state) {
  try {
    const { wallArea, ceilingArea, sheetSize, wastePercent, tapeCoverage, mudCoverage, screwsPerSqft, cornerBead, sheetPrice, tapePrice, mudPrice, screwPrice, laborRate, productivity } = state;

    if (!wallArea && !ceilingArea) {
      return { ok: false, msg: "Must specify wall or ceiling area" };
    }

    const totalArea = wallArea + ceilingArea;

    // Sheet calculations
    const sheetArea = sheetSize === '4x12' ? 48 : 32;
    const sheetsBase = Math.ceil(totalArea / sheetArea);
    const sheets = Math.ceil(sheetsBase * (1 + wastePercent / 100));

    // Tape calculations (estimate based on seams)
    const estimatedSeamLF = totalArea * 0.4; // Rough estimate: 40% of area in linear feet of seams
    const tapeRolls = Math.ceil(estimatedSeamLF / tapeCoverage);

    // Mud calculations
    const mudGallons = Math.ceil(totalArea / mudCoverage);

    // Screw calculations
    const totalScrews = totalArea * screwsPerSqft;
    const screwsPounds = Math.ceil(totalScrews / 200); // Approx 200 screws per pound

    // Cost calculations
    const sheetCost = sheetPrice > 0 ? sheets * sheetPrice : 0;
    const tapeCost = tapePrice > 0 ? tapeRolls * tapePrice : 0;
    const mudCost = mudPrice > 0 ? mudGallons * mudPrice : 0;
    const screwCost = screwPrice > 0 ? screwsPounds * screwPrice : 0;
    const materialCost = sheetCost + tapeCost + mudCost + screwCost;

    const laborHours = productivity > 0 ? totalArea / productivity : 0;
    const laborCost = laborRate > 0 && laborHours > 0 ? laborHours * laborRate : 0;

    const totalCost = materialCost + laborCost;

    return {
      ok: true,
      data: {
        totalArea,
        sheets,
        tapeRolls,
        mudGallons,
        screwsPounds,
        cornerBead,
        sheetCost,
        tapeCost,
        mudCost,
        screwCost,
        materialCost,
        laborHours,
        laborCost,
        totalCost
      }
    };
  } catch (error) {
    return { ok: false, msg: error.message };
  }
}

export function explain(state) {
  const result = compute(state);
  if (!result.ok) return "Invalid inputs";

  const { wallArea, ceilingArea, sheetSize, wastePercent, tapeCoverage, mudCoverage, screwsPerSqft } = state;
  const data = result.data;

  const sheetArea = sheetSize === '4x12' ? 48 : 32;

  return `
    <div class="math-explanation">
      <h4>Calculation Steps</h4>

      <div class="step">
        <h5>1. Total Area</h5>
        <p>Wall area: ${wallArea} sq ft</p>
        <p>Ceiling area: ${ceilingArea} sq ft</p>
        <p><strong>Total: ${wallArea} + ${ceilingArea} = ${data.totalArea} sq ft</strong></p>
      </div>

      <div class="step">
        <h5>2. Drywall Sheets</h5>
        <p>Sheet size: ${sheetSize} = ${sheetArea} sq ft per sheet</p>
        <p>Base sheets needed: ceil(${data.totalArea} ÷ ${sheetArea}) = ${Math.ceil(data.totalArea / sheetArea)}</p>
        <p>With ${wastePercent}% waste: ${Math.ceil(data.totalArea / sheetArea)} × 1.${wastePercent} = ${data.sheets} sheets</p>
      </div>

      <div class="step">
        <h5>3. Tape Requirements</h5>
        <p>Estimated seam length: ${data.totalArea} × 0.4 = ${formatNumber(data.totalArea * 0.4)} LF</p>
        <p>Tape rolls: ceil(${formatNumber(data.totalArea * 0.4)} ÷ ${tapeCoverage}) = ${data.tapeRolls} rolls</p>
      </div>

      <div class="step">
        <h5>4. Mud Requirements</h5>
        <p>Coverage: ${mudCoverage} sq ft per gallon</p>
        <p>Gallons needed: ceil(${data.totalArea} ÷ ${mudCoverage}) = ${data.mudGallons} gallons</p>
      </div>

      <div class="step">
        <h5>5. Screws</h5>
        <p>Screws per sq ft: ${screwsPerSqft}</p>
        <p>Total screws: ${data.totalArea} × ${screwsPerSqft} = ${formatNumber(data.totalArea * screwsPerSqft)}</p>
        <p>Pounds: ceil(${formatNumber(data.totalArea * screwsPerSqft)} ÷ 200) = ${data.screwsPounds} lbs</p>
      </div>
    </div>
  `;
}

export function meta() {
  return {
    id: "drywall",
    title: "Drywall Calculator",
    category: "finishing"
  };
}