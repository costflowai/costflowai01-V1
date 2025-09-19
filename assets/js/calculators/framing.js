// Framing Calculator - Stud Wall Framing
import { validateInput, validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  const savedState = loadState('framing') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Stud Wall Framing Calculator</h2>
        <p>Calculate lumber quantities and costs for wood framing systems</p>
      </div>

      <div class="input-section">
        <h3>Wall Dimensions</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="wall-length">Wall Length (ft)</label>
            <input type="number" id="wall-length" step="0.1" min="0" value="${savedState.wallLength || ''}" />
          </div>
          <div class="input-group">
            <label for="wall-height">Wall Height (ft)</label>
            <input type="number" id="wall-height" step="0.1" min="0" value="${savedState.wallHeight || '8'}" />
          </div>
          <div class="input-group">
            <label for="stud-spacing">Stud Spacing</label>
            <select id="stud-spacing">
              <option value="16" ${savedState.studSpacing === '16' ? 'selected' : ''}>16" O.C.</option>
              <option value="24" ${savedState.studSpacing === '24' ? 'selected' : ''}>24" O.C.</option>
            </select>
          </div>
          <div class="input-group">
            <label for="num-walls">Number of Walls</label>
            <input type="number" id="num-walls" min="1" value="${savedState.numWalls || '1'}" />
          </div>
        </div>

        <h3>Configuration</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="corner-type">Corner Type</label>
            <select id="corner-type">
              <option value="standard" ${savedState.cornerType === 'standard' ? 'selected' : ''}>Standard (1 extra)</option>
              <option value="advanced" ${savedState.cornerType === 'advanced' ? 'selected' : ''}>Advanced (2 extra)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="plate-count">Plates</label>
            <select id="plate-count">
              <option value="2" ${savedState.plateCount === '2' ? 'selected' : ''}>2 (Single Top)</option>
              <option value="3" ${savedState.plateCount === '3' ? 'selected' : ''}>3 (Double Top)</option>
            </select>
          </div>
        </div>

        <h3>Openings</h3>
        <div id="openings-container">
          <div class="opening-row">
            <input type="number" class="opening-width" placeholder="Width (ft)" step="0.1" min="0" value="${savedState.openingWidth1 || ''}" />
            <input type="number" class="opening-count" placeholder="Count" min="0" value="${savedState.openingCount1 || ''}" />
            <button type="button" class="btn-remove" onclick="removeOpening(this)">Remove</button>
          </div>
        </div>
        <button type="button" id="add-opening" class="btn-secondary">Add Opening</button>

        <h3>Pricing (Optional)</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="stud-price">Stud Price ($/ea)</label>
            <input type="number" id="stud-price" step="0.01" min="0" value="${savedState.studPrice || ''}" />
          </div>
          <div class="input-group">
            <label for="plate-price">Plate Price ($/LF)</label>
            <input type="number" id="plate-price" step="0.01" min="0" value="${savedState.platePrice || ''}" />
          </div>
          <div class="input-group">
            <label for="labor-rate">Labor Rate ($/hr)</label>
            <input type="number" id="labor-rate" step="0.01" min="0" value="${savedState.laborRate || ''}" />
          </div>
          <div class="input-group">
            <label for="productivity">Productivity (studs/hr)</label>
            <input type="number" id="productivity" step="0.1" min="0" value="${savedState.productivity || '15'}" />
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

  // Event listeners
  setupEventListeners();
}

function setupEventListeners() {
  // Input validation and auto-calculate
  const inputs = document.querySelectorAll('#wall-length, #wall-height, #stud-spacing, #num-walls, #corner-type, #plate-count');
  inputs.forEach(input => {
    input.addEventListener('input', validateAndCalculate);
  });

  // Opening management
  document.getElementById('add-opening').addEventListener('click', addOpening);

  // Buttons
  document.getElementById('calculate-btn').addEventListener('click', calculateFraming);
  document.getElementById('clear-btn').addEventListener('click', clearInputs);
  document.getElementById('show-math-btn')?.addEventListener('click', toggleMath);

  // Export buttons
  document.getElementById('export-csv')?.addEventListener('click', () => exportResults('csv'));
  document.getElementById('export-xlsx')?.addEventListener('click', () => exportResults('xlsx'));
  document.getElementById('export-pdf')?.addEventListener('click', () => exportResults('pdf'));
  document.getElementById('print-btn')?.addEventListener('click', () => window.print());

  validateAndCalculate();
}

