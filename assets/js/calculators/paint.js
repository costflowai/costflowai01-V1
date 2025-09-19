// Paint & Coatings Calculator
import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  const savedState = loadState('paint') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Paint & Coatings Calculator</h2>
        <p>Calculate paint quantities for interior and exterior surfaces</p>
      </div>

      <div class="input-section">
        <h3>Surface Area</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="surface-area">Surface Area (sq ft)</label>
            <input type="number" id="surface-area" step="0.1" min="0" value="${savedState.surfaceArea || ''}" />
          </div>
          <div class="input-group">
            <label for="num-coats">Number of Coats</label>
            <input type="number" id="num-coats" min="1" max="5" value="${savedState.numCoats || '2'}" />
          </div>
        </div>

        <h3>Substrate & Coverage</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="substrate-type">Substrate Type</label>
            <select id="substrate-type">
              <option value="drywall" ${savedState.substrateType === 'drywall' ? 'selected' : ''}>Drywall (400 sq ft/gal)</option>
              <option value="wood" ${savedState.substrateType === 'wood' ? 'selected' : ''}>Wood (350 sq ft/gal)</option>
              <option value="concrete" ${savedState.substrateType === 'concrete' ? 'selected' : ''}>Concrete (300 sq ft/gal)</option>
              <option value="metal" ${savedState.substrateType === 'metal' ? 'selected' : ''}>Metal (450 sq ft/gal)</option>
              <option value="custom" ${savedState.substrateType === 'custom' ? 'selected' : ''}>Custom Coverage</option>
            </select>
          </div>
          <div class="input-group">
            <label for="coverage-sqft">Coverage (sq ft/gal)</label>
            <input type="number" id="coverage-sqft" step="1" min="0" value="${savedState.coverageSqft || '400'}" />
          </div>
          <div class="input-group">
            <label for="waste-percent">Waste % (typical 5%)</label>
            <input type="number" id="waste-percent" step="0.1" min="0" max="25" value="${savedState.wastePercent || '5'}" />
          </div>
        </div>

        <h3>Primer & Preparation</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="primer-needed">Primer Required?</label>
            <select id="primer-needed">
              <option value="yes" ${savedState.primerNeeded === 'yes' ? 'selected' : ''}>Yes</option>
              <option value="no" ${savedState.primerNeeded === 'no' ? 'selected' : ''}>No</option>
            </select>
          </div>
          <div class="input-group">
            <label for="primer-coverage">Primer Coverage (sq ft/gal)</label>
            <input type="number" id="primer-coverage" step="1" min="0" value="${savedState.primerCoverage || '350'}" />
          </div>
        </div>

        <h3>Pricing (Optional)</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="paint-price">Paint Price ($/gal)</label>
            <input type="number" id="paint-price" step="0.01" min="0" value="${savedState.paintPrice || ''}" />
          </div>
          <div class="input-group">
            <label for="primer-price">Primer Price ($/gal)</label>
            <input type="number" id="primer-price" step="0.01" min="0" value="${savedState.primerPrice || ''}" />
          </div>
          <div class="input-group">
            <label for="labor-rate">Labor Rate ($/hr)</label>
            <input type="number" id="labor-rate" step="0.01" min="0" value="${savedState.laborRate || ''}" />
          </div>
          <div class="input-group">
            <label for="productivity">Productivity (sq ft/hr)</label>
            <input type="number" id="productivity" step="0.1" min="0" value="${savedState.productivity || '150'}" />
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
  const inputs = document.querySelectorAll('#surface-area, #num-coats, #substrate-type, #coverage-sqft, #waste-percent, #primer-needed, #primer-coverage');
  inputs.forEach(input => {
    input.addEventListener('input', validateAndCalculate);
  });

  // Update coverage when substrate type changes
  document.getElementById('substrate-type').addEventListener('change', updateCoverage);

  document.getElementById('calculate-btn').addEventListener('click', calculatePaint);
  document.getElementById('clear-btn').addEventListener('click', clearInputs);
  document.getElementById('show-math-btn')?.addEventListener('click', toggleMath);

  document.getElementById('export-csv')?.addEventListener('click', () => exportResults('csv'));
  document.getElementById('export-xlsx')?.addEventListener('click', () => exportResults('xlsx'));
  document.getElementById('export-pdf')?.addEventListener('click', () => exportResults('pdf'));
  document.getElementById('print-btn')?.addEventListener('click', () => window.print());

  validateAndCalculate();
}

