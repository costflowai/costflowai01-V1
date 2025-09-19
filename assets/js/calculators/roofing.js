// Professional Roofing Calculator
// Comprehensive roofing materials calculation with industry standards

import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';
import { pricing, initPricing } from '../core/pricing.js';
import { bus, EVENTS } from '../core/bus.js';

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
              <option value="us" ${savedState.region === 'us' ? 'selected' : ''}>United States (National Average)</option>
            </select>
            <small>Regional pricing variations will be available in future updates</small>
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
        <button id="calculate-btn" class="btn-primary" disabled>Loading Pricing Data...</button>
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
  
  // Initialize pricing engine AFTER DOM is created
  initPricing('us').then(() => {
    console.log('✅ Roofing calculator: Pricing engine initialized');
    // Enable calculate button
    const calcBtn = el.querySelector('#calculate-btn');
    if (calcBtn) {
      calcBtn.disabled = false;
      calcBtn.textContent = 'Calculate Roofing Materials';
    }
  }).catch(err => {
    console.error('❌ Roofing calculator: Failed to initialize pricing:', err);
  });
  
  // Listen for pricing updates (region changes)
  bus.on(EVENTS.PRICING_UPDATED, () => {
    console.log('🔄 Roofing calculator: Pricing updated, recalculating...');
    const currentResults = document.getElementById('results-content');
    if (currentResults && currentResults.innerHTML.trim()) {
      calculateRoofing(); // Re-run calculation if there are existing results
    }
  });
  
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
  
  // Using centralized pricing engine (no need for regional pricing variable)
  
  // Cost calculations using centralized pricing with correct units
  const wastedSquares = squares * (1 + (data.shingleWaste / 100));
  const underlaymentSquares = Math.ceil(data.roofArea / 100); // Convert sq ft to squares
  const iceDamSquares = data.iceDamProtection ? Math.ceil((data.iceDamProtection * data.rakeLength) / 100) : 0;
  
  const costs = {
    shingleBundles: getShinglePrice(data.shingleType, wastedSquares),
    ridgeCap: getRidgeCapPrice(data.ridgeLength),
    underlayment: getUnderlaymentPrice(underlaymentSquares),
    iceDam: iceDamSquares > 0 ? getIceBarrierPrice(iceDamSquares) : 0,
    dripEdge: getDripEdgePrice(data.dripEdgeLength),
    valleyFlashing: 0, // Valley flashing not in pricing data, set to 0 for now
    vents: data.ventCount > 0 ? getVentPrice(data.ventCount, squares) : 0,
    ridgeVent: 0, // Ridge vent handled in main vents calculation
    nails: getNailsPrice(wastedSquares)
  };
  
  const materialCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  
  // Itemized labor cost calculations
  const laborComponents = {
    shingleInstallation: data.includeLabor ? getShingleInstallationCost(squares) : 0,
    underlaymentInstallation: data.includeLabor ? getUnderlaymentInstallationCost(data.roofArea) : 0,
    flashingInstallation: data.includeLabor ? getFlashingInstallationCost(data.ridgeLength + data.rakeLength) : 0,
    ventInstallation: data.includeLabor ? getVentInstallationCost(data.ventCount) : 0
  };
  
  const laborCost = Object.values(laborComponents).reduce((sum, cost) => sum + cost, 0);
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
    }
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

// Pricing helper functions using centralized pricing engine
function getShinglePrice(shingleType, squares) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  const keyMap = {'3tab': 'asphalt_shingles', 'architectural': 'architectural_shingles', 'luxury': 'architectural_shingles', 'cedar': 'architectural_shingles'};
  return pricing.getPrice('roofing', keyMap[shingleType] || 'asphalt_shingles', 'square') * squares;
}

function getUnderlaymentPrice(squares) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  return pricing.getPrice('roofing', 'underlayment', 'square') * squares;
}

function getRidgeCapPrice(linearFeet) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  return pricing.getPrice('roofing', 'ridge_cap', 'linear foot') * linearFeet;
}

function getDripEdgePrice(linearFeet) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  return pricing.getPrice('roofing', 'drip_edge', 'linear foot') * linearFeet;
}

function getIceBarrierPrice(squares) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  return pricing.getPrice('roofing', 'ice_barrier', 'square') * squares;
}

function getVentPrice(ventCount, shingleSquares) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  // Vents cost approximately $25 each (estimate as percentage of shingle cost per square)
  const shingleCostPerSquare = pricing.getPrice('roofing', 'asphalt_shingles', 'square');
  return (shingleCostPerSquare * 0.2) * ventCount; // ~$25 per vent
}

function getNailsPrice(squares) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback');
    return 0;
  }
  return pricing.getPrice('roofing', 'roof_nails', 'square') * squares;
}

// Itemized labor cost functions
function getShingleInstallationCost(squares) {
  const laborHours = squares * 3; // 3 hours per square for shingle installation
  const hourlyRate = 45; // Base rate per hour
  return laborHours * hourlyRate;
}

function getUnderlaymentInstallationCost(roofArea) {
  const laborHours = roofArea / 100; // 1 hour per 100 sq ft
  const hourlyRate = 35;
  return laborHours * hourlyRate;
}

function getFlashingInstallationCost(flashingLength) {
  const laborHours = flashingLength / 50; // 1 hour per 50 linear feet
  const hourlyRate = 40;
  return laborHours * hourlyRate;
}

function getVentInstallationCost(ventCount) {
  const laborHours = ventCount * 0.5; // 30 minutes per vent
  const hourlyRate = 40;
  return laborHours * hourlyRate;
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