function addOpening() {
  const container = document.getElementById('openings-container');
  const row = document.createElement('div');
  row.className = 'opening-row';
  row.innerHTML = `
    <input type="number" class="opening-width" placeholder="Width (ft)" step="0.1" min="0" />
    <input type="number" class="opening-count" placeholder="Count" min="0" />
    <button type="button" class="btn-remove" onclick="removeOpening(this)">Remove</button>
  `;
  container.appendChild(row);

  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validateAndCalculate);
  });
}

function removeOpening(btn) {
  btn.parentElement.remove();
  validateAndCalculate();
}

function validateAndCalculate() {
  const state = getCurrentState();
  const isValid = validateInputs(state);

  document.getElementById('calculate-btn').disabled = !isValid;

  if (isValid) {
    calculateFraming();
  }

  saveState('framing', state);
}

function getCurrentState() {
  const openings = [];
  document.querySelectorAll('.opening-row').forEach(row => {
    const width = parseFloat(row.querySelector('.opening-width').value) || 0;
    const count = parseInt(row.querySelector('.opening-count').value) || 0;
    if (width > 0 && count > 0) {
      openings.push({ width, count });
    }
  });

  return {
    wallLength: parseFloat(document.getElementById('wall-length').value) || 0,
    wallHeight: parseFloat(document.getElementById('wall-height').value) || 0,
    studSpacing: parseInt(document.getElementById('stud-spacing').value) || 16,
    numWalls: parseInt(document.getElementById('num-walls').value) || 1,
    cornerType: document.getElementById('corner-type').value,
    plateCount: parseInt(document.getElementById('plate-count').value) || 2,
    openings,
    studPrice: parseFloat(document.getElementById('stud-price').value) || 0,
    platePrice: parseFloat(document.getElementById('plate-price').value) || 0,
    laborRate: parseFloat(document.getElementById('labor-rate').value) || 0,
    productivity: parseFloat(document.getElementById('productivity').value) || 15
  };
}

function validateInputs(state) {
  return state.wallLength > 0 && state.wallHeight > 0 && state.numWalls > 0;
}

function calculateFraming() {
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
        <tr><th colspan="2">Stud Requirements</th></tr>
        <tr><td>Studs per Wall</td><td>${data.studsPerWall}</td></tr>
        <tr><td>Corner/Partition Studs</td><td>${data.cornerStuds}</td></tr>
        <tr><td>King/Jack Studs</td><td>${data.openingStuds}</td></tr>
        <tr><td><strong>Total Studs</strong></td><td><strong>${data.totalStuds}</strong></td></tr>

        <tr><th colspan="2">Plates</th></tr>
        <tr><td>Plate Linear Feet</td><td>${formatNumber(data.platesLF)} LF</td></tr>

        ${data.materialCost > 0 ? `
        <tr><th colspan="2">Material Costs</th></tr>
        <tr><td>Stud Cost</td><td>${formatCurrency(data.studCost)}</td></tr>
        <tr><td>Plate Cost</td><td>${formatCurrency(data.plateCost)}</td></tr>
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
        <li>Standard stud spacing: ${state.studSpacing}" O.C.</li>
        <li>Corner type: ${state.cornerType}</li>
        <li>Plate configuration: ${state.plateCount} plates</li>
        <li>King/jack studs: 2 per opening</li>
        <li>Productivity: ${state.productivity} studs/hour</li>
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

  // Reset openings to one row
  const container = document.getElementById('openings-container');
  container.innerHTML = `
    <div class="opening-row">
      <input type="number" class="opening-width" placeholder="Width (ft)" step="0.1" min="0" />
      <input type="number" class="opening-count" placeholder="Count" min="0" />
      <button type="button" class="btn-remove" onclick="removeOpening(this)">Remove</button>
    </div>
  `;

  document.getElementById('results-section').style.display = 'none';
  saveState('framing', {});
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
    ['Framing Calculator Results', ''],
    ['Wall Length', `${state.wallLength} ft`],
    ['Wall Height', `${state.wallHeight} ft`],
    ['Number of Walls', state.numWalls],
    ['Stud Spacing', `${state.studSpacing}" O.C.`],
    [''],
    ['Studs per Wall', data.studsPerWall],
    ['Corner/Partition Studs', data.cornerStuds],
    ['King/Jack Studs', data.openingStuds],
    ['Total Studs', data.totalStuds],
    ['Plate Linear Feet', `${data.platesLF} LF`],
    [''],
    ['Material Cost', formatCurrency(data.materialCost)],
    ['Labor Cost', formatCurrency(data.laborCost)],
    ['Total Cost', formatCurrency(data.totalCost)]
  ];

  switch (format) {
    case 'csv':
      exportToCsv(exportData, 'framing-calculation.csv');
      break;
    case 'xlsx':
      exportToXlsx(exportData, 'framing-calculation.xlsx');
      break;
    case 'pdf':
      exportToPdf(exportData, 'Framing Calculator Results', 'framing-calculation.pdf');
      break;
  }
}