function updateCoverage() {
  const substrateType = document.getElementById('substrate-type').value;
  const coverageInput = document.getElementById('coverage-sqft');

  const coverageValues = {
    'drywall': 400,
    'wood': 350,
    'concrete': 300,
    'metal': 450,
    'custom': coverageInput.value || 400
  };

  if (substrateType !== 'custom') {
    coverageInput.value = coverageValues[substrateType];
  }

  validateAndCalculate();
}

function validateAndCalculate() {
  const state = getCurrentState();
  const isValid = validateInputs(state);

  document.getElementById('calculate-btn').disabled = !isValid;

  if (isValid) {
    calculatePaint();
  }

  saveState('paint', state);
}

function getCurrentState() {
  return {
    surfaceArea: parseFloat(document.getElementById('surface-area').value) || 0,
    numCoats: parseInt(document.getElementById('num-coats').value) || 2,
    substrateType: document.getElementById('substrate-type').value,
    coverageSqft: parseFloat(document.getElementById('coverage-sqft').value) || 400,
    wastePercent: parseFloat(document.getElementById('waste-percent').value) || 5,
    primerNeeded: document.getElementById('primer-needed').value === 'yes',
    primerCoverage: parseFloat(document.getElementById('primer-coverage').value) || 350,
    paintPrice: parseFloat(document.getElementById('paint-price').value) || 0,
    primerPrice: parseFloat(document.getElementById('primer-price').value) || 0,
    laborRate: parseFloat(document.getElementById('labor-rate').value) || 0,
    productivity: parseFloat(document.getElementById('productivity').value) || 150
  };
}

function validateInputs(state) {
  return state.surfaceArea > 0 && state.numCoats > 0;
}

