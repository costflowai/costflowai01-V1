// Professional Flooring Calculator
// Comprehensive flooring materials calculation with waste factors and installation requirements

import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  const savedState = loadState('flooring') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Professional Flooring Calculator</h2>
        <p>Calculate flooring materials for tile, hardwood, carpet, vinyl, and other floor finishes with waste factors and installation requirements</p>
      </div>

      <div class="input-section">
        <h3>Room Specifications</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="room-length">Room Length (ft)</label>
            <input type="number" id="room-length" step="0.1" min="0" value="${savedState.roomLength || ''}" />
          </div>
          <div class="input-group">
            <label for="room-width">Room Width (ft)</label>
            <input type="number" id="room-width" step="0.1" min="0" value="${savedState.roomWidth || ''}" />
          </div>
          <div class="input-group">
            <label for="total-area">Total Area (sq ft)</label>
            <input type="number" id="total-area" step="0.1" min="0" value="${savedState.totalArea || ''}" readonly />
            <small>Auto-calculated from length × width</small>
          </div>
          <div class="input-group">
            <label for="room-shape">Room Shape</label>
            <select id="room-shape">
              <option value="rectangle" ${savedState.roomShape === 'rectangle' ? 'selected' : ''}>Rectangle</option>
              <option value="l-shape" ${savedState.roomShape === 'l-shape' ? 'selected' : ''}>L-Shape</option>
              <option value="irregular" ${savedState.roomShape === 'irregular' ? 'selected' : ''}>Irregular</option>
            </select>
          </div>
        </div>

        <h3>Flooring Type & Material</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="flooring-type">Flooring Type</label>
            <select id="flooring-type">
              <option value="tile" ${savedState.flooringType === 'tile' ? 'selected' : ''}>Ceramic/Porcelain Tile</option>
              <option value="hardwood" ${savedState.flooringType === 'hardwood' ? 'selected' : ''}>Hardwood</option>
              <option value="laminate" ${savedState.flooringType === 'laminate' ? 'selected' : ''}>Laminate</option>
              <option value="vinyl" ${savedState.flooringType === 'vinyl' ? 'selected' : ''}>Vinyl/LVP</option>
              <option value="carpet" ${savedState.flooringType === 'carpet' ? 'selected' : ''}>Carpet</option>
              <option value="bamboo" ${savedState.flooringType === 'bamboo' ? 'selected' : ''}>Bamboo</option>
              <option value="stone" ${savedState.flooringType === 'stone' ? 'selected' : ''}>Natural Stone</option>
            </select>
          </div>
          <div class="input-group">
            <label for="material-grade">Material Grade</label>
            <select id="material-grade">
              <option value="economy" ${savedState.materialGrade === 'economy' ? 'selected' : ''}>Economy</option>
              <option value="standard" ${savedState.materialGrade === 'standard' ? 'selected' : ''}>Standard</option>
              <option value="premium" ${savedState.materialGrade === 'premium' ? 'selected' : ''}>Premium</option>
              <option value="luxury" ${savedState.materialGrade === 'luxury' ? 'selected' : ''}>Luxury</option>
            </select>
          </div>
          <div class="input-group">
            <label for="material-size">Material Size/Format</label>
            <select id="material-size">
              <option value="12x12" ${savedState.materialSize === '12x12' ? 'selected' : ''}>12" × 12"</option>
              <option value="18x18" ${savedState.materialSize === '18x18' ? 'selected' : ''}>18" × 18"</option>
              <option value="24x24" ${savedState.materialSize === '24x24' ? 'selected' : ''}>24" × 24"</option>
              <option value="6x36" ${savedState.materialSize === '6x36' ? 'selected' : ''}>6" × 36" (plank)</option>
              <option value="8x48" ${savedState.materialSize === '8x48' ? 'selected' : ''}>8" × 48" (plank)</option>
              <option value="roll" ${savedState.materialSize === 'roll' ? 'selected' : ''}>Roll goods</option>
            </select>
          </div>
          <div class="input-group">
            <label for="pattern-layout">Pattern/Layout</label>
            <select id="pattern-layout">
              <option value="straight" ${savedState.patternLayout === 'straight' ? 'selected' : ''}>Straight</option>
              <option value="diagonal" ${savedState.patternLayout === 'diagonal' ? 'selected' : ''}>Diagonal</option>
              <option value="herringbone" ${savedState.patternLayout === 'herringbone' ? 'selected' : ''}>Herringbone</option>
              <option value="brick" ${savedState.patternLayout === 'brick' ? 'selected' : ''}>Brick/Running</option>
              <option value="basket-weave" ${savedState.patternLayout === 'basket-weave' ? 'selected' : ''}>Basket Weave</option>
            </select>
          </div>
        </div>

        <h3>Installation Requirements</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="subfloor-prep">Subfloor Preparation</label>
            <select id="subfloor-prep">
              <option value="none" ${savedState.subfloorPrep === 'none' ? 'selected' : ''}>None Required</option>
              <option value="clean" ${savedState.subfloorPrep === 'clean' ? 'selected' : ''}>Clean & Level</option>
              <option value="underlayment" ${savedState.subfloorPrep === 'underlayment' ? 'selected' : ''}>Underlayment Required</option>
              <option value="self-leveling" ${savedState.subfloorPrep === 'self-leveling' ? 'selected' : ''}>Self-Leveling Compound</option>
            </select>
          </div>
          <div class="input-group">
            <label for="adhesive-type">Adhesive/Installation</label>
            <select id="adhesive-type">
              <option value="none" ${savedState.adhesiveType === 'none' ? 'selected' : ''}>Floating/Click-Lock</option>
              <option value="glue-down" ${savedState.adhesiveType === 'glue-down' ? 'selected' : ''}>Glue Down</option>
              <option value="nail-down" ${savedState.adhesiveType === 'nail-down' ? 'selected' : ''}>Nail Down</option>
              <option value="mortar" ${savedState.adhesiveType === 'mortar' ? 'selected' : ''}>Thinset Mortar</option>
              <option value="mastic" ${savedState.adhesiveType === 'mastic' ? 'selected' : ''}>Tile Mastic</option>
            </select>
          </div>
          <div class="input-group">
            <label for="transition-strips">Transition Strips (ft)</label>
            <input type="number" id="transition-strips" step="0.1" min="0" value="${savedState.transitionStrips || '0'}" />
          </div>
          <div class="input-group">
            <label for="baseboards">Baseboards (ft)</label>
            <input type="number" id="baseboards" step="0.1" min="0" value="${savedState.baseboards || ''}" />
          </div>
        </div>

        <h3>Waste & Coverage Factors</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="waste-factor">Waste Factor (%)</label>
            <input type="number" id="waste-factor" step="0.5" min="0" max="25" value="${savedState.wasteFactor || ''}" />
            <small>Auto-populated based on pattern and complexity</small>
          </div>
          <div class="input-group">
            <label for="overage-extra">Extra Overage (%)</label>
            <input type="number" id="overage-extra" step="0.5" min="0" max="15" value="${savedState.overageExtra || '5'}" />
            <small>Additional material for future repairs</small>
          </div>
          <div class="input-group">
            <label for="complex-cuts">Complex Cuts/Obstacles</label>
            <select id="complex-cuts">
              <option value="none" ${savedState.complexCuts === 'none' ? 'selected' : ''}>None</option>
              <option value="few" ${savedState.complexCuts === 'few' ? 'selected' : ''}>Few (toilet, vanity)</option>
              <option value="many" ${savedState.complexCuts === 'many' ? 'selected' : ''}>Many (cabinets, islands)</option>
              <option value="extensive" ${savedState.complexCuts === 'extensive' ? 'selected' : ''}>Extensive (complex layout)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="grout-joint">Grout Joint Width</label>
            <select id="grout-joint">
              <option value="1/16" ${savedState.groutJoint === '1/16' ? 'selected' : ''}>1/16" (tight joint)</option>
              <option value="1/8" ${savedState.groutJoint === '1/8' ? 'selected' : ''}>1/8" (standard)</option>
              <option value="1/4" ${savedState.groutJoint === '1/4' ? 'selected' : ''}>1/4" (wide joint)</option>
              <option value="3/8" ${savedState.groutJoint === '3/8' ? 'selected' : ''}>3/8" (stone)</option>
            </select>
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
        <button id="calculate-btn" class="btn-primary">Calculate Flooring Materials</button>
        <button id="reset-btn" class="btn-secondary">Reset Form</button>
      </div>

      <div id="results" class="results-section" style="display: none;">
        <h3>Flooring Materials Calculation</h3>
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
  
  // Auto-populate waste factors and material options
  updateMaterialOptions();
  calculateTotalArea();
}

