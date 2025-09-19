// Professional Roofing Calculator
// Comprehensive roofing materials calculation with industry standards

import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  const savedState = loadState('roofing') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Professional Roofing Calculator</h2>
        <p>Calculate roofing materials including shingles, underlayment, flashing, and accessories</p>
      </div>

      <div class="input-section">
        <h3>Roof Dimensions</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="roof-area">Total Roof Area (sq ft)</label>
            <input type="number" id="roof-area" step="0.1" min="0" value="${savedState.roofArea || ''}" />
          </div>
          <div class="input-group">
            <label for="roof-pitch">Roof Pitch (rise/run)</label>
            <select id="roof-pitch">
              <option value="2" ${savedState.roofPitch === '2' ? 'selected' : ''}>2/12 (Low slope)</option>
              <option value="4" ${savedState.roofPitch === '4' ? 'selected' : ''}>4/12 (Standard)</option>
              <option value="6" ${savedState.roofPitch === '6' ? 'selected' : ''}>6/12 (Medium)</option>
              <option value="8" ${savedState.roofPitch === '8' ? 'selected' : ''}>8/12 (Steep)</option>
              <option value="12" ${savedState.roofPitch === '12' ? 'selected' : ''}>12/12 (Very steep)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="ridge-length">Ridge Length (ft)</label>
            <input type="number" id="ridge-length" step="0.1" min="0" value="${savedState.ridgeLength || ''}" />
          </div>
          <div class="input-group">
            <label for="rake-length">Total Rake Length (ft)</label>
            <input type="number" id="rake-length" step="0.1" min="0" value="${savedState.rakeLength || ''}" />
          </div>
        </div>

        <h3>Shingle Specifications</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="shingle-type">Shingle Type</label>
            <select id="shingle-type">
              <option value="3tab" ${savedState.shingleType === '3tab' ? 'selected' : ''}>3-Tab Asphalt (3 bundles/sq)</option>
              <option value="architectural" ${savedState.shingleType === 'architectural' ? 'selected' : ''}>Architectural (3 bundles/sq)</option>
              <option value="luxury" ${savedState.shingleType === 'luxury' ? 'selected' : ''}>Luxury/Designer (4 bundles/sq)</option>
              <option value="cedar" ${savedState.shingleType === 'cedar' ? 'selected' : ''}>Cedar Shakes (5 bundles/sq)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="bundles-per-square">Bundles per Square</label>
            <input type="number" id="bundles-per-square" step="1" min="1" max="6" value="${savedState.bundlesPerSquare || '3'}" />
          </div>
          <div class="input-group">
            <label for="shingle-waste">Shingle Waste %</label>
            <input type="number" id="shingle-waste" step="0.5" min="0" max="25" value="${savedState.shingleWaste || '10'}" />
          </div>
        </div>

        <h3>Underlayment & Protection</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="underlayment-type">Underlayment Type</label>
            <select id="underlayment-type">
              <option value="felt15" ${savedState.underlaymentType === 'felt15' ? 'selected' : ''}>15# Felt (432 sq ft/roll)</option>
              <option value="felt30" ${savedState.underlaymentType === 'felt30' ? 'selected' : ''}>30# Felt (216 sq ft/roll)</option>
              <option value="synthetic" ${savedState.underlaymentType === 'synthetic' ? 'selected' : ''}>Synthetic (1000 sq ft/roll)</option>
              <option value="ice-water" ${savedState.underlaymentType === 'ice-water' ? 'selected' : ''}>Ice & Water Shield (225 sq ft/roll)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="ice-dam-protection">Ice Dam Protection (ft)</label>
            <input type="number" id="ice-dam-protection" step="0.1" min="0" value="${savedState.iceDamProtection || '6'}" />
          </div>
          <div class="input-group">
            <label for="underlayment-waste">Underlayment Waste %</label>
            <input type="number" id="underlayment-waste" step="0.5" min="0" max="20" value="${savedState.underlaymentWaste || '5'}" />
          </div>
        </div>

        <h3>Flashing & Accessories</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="drip-edge-length">Drip Edge Length (ft)</label>
            <input type="number" id="drip-edge-length" step="0.1" min="0" value="${savedState.dripEdgeLength || ''}" />
          </div>
          <div class="input-group">
            <label for="valley-length">Valley Length (ft)</label>
            <input type="number" id="valley-length" step="0.1" min="0" value="${savedState.valleyLength || '0'}" />
          </div>
          <div class="input-group">
            <label for="vent-count">Roof Vents (count)</label>
            <input type="number" id="vent-count" min="0" value="${savedState.ventCount || '0'}" />
          </div>
          <div class="input-group">
            <label for="ridge-vent">Ridge Vent (ft)</label>
            <input type="number" id="ridge-vent" step="0.1" min="0" value="${savedState.ridgeVent || '0'}" />
          </div>
        </div>

        <h3>Regional Pricing</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="region">Region</label>
            <select id="region">
              <option value="southeast" ${savedState.region === 'southeast' ? 'selected' : ''}>Southeast US</option>
              <option value="northeast" ${savedState.region === 'northeast' ? 'selected' : ''}>Northeast US</option>
              <option value="midwest" ${savedState.region === 'midwest' ? 'selected' : ''}>Midwest US</option>
              <option value="southwest" ${savedState.region === 'southwest' ? 'selected' : ''}>Southwest US</option>
              <option value="west" ${savedState.region === 'west' ? 'selected' : ''}>West Coast</option>
            </select>
          </div>
          <div class="input-group">
            <label for="include-labor">Include Labor Costs</label>
            <select id="include-labor">
              <option value="no" ${savedState.includeLabor === 'no' ? 'selected' : ''}>Materials Only</option>
              <option value="yes" ${savedState.includeLabor === 'yes' ? 'selected' : ''}>Materials + Labor</option>
            </select>
          </div>
        </div>
      </div>

      <div class="button-section">
        <button id="calculate-btn" class="btn-primary">Calculate Roofing Materials</button>
        <button id="reset-btn" class="btn-secondary">Reset Form</button>
      </div>

      <div id="results" class="results-section" style="display: none;">
        <h3>Roofing Materials Calculation</h3>
        <div id="results-content"></div>
        
        <div class="export-section">
          <h4>Export Results</h4>
          <button id="export-csv" class="btn-secondary">Export CSV</button>
          <button id="export-xlsx" class="btn-secondary">Export Excel</button>
          <button id="export-pdf" class="btn-secondary">Export PDF</button>
        </div>
      </div>

      <div id="explanation" class="explanation-section" style="display: none;">
        <h3>Calculation Methodology</h3>
        <div id="explanation-content"></div>
      </div>
    </div>
  `;

  // Initialize calculator
  setupEventListeners();
  
  // Load saved state into form
  const inputs = el.querySelectorAll('input, select');
  inputs.forEach(input => {
    const savedValue = savedState[input.id?.replace(/-/g, '') || input.name];
    if (savedValue && input.value === '') {
      input.value = savedValue;
    }
  });
}

function setupEventListeners() {
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  calculateBtn.addEventListener('click', calculateRoofing);
  resetBtn.addEventListener('click', resetForm);
  
  // Auto-save form data
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', saveFormState);
  });
  
  // Export handlers
  document.getElementById('export-csv').addEventListener('click', () => exportResults('csv'));
  document.getElementById('export-xlsx').addEventListener('click', () => exportResults('xlsx'));
  document.getElementById('export-pdf').addEventListener('click', () => exportResults('pdf'));
  
  // Update bundles per square based on shingle type
  document.getElementById('shingle-type').addEventListener('change', function() {
    const bundlesInput = document.getElementById('bundles-per-square');
    const typeMap = {
      '3tab': 3,
      'architectural': 3,
      'luxury': 4,
      'cedar': 5
    };
    bundlesInput.value = typeMap[this.value] || 3;
  });
}

function calculateRoofing() {
  const data = collectFormData();
  const validation = validateInputs(data);
  
  if (!validation.isValid) {
    alert('Please fix the following errors:\n' + validation.errors.join('\n'));
    return;
  }
  
  const results = compute(data);
  displayResults(results);
  displayExplanation(results, data);
  
  document.getElementById('results').style.display = 'block';
  document.getElementById('explanation').style.display = 'block';
  
  // Emit calculator usage event for analytics
  document.dispatchEvent(new CustomEvent('calculator:used', {
    detail: {
      type: 'roofing',
      area: data.roofArea,
      shingleType: data.shingleType
    }
  }));
}

function collectFormData() {
  return {
    roofArea: parseFloat(document.getElementById('roof-area').value) || 0,
    roofPitch: parseFloat(document.getElementById('roof-pitch').value) || 4,
    ridgeLength: parseFloat(document.getElementById('ridge-length').value) || 0,
    rakeLength: parseFloat(document.getElementById('rake-length').value) || 0,
    shingleType: document.getElementById('shingle-type').value,
    bundlesPerSquare: parseInt(document.getElementById('bundles-per-square').value) || 3,
    shingleWaste: parseFloat(document.getElementById('shingle-waste').value) || 10,
    underlaymentType: document.getElementById('underlayment-type').value,
    iceDamProtection: parseFloat(document.getElementById('ice-dam-protection').value) || 0,
    underlaymentWaste: parseFloat(document.getElementById('underlayment-waste').value) || 5,
    dripEdgeLength: parseFloat(document.getElementById('drip-edge-length').value) || 0,
    valleyLength: parseFloat(document.getElementById('valley-length').value) || 0,
    ventCount: parseInt(document.getElementById('vent-count').value) || 0,
    ridgeVent: parseFloat(document.getElementById('ridge-vent').value) || 0,
    region: document.getElementById('region').value,
    includeLabor: document.getElementById('include-labor').value === 'yes'
  };
}

function validateInputs(data) {
  const errors = [];
  
  if (data.roofArea <= 0) errors.push('Roof area must be greater than 0');
  if (data.roofArea > 100000) errors.push('Roof area seems too large (max 100,000 sq ft)');
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function compute(data) {
  // Calculate roofing squares (1 square = 100 sq ft)
  const squares = data.roofArea / 100;
  
  // Shingle calculations
  const shingleBundlesBase = squares * data.bundlesPerSquare;
  const shingleWasteAmount = shingleBundlesBase * (data.shingleWaste / 100);
  const totalShingleBundles = Math.ceil(shingleBundlesBase + shingleWasteAmount);
  
  // Ridge cap calculations (typically 1 bundle covers 35 LF)
  const ridgeCapBundles = Math.ceil(data.ridgeLength / 35);
  
  // Underlayment calculations
  const underlaymentCoverage = getUnderlaymentCoverage(data.underlaymentType);
  const underlaymentRollsBase = data.roofArea / underlaymentCoverage;
  const underlaymentWaste = underlaymentRollsBase * (data.underlaymentWaste / 100);
  const totalUnderlaymentRolls = Math.ceil(underlaymentRollsBase + underlaymentWaste);
  
  // Ice dam protection
  const iceDamRolls = data.iceDamProtection > 0 ? Math.ceil((data.iceDamProtection * data.rakeLength) / 225) : 0;
  
  // Flashing and accessories
  const dripEdgePieces = Math.ceil(data.dripEdgeLength / 10); // 10 ft pieces
  const valleyFlashing = Math.ceil(data.valleyLength / 10); // 10 ft pieces
  
  // Fasteners - nails for shingles
  const nailsPerBundle = 20; // pounds per bundle average
  const totalNails = totalShingleBundles * nailsPerBundle;
  
  // Regional pricing
  const pricing = getRegionalPricing(data.region);
  
  // Cost calculations
  const costs = {
    shingleBundles: totalShingleBundles * pricing.shingleBundle[data.shingleType],
    ridgeCap: ridgeCapBundles * pricing.ridgeCapBundle,
    underlayment: totalUnderlaymentRolls * pricing.underlayment[data.underlaymentType],
    iceDam: iceDamRolls * pricing.iceDamShield,
    dripEdge: dripEdgePieces * pricing.dripEdge,
    valleyFlashing: valleyFlashing * pricing.valleyFlashing,
    vents: data.ventCount * pricing.roofVent,
    ridgeVent: (data.ridgeVent / 4) * pricing.ridgeVentSection, // 4 ft sections
    nails: Math.ceil(totalNails / 50) * pricing.roofingNails // 50 lb boxes
  };
  
  const materialCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const laborCost = data.includeLabor ? materialCost * pricing.laborMultiplier : 0;
  const totalCost = materialCost + laborCost;
  
  return {
    // Quantities
    squares: parseFloat(squares.toFixed(2)),
    shingleBundlesNeeded: totalShingleBundles,
    ridgeCapBundles: ridgeCapBundles,
    underlaymentRolls: totalUnderlaymentRolls,
    iceDamRolls: iceDamRolls,
    dripEdgePieces: dripEdgePieces,
    valleyFlashing: valleyFlashing,
    ventCount: data.ventCount,
    ridgeVentSections: Math.ceil(data.ridgeVent / 4),
    nailBoxes: Math.ceil(totalNails / 50),
    
    // Costs
    costs: costs,
    materialCost: materialCost,
    laborCost: laborCost,
    totalCost: totalCost,
    
    // Details
    wasteAmounts: {
      shingleWaste: shingleWasteAmount,
      underlaymentWaste: underlaymentWaste
    },
    pricing: pricing
  };
}

function getUnderlaymentCoverage(type) {
  const coverage = {
    'felt15': 432,
    'felt30': 216,
    'synthetic': 1000,
    'ice-water': 225
  };
  return coverage[type] || 432;
}

function getRegionalPricing(region) {
  const basePricing = {
    'southeast': {
      shingleBundle: { '3tab': 35, 'architectural': 45, 'luxury': 65, 'cedar': 95 },
      ridgeCapBundle: 42,
      underlayment: { 'felt15': 28, 'felt30': 35, 'synthetic': 85, 'ice-water': 65 },
      iceDamShield: 65,
      dripEdge: 12,
      valleyFlashing: 15,
      roofVent: 25,
      ridgeVentSection: 18,
      roofingNails: 45,
      laborMultiplier: 1.8
    },
    'northeast': {
      shingleBundle: { '3tab': 42, 'architectural': 52, 'luxury': 75, 'cedar': 110 },
      ridgeCapBundle: 48,
      underlayment: { 'felt15': 32, 'felt30': 42, 'synthetic': 95, 'ice-water': 75 },
      iceDamShield: 75,
      dripEdge: 14,
      valleyFlashing: 18,
      roofVent: 28,
      ridgeVentSection: 22,
      roofingNails: 52,
      laborMultiplier: 2.2
    },
    'midwest': {
      shingleBundle: { '3tab': 38, 'architectural': 48, 'luxury': 68, 'cedar': 98 },
      ridgeCapBundle: 45,
      underlayment: { 'felt15': 30, 'felt30': 38, 'synthetic': 88, 'ice-water': 68 },
      iceDamShield: 68,
      dripEdge: 13,
      valleyFlashing: 16,
      roofVent: 26,
      ridgeVentSection: 20,
      roofingNails: 48,
      laborMultiplier: 1.9
    },
    'southwest': {
      shingleBundle: { '3tab': 40, 'architectural': 50, 'luxury': 70, 'cedar': 100 },
      ridgeCapBundle: 46,
      underlayment: { 'felt15': 31, 'felt30': 39, 'synthetic': 90, 'ice-water': 70 },
      iceDamShield: 70,
      dripEdge: 13,
      valleyFlashing: 17,
      roofVent: 27,
      ridgeVentSection: 21,
      roofingNails: 50,
      laborMultiplier: 2.0
    },
    'west': {
      shingleBundle: { '3tab': 45, 'architectural': 55, 'luxury': 80, 'cedar': 115 },
      ridgeCapBundle: 52,
      underlayment: { 'felt15': 35, 'felt30': 45, 'synthetic': 100, 'ice-water': 80 },
      iceDamShield: 80,
      dripEdge: 15,
      valleyFlashing: 20,
      roofVent: 30,
      ridgeVentSection: 25,
      roofingNails: 55,
      laborMultiplier: 2.4
    }
  };
  
  // Use southeast as default if region not found
  return basePricing[region] || basePricing['southeast'];
}

function displayResults(results) {
  const content = document.getElementById('results-content');
  
  content.innerHTML = `
    <div class="results-grid">
      <div class="result-section">
        <h4>Shingle Materials</h4>
        <div class="result-item">
          <span class="label">Roof Squares:</span>
          <span class="value">${formatNumber(results.squares)} squares</span>
        </div>
        <div class="result-item">
          <span class="label">Shingle Bundles:</span>
          <span class="value">${results.shingleBundlesNeeded} bundles</span>
        </div>
        <div class="result-item">
          <span class="label">Ridge Cap Bundles:</span>
          <span class="value">${results.ridgeCapBundles} bundles</span>
        </div>
        <div class="result-item">
          <span class="label">Roofing Nails:</span>
          <span class="value">${results.nailBoxes} boxes (50 lb each)</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Underlayment & Protection</h4>
        <div class="result-item">
          <span class="label">Underlayment Rolls:</span>
          <span class="value">${results.underlaymentRolls} rolls</span>
        </div>
        ${results.iceDamRolls > 0 ? `
        <div class="result-item">
          <span class="label">Ice Dam Protection:</span>
          <span class="value">${results.iceDamRolls} rolls</span>
        </div>
        ` : ''}
      </div>

      <div class="result-section">
        <h4>Flashing & Accessories</h4>
        ${results.dripEdgePieces > 0 ? `
        <div class="result-item">
          <span class="label">Drip Edge:</span>
          <span class="value">${results.dripEdgePieces} pieces (10 ft each)</span>
        </div>
        ` : ''}
        ${results.valleyFlashing > 0 ? `
        <div class="result-item">
          <span class="label">Valley Flashing:</span>
          <span class="value">${results.valleyFlashing} pieces (10 ft each)</span>
        </div>
        ` : ''}
        ${results.ventCount > 0 ? `
        <div class="result-item">
          <span class="label">Roof Vents:</span>
          <span class="value">${results.ventCount} vents</span>
        </div>
        ` : ''}
        ${results.ridgeVentSections > 0 ? `
        <div class="result-item">
          <span class="label">Ridge Vent Sections:</span>
          <span class="value">${results.ridgeVentSections} sections (4 ft each)</span>
        </div>
        ` : ''}
      </div>

      <div class="result-section cost-summary">
        <h4>Cost Summary</h4>
        <div class="result-item">
          <span class="label">Material Cost:</span>
          <span class="value">${formatCurrency(results.materialCost)}</span>
        </div>
        ${results.laborCost > 0 ? `
        <div class="result-item">
          <span class="label">Labor Cost:</span>
          <span class="value">${formatCurrency(results.laborCost)}</span>
        </div>
        ` : ''}
        <div class="result-item total">
          <span class="label">Total Cost:</span>
          <span class="value">${formatCurrency(results.totalCost)}</span>
        </div>
      </div>
    </div>
  `;
}

export function explain(data) {
  const results = compute(data);
  
  return `
    <div class="explanation-content">
      <h4>Calculation Breakdown</h4>
      
      <h5>1. Roofing Squares</h5>
      <p>Roof Area: ${data.roofArea} sq ft ÷ 100 = ${formatNumber(results.squares)} squares</p>
      
      <h5>2. Shingle Bundles</h5>
      <p>Base Bundles: ${formatNumber(results.squares)} squares × ${data.bundlesPerSquare} bundles/square = ${formatNumber(results.squares * data.bundlesPerSquare)} bundles</p>
      <p>Waste: ${formatNumber(results.squares * data.bundlesPerSquare)} × ${data.shingleWaste}% = ${formatNumber(results.wasteAmounts.shingleWaste)} bundles</p>
      <p>Total: ${results.shingleBundlesNeeded} bundles (rounded up)</p>
      
      <h5>3. Ridge Cap</h5>
      <p>Ridge Length: ${data.ridgeLength} ft ÷ 35 ft/bundle = ${results.ridgeCapBundles} bundles (rounded up)</p>
      
      <h5>4. Underlayment</h5>
      <p>Coverage per roll: ${getUnderlaymentCoverage(data.underlaymentType)} sq ft</p>
      <p>Rolls needed: ${data.roofArea} sq ft ÷ ${getUnderlaymentCoverage(data.underlaymentType)} = ${formatNumber(data.roofArea / getUnderlaymentCoverage(data.underlaymentType))}</p>
      <p>With ${data.underlaymentWaste}% waste: ${results.underlaymentRolls} rolls (rounded up)</p>
      
      <div class="formula-note">
        <p><strong>Industry Standards Used:</strong></p>
        <ul>
          <li>1 roofing square = 100 square feet</li>
          <li>Ridge cap coverage: 35 linear feet per bundle</li>
          <li>Ice dam protection: 6 ft minimum from wall line</li>
          <li>Standard waste factors: 10% shingles, 5% underlayment</li>
          <li>Fasteners: ~20 lbs nails per bundle of shingles</li>
        </ul>
      </div>
    </div>
  `;
}

function displayExplanation(results, data) {
  const content = document.getElementById('explanation-content');
  content.innerHTML = explain(data);
}

function saveFormState() {
  const formData = collectFormData();
  saveState('roofing', formData);
}

function resetForm() {
  document.querySelectorAll('input').forEach(input => {
    input.value = '';
  });
  document.querySelectorAll('select').forEach(select => {
    select.selectedIndex = 0;
  });
  document.getElementById('results').style.display = 'none';
  document.getElementById('explanation').style.display = 'none';
  saveState('roofing', {});
}

function exportResults(format) {
  const data = collectFormData();
  const results = compute(data);
  
  const exportData = {
    'Project': 'Roofing Materials Calculation',
    'Date': new Date().toLocaleDateString(),
    'Roof Area (sq ft)': data.roofArea,
    'Roof Squares': results.squares,
    'Shingle Type': data.shingleType,
    'Shingle Bundles': results.shingleBundlesNeeded,
    'Ridge Cap Bundles': results.ridgeCapBundles,
    'Underlayment Rolls': results.underlaymentRolls,
    'Material Cost': formatCurrency(results.materialCost),
    'Total Cost': formatCurrency(results.totalCost)
  };
  
  const filename = `roofing-calculation-${new Date().toISOString().split('T')[0]}`;
  
  switch(format) {
    case 'csv':
      exportToCsv(exportData, filename);
      break;
    case 'xlsx':
      exportToXlsx(exportData, filename);
      break;
    case 'pdf':
      exportToPdf(exportData, filename, 'Roofing Materials Calculation');
      break;
  }
}

export function meta() {
  return {
    id: "roofing",
    title: "Professional Roofing Calculator",
    category: "exterior",
    description: "Calculate roofing materials including shingles, underlayment, flashing, and accessories with industry-standard formulas"
  };
}