function calculatePaint() {
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
        <tr><th colspan="2">Paint Requirements</th></tr>
        <tr><td>Surface Area</td><td>${formatNumber(state.surfaceArea)} sq ft</td></tr>
        <tr><td>Number of Coats</td><td>${state.numCoats}</td></tr>
        <tr><td>Total Coverage Needed</td><td>${formatNumber(data.totalCoverage)} sq ft</td></tr>
        <tr><td><strong>Paint Required</strong></td><td><strong>${formatNumber(data.paintGallons)} gallons</strong></td></tr>

        ${state.primerNeeded ? `
        <tr><th colspan="2">Primer Requirements</th></tr>
        <tr><td>Primer Required</td><td>${formatNumber(data.primerGallons)} gallons</td></tr>
        ` : ''}

        ${data.materialCost > 0 ? `
        <tr><th colspan="2">Material Costs</th></tr>
        <tr><td>Paint Cost</td><td>${formatCurrency(data.paintCost)}</td></tr>
        ${state.primerNeeded ? `<tr><td>Primer Cost</td><td>${formatCurrency(data.primerCost)}</td></tr>` : ''}
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
        <li>Substrate: ${state.substrateType} (${state.coverageSqft} sq ft/gal)</li>
        <li>Waste factor: ${state.wastePercent}%</li>
        <li>Primer: ${state.primerNeeded ? 'Required' : 'Not required'}</li>
        ${state.primerNeeded ? `<li>Primer coverage: ${state.primerCoverage} sq ft/gal</li>` : ''}
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

  // Reset to defaults
  document.getElementById('num-coats').value = '2';
  document.getElementById('coverage-sqft').value = '400';
  document.getElementById('waste-percent').value = '5';
  document.getElementById('primer-coverage').value = '350';
  document.getElementById('productivity').value = '150';

  document.getElementById('results-section').style.display = 'none';
  saveState('paint', {});
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
    ['Paint Calculator Results', ''],
    ['Surface Area', `${state.surfaceArea} sq ft`],
    ['Number of Coats', state.numCoats],
    ['Substrate Type', state.substrateType],
    ['Coverage', `${state.coverageSqft} sq ft/gal`],
    [''],
    ['Paint Required', `${formatNumber(data.paintGallons)} gallons`],
    ['Primer Required', state.primerNeeded ? `${formatNumber(data.primerGallons)} gallons` : 'None'],
    [''],
    ['Material Cost', formatCurrency(data.materialCost)],
    ['Labor Cost', formatCurrency(data.laborCost)],
    ['Total Cost', formatCurrency(data.totalCost)]
  ];

  switch (format) {
    case 'csv':
      exportToCsv(exportData, 'paint-calculation.csv');
      break;
    case 'xlsx':
      exportToXlsx(exportData, 'paint-calculation.xlsx');
      break;
    case 'pdf':
      exportToPdf(exportData, 'Paint Calculator Results', 'paint-calculation.pdf');
      break;
  }
}

export function compute(state) {
  try {
    const { surfaceArea, numCoats, coverageSqft, wastePercent, primerNeeded, primerCoverage, paintPrice, primerPrice, laborRate, productivity } = state;

    if (!surfaceArea || !numCoats) {
      return { ok: false, msg: "Missing required inputs" };
    }

    // Calculate total coverage needed
    const totalCoverage = surfaceArea * numCoats;

    // Calculate paint gallons with waste
    const paintGallonsBase = totalCoverage / coverageSqft;
    const paintGallons = Math.ceil(paintGallonsBase * (1 + wastePercent / 100));

    // Calculate primer gallons if needed
    let primerGallons = 0;
    if (primerNeeded) {
      const primerGallonsBase = surfaceArea / primerCoverage;
      primerGallons = Math.ceil(primerGallonsBase * (1 + wastePercent / 100));
    }

    // Cost calculations
    const paintCost = paintPrice > 0 ? paintGallons * paintPrice : 0;
    const primerCost = primerPrice > 0 && primerNeeded ? primerGallons * primerPrice : 0;
    const materialCost = paintCost + primerCost;

    // Labor calculations (include primer application if needed)
    const totalAreaToApply = primerNeeded ? surfaceArea + totalCoverage : totalCoverage;
    const laborHours = productivity > 0 ? totalAreaToApply / productivity : 0;
    const laborCost = laborRate > 0 && laborHours > 0 ? laborHours * laborRate : 0;

    const totalCost = materialCost + laborCost;

    return {
      ok: true,
      data: {
        totalCoverage,
        paintGallons,
        primerGallons,
        paintCost,
        primerCost,
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

  const { surfaceArea, numCoats, coverageSqft, wastePercent, primerNeeded, primerCoverage } = state;
  const data = result.data;

  return `
    <div class="math-explanation">
      <h4>Calculation Steps</h4>

      <div class="step">
        <h5>1. Total Coverage Needed</h5>
        <p>Surface area: ${surfaceArea} sq ft</p>
        <p>Number of coats: ${numCoats}</p>
        <p><strong>Total coverage: ${surfaceArea} × ${numCoats} = ${data.totalCoverage} sq ft</strong></p>
      </div>

      <div class="step">
        <h5>2. Paint Required</h5>
        <p>Coverage per gallon: ${coverageSqft} sq ft/gal</p>
        <p>Base gallons needed: ${data.totalCoverage} ÷ ${coverageSqft} = ${formatNumber(data.totalCoverage / coverageSqft)} gal</p>
        <p>With ${wastePercent}% waste: ${formatNumber(data.totalCoverage / coverageSqft)} × 1.${wastePercent.toString().padStart(2, '0')} = ${data.paintGallons} gallons</p>
      </div>

      ${primerNeeded ? `
      <div class="step">
        <h5>3. Primer Required</h5>
        <p>Primer coverage: ${primerCoverage} sq ft/gal</p>
        <p>Base primer needed: ${surfaceArea} ÷ ${primerCoverage} = ${formatNumber(surfaceArea / primerCoverage)} gal</p>
        <p>With ${wastePercent}% waste: ${formatNumber(surfaceArea / primerCoverage)} × 1.${wastePercent.toString().padStart(2, '0')} = ${data.primerGallons} gallons</p>
      </div>
      ` : ''}

      <div class="step">
        <h5>${primerNeeded ? '4' : '3'}. Labor Hours</h5>
        <p>Total area to apply: ${primerNeeded ? `${surfaceArea} (primer) + ${data.totalCoverage} (paint) = ${surfaceArea + data.totalCoverage}` : data.totalCoverage} sq ft</p>
        <p>Productivity: ${state.productivity} sq ft/hr</p>
        <p>Labor hours: ${formatNumber(surfaceArea + data.totalCoverage)} ÷ ${state.productivity} = ${formatNumber(data.laborHours)} hours</p>
      </div>
    </div>
  `;
}

export function meta() {
  return {
    id: "paint",
    title: "Paint Calculator",
    category: "finishing"
  };
}