function setupEventListeners() {
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  calculateBtn.addEventListener('click', calculateFlooring);
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
  
  // Update material options when flooring type changes
  document.getElementById('flooring-type').addEventListener('change', updateMaterialOptions);
  document.getElementById('pattern-layout').addEventListener('change', updateWasteFactors);
  document.getElementById('complex-cuts').addEventListener('change', updateWasteFactors);
  
  // Calculate area when dimensions change
  document.getElementById('room-length').addEventListener('input', calculateTotalArea);
  document.getElementById('room-width').addEventListener('input', calculateTotalArea);
  
  // Auto-calculate perimeter for baseboards
  document.getElementById('room-length').addEventListener('input', calculatePerimeter);
  document.getElementById('room-width').addEventListener('input', calculatePerimeter);
}

function updateMaterialOptions() {
  const flooringType = document.getElementById('flooring-type').value;
  const materialSize = document.getElementById('material-size');
  const adhesiveType = document.getElementById('adhesive-type');
  
  // Update material size options based on flooring type
  const sizeOptions = {
    'tile': ['12x12', '18x18', '24x24', '6x36', '8x48'],
    'hardwood': ['3x36', '5x36', '6x48', '7x48'],
    'laminate': ['6x36', '8x48', '12x48'],
    'vinyl': ['6x36', '8x48', '12x24', 'roll'],
    'carpet': ['roll'],
    'bamboo': ['3x36', '5x36'],
    'stone': ['12x12', '18x18', '24x24']
  };
  
  // Update adhesive options based on flooring type
  const adhesiveOptions = {
    'tile': ['mortar', 'mastic'],
    'hardwood': ['nail-down', 'glue-down', 'none'],
    'laminate': ['none'],
    'vinyl': ['glue-down', 'none'],
    'carpet': ['none'],
    'bamboo': ['nail-down', 'glue-down', 'none'],
    'stone': ['mortar']
  };
  
  // Clear and populate material size options
  materialSize.innerHTML = '';
  const sizes = sizeOptions[flooringType] || sizeOptions['tile'];
  sizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size === 'roll' ? 'Roll goods' : 
                       size.includes('x') ? size.replace('x', '" × ') + '"' : size;
    materialSize.appendChild(option);
  });
  
  // Clear and populate adhesive options
  adhesiveType.innerHTML = '';
  const adhesives = adhesiveOptions[flooringType] || adhesiveOptions['tile'];
  const adhesiveLabels = {
    'none': 'Floating/Click-Lock',
    'glue-down': 'Glue Down',
    'nail-down': 'Nail Down',
    'mortar': 'Thinset Mortar',
    'mastic': 'Tile Mastic'
  };
  
  adhesives.forEach(adhesive => {
    const option = document.createElement('option');
    option.value = adhesive;
    option.textContent = adhesiveLabels[adhesive];
    adhesiveType.appendChild(option);
  });
  
  // Update waste factors
  updateWasteFactors();
}