export function compute(state) {
  try {
    const { wallLength, wallHeight, studSpacing, numWalls, cornerType, plateCount, openings, studPrice, platePrice, laborRate, productivity } = state;

    if (!wallLength || !wallHeight || !numWalls) {
      return { ok: false, msg: "Missing required inputs" };
    }

    // Calculate studs per wall run
    const studsPerWall = Math.ceil((wallLength * 12) / studSpacing) + 1;

    // Corner/partition studs
    const cornerMultiplier = cornerType === 'advanced' ? 2 : 1;
    const cornerStuds = numWalls * cornerMultiplier;

    // Opening studs (king and jack studs)
    let openingStuds = 0;
    openings.forEach(opening => {
      openingStuds += opening.count * 2; // 2 studs per opening (king + jack)
    });

    // Total studs
    const totalStuds = (studsPerWall * numWalls) + cornerStuds + openingStuds;

    // Plates calculation
    const platesLF = numWalls * plateCount * wallLength;

    // Cost calculations
    const studCost = studPrice > 0 ? totalStuds * studPrice : 0;
    const plateCost = platePrice > 0 ? platesLF * platePrice : 0;
    const materialCost = studCost + plateCost;

    const laborHours = productivity > 0 ? totalStuds / productivity : 0;
    const laborCost = laborRate > 0 && laborHours > 0 ? laborHours * laborRate : 0;

    const totalCost = materialCost + laborCost;

    return {
      ok: true,
      data: {
        studsPerWall,
        cornerStuds,
        openingStuds,
        totalStuds,
        platesLF,
        studCost,
        plateCost,
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

  const { wallLength, studSpacing, numWalls, cornerType, plateCount, openings } = state;
  const data = result.data;

  return `
    <div class="math-explanation">
      <h4>Calculation Steps</h4>

      <div class="step">
        <h5>1. Studs per Wall</h5>
        <p>Formula: ceil((length × 12) / spacing) + 1</p>
        <p>Calculation: ceil((${wallLength} × 12) / ${studSpacing}) + 1 = ceil(${wallLength * 12} / ${studSpacing}) + 1 = ceil(${(wallLength * 12) / studSpacing}) + 1 = ${data.studsPerWall}</p>
      </div>

      <div class="step">
        <h5>2. Corner/Partition Studs</h5>
        <p>Corner type: ${cornerType} (${cornerType === 'advanced' ? '2' : '1'} extra per wall)</p>
        <p>Calculation: ${numWalls} walls × ${cornerType === 'advanced' ? '2' : '1'} = ${data.cornerStuds} studs</p>
      </div>

      <div class="step">
        <h5>3. Opening Studs</h5>
        <p>King and jack studs: 2 per opening</p>
        ${openings.map(opening => `<p>${opening.count} openings × 2 studs = ${opening.count * 2} studs</p>`).join('')}
        <p>Total opening studs: ${data.openingStuds}</p>
      </div>

      <div class="step">
        <h5>4. Total Studs</h5>
        <p>Wall studs: ${data.studsPerWall} × ${numWalls} = ${data.studsPerWall * numWalls}</p>
        <p>Corner studs: ${data.cornerStuds}</p>
        <p>Opening studs: ${data.openingStuds}</p>
        <p><strong>Total: ${data.studsPerWall * numWalls} + ${data.cornerStuds} + ${data.openingStuds} = ${data.totalStuds} studs</strong></p>
      </div>

      <div class="step">
        <h5>5. Plates</h5>
        <p>Formula: walls × plates × length</p>
        <p>Calculation: ${numWalls} × ${plateCount} × ${wallLength} = ${data.platesLF} LF</p>
      </div>
    </div>
  `;
}

export function meta() {
  return {
    id: "framing",
    title: "Framing Calculator",
    category: "structural"
  };
}