function updateWasteFactors() {
  const flooringType = document.getElementById('flooring-type').value;
  const patternLayout = document.getElementById('pattern-layout').value;
  const complexCuts = document.getElementById('complex-cuts').value;
  const wasteFactorInput = document.getElementById('waste-factor');
  
  // Base waste factors by flooring type and pattern
  const baseWasteFactors = {
    'tile': { 'straight': 8, 'diagonal': 15, 'herringbone': 18, 'brick': 10, 'basket-weave': 15 },
    'hardwood': { 'straight': 7, 'diagonal': 12, 'herringbone': 15, 'brick': 8 },
    'laminate': { 'straight': 6, 'diagonal': 10, 'herringbone': 12, 'brick': 7 },
    'vinyl': { 'straight': 5, 'diagonal': 8, 'herringbone': 10, 'brick': 6 },
    'carpet': { 'straight': 3, 'diagonal': 5 },
    'bamboo': { 'straight': 7, 'diagonal': 12, 'herringbone': 15, 'brick': 8 },
    'stone': { 'straight': 10, 'diagonal': 18, 'herringbone': 20, 'brick': 12 }
  };
  
  const baseWaste = baseWasteFactors[flooringType]?.[patternLayout] || 
                   baseWasteFactors[flooringType]?.['straight'] || 8;
  
  // Complexity adjustment
  const complexityAdjustments = {
    'none': 0,
    'few': 2,
    'many': 4,
    'extensive': 7
  };
  
  const totalWaste = baseWaste + (complexityAdjustments[complexCuts] || 0);
  wasteFactorInput.value = totalWaste;
}

function calculateTotalArea() {
  const length = parseFloat(document.getElementById('room-length').value) || 0;
  const width = parseFloat(document.getElementById('room-width').value) || 0;
  const totalArea = length * width;
  
  document.getElementById('total-area').value = totalArea > 0 ? totalArea.toFixed(1) : '';
}

function calculatePerimeter() {
  const length = parseFloat(document.getElementById('room-length').value) || 0;
  const width = parseFloat(document.getElementById('room-width').value) || 0;
  const perimeter = 2 * (length + width);
  
  const baseboardsInput = document.getElementById('baseboards');
  if (!baseboardsInput.value && perimeter > 0) {
    baseboardsInput.value = perimeter.toFixed(1);
  }
}

function calculateFlooring() {
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
      type: 'flooring',
      flooringType: data.flooringType,
      area: data.totalArea
    }
  }));
}

function collectFormData() {
  return {
    roomLength: parseFloat(document.getElementById('room-length').value) || 0,
    roomWidth: parseFloat(document.getElementById('room-width').value) || 0,
    totalArea: parseFloat(document.getElementById('total-area').value) || 0,
    roomShape: document.getElementById('room-shape').value,
    flooringType: document.getElementById('flooring-type').value,
    materialGrade: document.getElementById('material-grade').value,
    materialSize: document.getElementById('material-size').value,
    patternLayout: document.getElementById('pattern-layout').value,
    subfloorPrep: document.getElementById('subfloor-prep').value,
    adhesiveType: document.getElementById('adhesive-type').value,
    transitionStrips: parseFloat(document.getElementById('transition-strips').value) || 0,
    baseboards: parseFloat(document.getElementById('baseboards').value) || 0,
    wasteFactor: parseFloat(document.getElementById('waste-factor').value) || 10,
    overageExtra: parseFloat(document.getElementById('overage-extra').value) || 5,
    complexCuts: document.getElementById('complex-cuts').value,
    groutJoint: document.getElementById('grout-joint').value,
    region: document.getElementById('region').value,
    includeLabor: document.getElementById('include-labor').value === 'yes'
  };
}

function validateInputs(data) {
  const errors = [];
  
  if (data.totalArea <= 0) errors.push('Room area must be greater than 0');
  if (data.totalArea > 50000) errors.push('Room area seems too large (max 50,000 sq ft)');
  if (data.wasteFactor < 0 || data.wasteFactor > 50) errors.push('Waste factor must be between 0-50%');
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function compute(data) {
  // Calculate material quantities with waste
  const baseArea = data.totalArea;
  const wasteMultiplier = (100 + data.wasteFactor + data.overageExtra) / 100;
  const totalMaterialNeeded = baseArea * wasteMultiplier;
  
  // Convert to appropriate units based on material
  const materialQuantities = calculateMaterialQuantities(totalMaterialNeeded, data);
  
  // Calculate adhesive/installation materials
  const adhesiveQuantities = calculateAdhesiveQuantities(data);
  
  // Calculate accessories (transition strips, baseboards, etc.)
  const accessoryQuantities = calculateAccessoryQuantities(data);
  
  // Calculate grout (for tile only)
  const groutQuantities = data.flooringType === 'tile' || data.flooringType === 'stone' ? 
    calculateGroutQuantities(data) : { bags: 0, coverage: 0 };
  
  // Regional pricing
  const pricing = getRegionalPricing(data.region);
  
  // Cost calculations
  const costs = {
    materials: calculateMaterialCost(materialQuantities, data, pricing),
    adhesive: calculateAdhesiveCost(adhesiveQuantities, data, pricing),
    grout: groutQuantities.bags * pricing.grout[data.groutJoint],
    accessories: calculateAccessoryCost(accessoryQuantities, pricing),
    subfloorPrep: calculateSubfloorCost(data, pricing),
    underlayment: data.subfloorPrep === 'underlayment' ? baseArea * pricing.underlayment : 0
  };
  
  const materialCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const laborCost = data.includeLabor ? materialCost * pricing.laborMultiplier[data.flooringType] : 0;
  const totalCost = materialCost + laborCost;
  
  return {
    // Area calculations
    baseArea: baseArea,
    totalMaterialNeeded: totalMaterialNeeded,
    wasteAmount: totalMaterialNeeded - baseArea,
    wastePercentage: ((totalMaterialNeeded - baseArea) / baseArea * 100),
    
    // Material quantities
    materialQuantities: materialQuantities,
    adhesiveQuantities: adhesiveQuantities,
    groutQuantities: groutQuantities,
    accessoryQuantities: accessoryQuantities,
    
    // Cost breakdown
    costs: costs,
    materialCost: materialCost,
    laborCost: laborCost,
    totalCost: totalCost,
    costPerSqFt: totalCost / baseArea,
    
    pricing: pricing
  };
}

function calculateMaterialQuantities(totalArea, data) {
  const materialSizes = {
    '12x12': 1, // 1 sq ft per tile
    '18x18': 2.25, // 2.25 sq ft per tile
    '24x24': 4, // 4 sq ft per tile
    '6x36': 1.5, // 1.5 sq ft per plank
    '8x48': 2.67, // 2.67 sq ft per plank
    '3x36': 0.75,
    '5x36': 1.25,
    '7x48': 2.33,
    '12x48': 4,
    'roll': totalArea // Roll goods sold by area
  };
  
  const sizeInSqFt = materialSizes[data.materialSize] || 1;
  
  let pieces = 0;
  let area = totalArea;
  let boxes = 0;
  
  if (data.materialSize === 'roll') {
    // Roll goods (carpet, sheet vinyl)
    const rollWidth = data.flooringType === 'carpet' ? 12 : 6; // feet
    const rollLength = Math.ceil(Math.max(data.roomLength, data.roomWidth) / rollWidth) * rollWidth;
    pieces = Math.ceil(totalArea / (rollWidth * rollLength));
    area = pieces * rollWidth * rollLength;
  } else {
    // Individual pieces (tile, plank)
    pieces = Math.ceil(totalArea / sizeInSqFt);
    
    // Convert to boxes if applicable
    const pcsPerBox = getPiecesPerBox(data.flooringType, data.materialSize);
    boxes = Math.ceil(pieces / pcsPerBox);
    area = boxes * pcsPerBox * sizeInSqFt;
  }
  
  return {
    area: parseFloat(area.toFixed(1)),
    pieces: pieces,
    boxes: boxes,
    piecesPerBox: getPiecesPerBox(data.flooringType, data.materialSize)
  };
}

function getPiecesPerBox(flooringType, materialSize) {
  const boxCounts = {
    'tile': { '12x12': 12, '18x18': 6, '24x24': 4, '6x36': 8, '8x48': 6 },
    'hardwood': { '3x36': 20, '5x36': 12, '6x48': 8, '7x48': 6 },
    'laminate': { '6x36': 18, '8x48': 10, '12x48': 8 },
    'vinyl': { '6x36': 20, '8x48': 12, '12x24': 15 },
    'bamboo': { '3x36': 20, '5x36': 12 },
    'stone': { '12x12': 10, '18x18': 5, '24x24': 3 }
  };
  
  return boxCounts[flooringType]?.[materialSize] || 10;
}

function calculateAdhesiveQuantities(data) {
  if (data.adhesiveType === 'none') return { amount: 0, unit: 'none' };
  
  const coverageRates = {
    'glue-down': 200, // sq ft per gallon
    'nail-down': 0, // No adhesive
    'mortar': 50, // sq ft per 50lb bag
    'mastic': 150 // sq ft per gallon
  };
  
  const coverage = coverageRates[data.adhesiveType] || 100;
  const amount = data.adhesiveType === 'mortar' ? 
    Math.ceil(data.totalArea / coverage) : // Bags for mortar
    Math.ceil(data.totalArea / coverage); // Gallons for adhesive
  
  const unit = data.adhesiveType === 'mortar' ? 'bags' : 'gallons';
  
  return { amount, unit, coverage };
}

function calculateGroutQuantities(data) {
  if (!['tile', 'stone'].includes(data.flooringType)) return { bags: 0, coverage: 0 };
  
  // Grout coverage based on tile size and joint width
  const coverageRates = {
    '1/16': { '12x12': 400, '18x18': 600, '24x24': 800 },
    '1/8': { '12x12': 200, '18x18': 300, '24x24': 400 },
    '1/4': { '12x12': 100, '18x18': 150, '24x24': 200 },
    '3/8': { '12x12': 70, '18x18': 100, '24x24': 130 }
  };
  
  const coverage = coverageRates[data.groutJoint]?.[data.materialSize] || 200;
  const bags = Math.ceil(data.totalArea / coverage);
  
  return { bags, coverage };
}

function calculateAccessoryQuantities(data) {
  return {
    transitionStrips: Math.ceil(data.transitionStrips),
    baseboards: Math.ceil(data.baseboards),
    quarterRound: data.baseboards > 0 ? Math.ceil(data.baseboards) : 0, // Match baseboard length
    doorThresholds: Math.max(1, Math.ceil(data.transitionStrips / 3)) // Estimate based on transitions
  };
}

function calculateMaterialCost(quantities, data, pricing) {
  const materialPricing = pricing.materials[data.flooringType][data.materialGrade];
  return quantities.area * materialPricing;
}

function calculateAdhesiveCost(adhesive, data, pricing) {
  if (adhesive.amount === 0) return 0;
  
  const adhesivePricing = pricing.adhesives[data.adhesiveType] || 0;
  return adhesive.amount * adhesivePricing;
}

function calculateAccessoryCost(accessories, pricing) {
  return (
    accessories.transitionStrips * pricing.transitionStrips +
    accessories.baseboards * pricing.baseboard +
    accessories.quarterRound * pricing.quarterRound +
    accessories.doorThresholds * pricing.doorThreshold
  );
}

function calculateSubfloorCost(data, pricing) {
  if (data.subfloorPrep === 'none' || data.subfloorPrep === 'clean') return 0;
  
  const subfloorCosts = {
    'self-leveling': data.totalArea * pricing.selfLeveling,
    'underlayment': data.totalArea * pricing.underlayment
  };
  
  return subfloorCosts[data.subfloorPrep] || 0;
}

function getRegionalPricing(region) {
  const basePricing = {
    'southeast': {
      materials: {
        tile: { economy: 2.50, standard: 4.50, premium: 8.50, luxury: 15.00 },
        hardwood: { economy: 4.50, standard: 7.50, premium: 12.50, luxury: 22.00 },
        laminate: { economy: 1.50, standard: 3.50, premium: 6.50, luxury: 9.50 },
        vinyl: { economy: 2.00, standard: 4.50, premium: 8.00, luxury: 14.00 },
        carpet: { economy: 1.50, standard: 3.50, premium: 7.50, luxury: 15.00 },
        bamboo: { economy: 3.50, standard: 6.50, premium: 10.50, luxury: 16.00 },
        stone: { economy: 5.50, standard: 9.50, premium: 18.50, luxury: 35.00 }
      },
      adhesives: {
        'glue-down': 45, // per gallon
        'mortar': 25, // per 50lb bag
        'mastic': 35 // per gallon
      },
      grout: {
        '1/16': 18, '1/8': 18, '1/4': 22, '3/8': 22
      },
      transitionStrips: 15,
      baseboard: 3.50,
      quarterRound: 2.25,
      doorThreshold: 25,
      selfLeveling: 2.80,
      underlayment: 1.25,
      laborMultiplier: {
        tile: 2.8, hardwood: 3.2, laminate: 1.8, vinyl: 2.0,
        carpet: 1.5, bamboo: 3.0, stone: 3.5
      }
    },
    'northeast': {
      materials: {
        tile: { economy: 3.00, standard: 5.50, premium: 10.00, luxury: 18.00 },
        hardwood: { economy: 5.50, standard: 9.00, premium: 15.00, luxury: 26.00 },
        laminate: { economy: 1.80, standard: 4.20, premium: 7.80, luxury: 11.50 },
        vinyl: { economy: 2.40, standard: 5.40, premium: 9.60, luxury: 16.80 },
        carpet: { economy: 1.80, standard: 4.20, premium: 9.00, luxury: 18.00 },
        bamboo: { economy: 4.20, standard: 7.80, premium: 12.60, luxury: 19.20 },
        stone: { economy: 6.60, standard: 11.40, premium: 22.20, luxury: 42.00 }
      },
      adhesives: {
        'glue-down': 55, 'mortar': 30, 'mastic': 42
      },
      grout: {
        '1/16': 22, '1/8': 22, '1/4': 26, '3/8': 26
      },
      transitionStrips: 18,
      baseboard: 4.20,
      quarterRound: 2.70,
      doorThreshold: 30,
      selfLeveling: 3.40,
      underlayment: 1.50,
      laborMultiplier: {
        tile: 3.5, hardwood: 4.0, laminate: 2.2, vinyl: 2.5,
        carpet: 1.8, bamboo: 3.8, stone: 4.2
      }
    }
  };
  
  return basePricing[region] || basePricing['southeast'];
}

function displayResults(results) {
  const content = document.getElementById('results-content');
  
  content.innerHTML = `
    <div class="results-grid">
      <div class="result-section">
        <h4>Area & Material Calculations</h4>
        <div class="result-item">
          <span class="label">Base Area:</span>
          <span class="value">${formatNumber(results.baseArea, 1)} sq ft</span>
        </div>
        <div class="result-item">
          <span class="label">Total Material Needed:</span>
          <span class="value">${formatNumber(results.totalMaterialNeeded, 1)} sq ft</span>
        </div>
        <div class="result-item">
          <span class="label">Waste Amount:</span>
          <span class="value">${formatNumber(results.wasteAmount, 1)} sq ft (${formatNumber(results.wastePercentage, 1)}%)</span>
        </div>
        <div class="result-item">
          <span class="label">Material Coverage:</span>
          <span class="value">${formatNumber(results.materialQuantities.area, 1)} sq ft</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Material Quantities</h4>
        ${results.materialQuantities.boxes > 0 ? `
        <div class="result-item">
          <span class="label">Boxes Needed:</span>
          <span class="value">${results.materialQuantities.boxes} boxes</span>
        </div>
        <div class="result-item">
          <span class="label">Pieces per Box:</span>
          <span class="value">${results.materialQuantities.piecesPerBox}</span>
        </div>
        ` : ''}
        <div class="result-item">
          <span class="label">Total Pieces:</span>
          <span class="value">${formatNumber(results.materialQuantities.pieces)}</span>
        </div>
        ${results.adhesiveQuantities.amount > 0 ? `
        <div class="result-item">
          <span class="label">Adhesive:</span>
          <span class="value">${results.adhesiveQuantities.amount} ${results.adhesiveQuantities.unit}</span>
        </div>
        ` : ''}
      </div>

      ${results.groutQuantities.bags > 0 ? `
      <div class="result-section">
        <h4>Grout & Accessories</h4>
        <div class="result-item">
          <span class="label">Grout:</span>
          <span class="value">${results.groutQuantities.bags} bags</span>
        </div>
        ${results.accessoryQuantities.transitionStrips > 0 ? `
        <div class="result-item">
          <span class="label">Transition Strips:</span>
          <span class="value">${results.accessoryQuantities.transitionStrips} pieces</span>
        </div>
        ` : ''}
        ${results.accessoryQuantities.baseboards > 0 ? `
        <div class="result-item">
          <span class="label">Baseboards:</span>
          <span class="value">${results.accessoryQuantities.baseboards} linear ft</span>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="result-section cost-summary">
        <h4>Cost Summary</h4>
        <div class="result-item">
          <span class="label">Material Cost:</span>
          <span class="value">${formatCurrency(results.costs.materials)}</span>
        </div>
        ${results.costs.adhesive > 0 ? `
        <div class="result-item">
          <span class="label">Adhesive Cost:</span>
          <span class="value">${formatCurrency(results.costs.adhesive)}</span>
        </div>
        ` : ''}
        ${results.costs.grout > 0 ? `
        <div class="result-item">
          <span class="label">Grout Cost:</span>
          <span class="value">${formatCurrency(results.costs.grout)}</span>
        </div>
        ` : ''}
        <div class="result-item">
          <span class="label">Total Material Cost:</span>
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
        <div class="result-item">
          <span class="label">Cost per Sq Ft:</span>
          <span class="value">${formatCurrency(results.costPerSqFt)}</span>
        </div>
      </div>
    </div>
  `;
}

export function explain(data) {
  const results = compute(data);
  
  return `
    <div class="explanation-content">
      <h4>Flooring Calculation Methodology</h4>
      
      <h5>1. Base Area Calculation</h5>
      <p>Room Dimensions: ${data.roomLength} ft × ${data.roomWidth} ft = ${formatNumber(results.baseArea, 1)} sq ft</p>
      
      <h5>2. Waste Factor Application</h5>
      <p>Base waste for ${data.flooringType} with ${data.patternLayout} pattern: ${data.wasteFactor}%</p>
      <p>Additional overage: ${data.overageExtra}%</p>
      <p>Total multiplier: ${formatNumber((100 + data.wasteFactor + data.overageExtra) / 100, 3)}</p>
      <p>Material needed: ${formatNumber(results.baseArea, 1)} sq ft × ${formatNumber((100 + data.wasteFactor + data.overageExtra) / 100, 3)} = ${formatNumber(results.totalMaterialNeeded, 1)} sq ft</p>
      
      <h5>3. Material Conversion</h5>
      <p>Material size: ${data.materialSize}</p>
      <p>Pieces needed: ${results.materialQuantities.pieces}</p>
      ${results.materialQuantities.boxes > 0 ? `
      <p>Pieces per box: ${results.materialQuantities.piecesPerBox}</p>
      <p>Boxes required: ${results.materialQuantities.boxes} boxes</p>
      ` : ''}
      
      ${results.adhesiveQuantities.amount > 0 ? `
      <h5>4. Adhesive Calculations</h5>
      <p>Adhesive type: ${data.adhesiveType}</p>
      <p>Coverage rate: ${results.adhesiveQuantities.coverage} sq ft per ${results.adhesiveQuantities.unit.slice(0, -1)}</p>
      <p>Amount needed: ${results.adhesiveQuantities.amount} ${results.adhesiveQuantities.unit}</p>
      ` : ''}
      
      ${results.groutQuantities.bags > 0 ? `
      <h5>5. Grout Calculations</h5>
      <p>Joint width: ${data.groutJoint}"</p>
      <p>Coverage: ${results.groutQuantities.coverage} sq ft per bag</p>
      <p>Bags needed: ${results.groutQuantities.bags} bags</p>
      ` : ''}
      
      <div class="formula-note">
        <p><strong>Industry Standards Used:</strong></p>
        <ul>
          <li>Waste factors based on pattern complexity and cutting requirements</li>
          <li>Standard box/piece counts for different material types</li>
          <li>Adhesive coverage rates per manufacturer specifications</li>
          <li>Grout coverage based on tile size and joint width</li>
          <li>5% minimum overage recommended for future repairs</li>
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
  saveState('flooring', formData);
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
  saveState('flooring', {});
  updateMaterialOptions(); // Reset material options
}

function exportResults(format) {
  const data = collectFormData();
  const results = compute(data);
  
  const exportData = {
    'Project': 'Flooring Materials Calculation',
    'Date': new Date().toLocaleDateString(),
    'Flooring Type': data.flooringType,
    'Room Area (sq ft)': data.totalArea,
    'Pattern': data.patternLayout,
    'Material Grade': data.materialGrade,
    'Total Material Needed (sq ft)': formatNumber(results.totalMaterialNeeded, 1),
    'Boxes Required': results.materialQuantities.boxes || 'N/A',
    'Total Pieces': results.materialQuantities.pieces,
    'Waste Factor (%)': data.wasteFactor,
    'Material Cost': formatCurrency(results.materialCost),
    'Total Cost': formatCurrency(results.totalCost),
    'Cost per Sq Ft': formatCurrency(results.costPerSqFt)
  };
  
  const filename = `flooring-calculation-${new Date().toISOString().split('T')[0]}`;
  
  switch(format) {
    case 'csv':
      exportToCsv(exportData, filename);
      break;
    case 'xlsx':
      exportToXlsx(exportData, filename);
      break;
    case 'pdf':
      exportToPdf(exportData, filename, 'Flooring Materials Calculation');
      break;
  }
}

export function meta() {
  return {
    id: "flooring",
    title: "Professional Flooring Calculator",
    category: "finishes",
    description: "Calculate flooring materials for tile, hardwood, carpet, vinyl, and other floor finishes with waste factors, installation requirements, and comprehensive cost analysis"
  };
}