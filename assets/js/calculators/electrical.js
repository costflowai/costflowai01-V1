// Professional Electrical Calculator
// Comprehensive electrical materials calculation with NEC standards

import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';
import { pricing, initPricing } from '../core/pricing.js';
import { bus, EVENTS } from '../core/bus.js';

export function init(el) {
  const savedState = loadState('electrical') || {};
  
  // Initialize pricing engine
  initPricing('us').then(() => {
    console.log('✅ Electrical calculator: Pricing engine initialized');
  }).catch(err => {
    console.error('❌ Electrical calculator: Failed to initialize pricing:', err);
  });

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Professional Electrical Calculator</h2>
        <p>Calculate electrical materials including wire, conduit, panels, and devices with NEC compliance</p>
      </div>

      <div class="input-section">
        <h3>Project Specifications</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="building-sqft">Building Area (sq ft)</label>
            <input type="number" id="building-sqft" step="1" min="0" value="${savedState.buildingSqft || ''}" />
          </div>
          <div class="input-group">
            <label for="voltage-system">Voltage System</label>
            <select id="voltage-system">
              <option value="120/240-1ph" ${savedState.voltageSystem === '120/240-1ph' ? 'selected' : ''}>120/240V Single Phase</option>
              <option value="120/208-3ph" ${savedState.voltageSystem === '120/208-3ph' ? 'selected' : ''}>120/208V Three Phase</option>
              <option value="277/480-3ph" ${savedState.voltageSystem === '277/480-3ph' ? 'selected' : ''}>277/480V Three Phase</option>
            </select>
          </div>
          <div class="input-group">
            <label for="panel-count">Number of Panels</label>
            <input type="number" id="panel-count" min="1" value="${savedState.panelCount || '1'}" />
          </div>
          <div class="input-group">
            <label for="occupancy-type">Occupancy Type</label>
            <select id="occupancy-type">
              <option value="residential" ${savedState.occupancyType === 'residential' ? 'selected' : ''}>Residential</option>
              <option value="office" ${savedState.occupancyType === 'office' ? 'selected' : ''}>Office/Commercial</option>
              <option value="retail" ${savedState.occupancyType === 'retail' ? 'selected' : ''}>Retail</option>
              <option value="warehouse" ${savedState.occupancyType === 'warehouse' ? 'selected' : ''}>Warehouse/Industrial</option>
            </select>
          </div>
        </div>

        <h3>Load Calculations</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="general-lighting">General Lighting Load (W/sq ft)</label>
            <input type="number" id="general-lighting" step="0.1" min="0" value="${savedState.generalLighting || ''}" />
            <small>NEC Table 220.12 - Auto-populated based on occupancy</small>
          </div>
          <div class="input-group">
            <label for="receptacle-load">Receptacle Load (W/sq ft)</label>
            <input type="number" id="receptacle-load" step="0.1" min="0" value="${savedState.receptacleLoad || ''}" />
          </div>
          <div class="input-group">
            <label for="hvac-load">HVAC Load (kW)</label>
            <input type="number" id="hvac-load" step="0.1" min="0" value="${savedState.hvacLoad || '0'}" />
          </div>
          <div class="input-group">
            <label for="motor-load">Motor Load (HP)</label>
            <input type="number" id="motor-load" step="0.5" min="0" value="${savedState.motorLoad || '0'}" />
          </div>
        </div>

        <h3>Distribution System</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="main-panel-size">Main Panel Size (Amps)</label>
            <select id="main-panel-size">
              <option value="100" ${savedState.mainPanelSize === '100' ? 'selected' : ''}>100A</option>
              <option value="200" ${savedState.mainPanelSize === '200' ? 'selected' : ''}>200A</option>
              <option value="400" ${savedState.mainPanelSize === '400' ? 'selected' : ''}>400A</option>
              <option value="600" ${savedState.mainPanelSize === '600' ? 'selected' : ''}>600A</option>
              <option value="800" ${savedState.mainPanelSize === '800' ? 'selected' : ''}>800A</option>
            </select>
          </div>
          <div class="input-group">
            <label for="sub-panel-size">Sub Panel Size (Amps)</label>
            <select id="sub-panel-size">
              <option value="0" ${savedState.subPanelSize === '0' ? 'selected' : ''}>None</option>
              <option value="100" ${savedState.subPanelSize === '100' ? 'selected' : ''}>100A</option>
              <option value="200" ${savedState.subPanelSize === '200' ? 'selected' : ''}>200A</option>
              <option value="400" ${savedState.subPanelSize === '400' ? 'selected' : ''}>400A</option>
            </select>
          </div>
          <div class="input-group">
            <label for="feeder-length">Main Feeder Length (ft)</label>
            <input type="number" id="feeder-length" step="1" min="0" value="${savedState.feederLength || '50'}" />
          </div>
          <div class="input-group">
            <label for="branch-circuits">Branch Circuits (qty)</label>
            <input type="number" id="branch-circuits" min="1" value="${savedState.branchCircuits || ''}" />
          </div>
        </div>

        <h3>Wiring & Conduit</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="conduit-type">Conduit Type</label>
            <select id="conduit-type">
              <option value="emt" ${savedState.conduitType === 'emt' ? 'selected' : ''}>EMT (Steel)</option>
              <option value="pvc" ${savedState.conduitType === 'pvc' ? 'selected' : ''}>PVC Schedule 40</option>
              <option value="rigid" ${savedState.conduitType === 'rigid' ? 'selected' : ''}>Rigid Steel</option>
              <option value="mc-cable" ${savedState.conduitType === 'mc-cable' ? 'selected' : ''}>MC Cable</option>
            </select>
          </div>
          <div class="input-group">
            <label for="wire-type">Wire Type</label>
            <select id="wire-type">
              <option value="thhn" ${savedState.wireType === 'thhn' ? 'selected' : ''}>THHN/THWN Copper</option>
              <option value="thhn-al" ${savedState.wireType === 'thhn-al' ? 'selected' : ''}>THHN/THWN Aluminum</option>
              <option value="romex" ${savedState.wireType === 'romex' ? 'selected' : ''}>Romex NM-B</option>
            </select>
          </div>
          <div class="input-group">
            <label for="conduit-length">Total Conduit Length (ft)</label>
            <input type="number" id="conduit-length" step="1" min="0" value="${savedState.conduitLength || ''}" />
          </div>
          <div class="input-group">
            <label for="wire-derating">Derating Factor</label>
            <select id="wire-derating">
              <option value="1.0" ${savedState.wireDerating === '1.0' ? 'selected' : ''}>No derating</option>
              <option value="0.8" ${savedState.wireDerating === '0.8' ? 'selected' : ''}>4-6 conductors (80%)</option>
              <option value="0.7" ${savedState.wireDerating === '0.7' ? 'selected' : ''}>7-9 conductors (70%)</option>
              <option value="0.5" ${savedState.wireDerating === '0.5' ? 'selected' : ''}>10+ conductors (50%)</option>
            </select>
          </div>
        </div>

        <h3>Devices & Fixtures</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="outlets-count">Duplex Outlets</label>
            <input type="number" id="outlets-count" min="0" value="${savedState.outletsCount || ''}" />
          </div>
          <div class="input-group">
            <label for="switches-count">Light Switches</label>
            <input type="number" id="switches-count" min="0" value="${savedState.switchesCount || ''}" />
          </div>
          <div class="input-group">
            <label for="gfci-count">GFCI Outlets</label>
            <input type="number" id="gfci-count" min="0" value="${savedState.gfciCount || ''}" />
          </div>
          <div class="input-group">
            <label for="fixture-count">Light Fixtures</label>
            <input type="number" id="fixture-count" min="0" value="${savedState.fixtureCount || ''}" />
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
        <button id="calculate-btn" class="btn-primary">Calculate Electrical Materials</button>
        <button id="reset-btn" class="btn-secondary">Reset Form</button>
      </div>

      <div id="results" class="results-section" style="display: none;">
        <h3>Electrical Materials Calculation</h3>
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
  
  // Auto-populate lighting loads based on occupancy type
  updateLightingLoads();
}

function setupEventListeners() {
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  calculateBtn.addEventListener('click', calculateElectrical);
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
  
  // Update lighting loads when occupancy type changes
  document.getElementById('occupancy-type').addEventListener('change', updateLightingLoads);
  
  // Auto-calculate branch circuits based on sq ft
  document.getElementById('building-sqft').addEventListener('input', updateBranchCircuits);
}

function updateLightingLoads() {
  const occupancyType = document.getElementById('occupancy-type').value;
  const generalLighting = document.getElementById('general-lighting');
  const receptacleLoad = document.getElementById('receptacle-load');
  
  // NEC Table 220.12 lighting unit loads
  const lightingLoads = {
    'residential': { lighting: 3.0, receptacle: 3.0 },
    'office': { lighting: 3.5, receptacle: 1.0 },
    'retail': { lighting: 3.0, receptacle: 1.0 },
    'warehouse': { lighting: 0.25, receptacle: 1.0 }
  };
  
  const loads = lightingLoads[occupancyType] || lightingLoads['office'];
  generalLighting.value = loads.lighting;
  receptacleLoad.value = loads.receptacle;
}

function updateBranchCircuits() {
  const sqft = parseFloat(document.getElementById('building-sqft').value) || 0;
  const branchCircuitsInput = document.getElementById('branch-circuits');
  
  if (sqft > 0 && !branchCircuitsInput.value) {
    // Estimate 1 circuit per 500 sq ft for general purpose outlets
    const estimatedCircuits = Math.ceil(sqft / 500);
    branchCircuitsInput.value = Math.max(estimatedCircuits, 4); // Minimum 4 circuits
  }
}

function calculateElectrical() {
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
      type: 'electrical',
      sqft: data.buildingSqft,
      panelSize: data.mainPanelSize
    }
  }));
}

function collectFormData() {
  return {
    buildingSqft: parseFloat(document.getElementById('building-sqft').value) || 0,
    voltageSystem: document.getElementById('voltage-system').value,
    panelCount: parseInt(document.getElementById('panel-count').value) || 1,
    occupancyType: document.getElementById('occupancy-type').value,
    generalLighting: parseFloat(document.getElementById('general-lighting').value) || 0,
    receptacleLoad: parseFloat(document.getElementById('receptacle-load').value) || 0,
    hvacLoad: parseFloat(document.getElementById('hvac-load').value) || 0,
    motorLoad: parseFloat(document.getElementById('motor-load').value) || 0,
    mainPanelSize: parseInt(document.getElementById('main-panel-size').value) || 200,
    subPanelSize: parseInt(document.getElementById('sub-panel-size').value) || 0,
    feederLength: parseFloat(document.getElementById('feeder-length').value) || 50,
    branchCircuits: parseInt(document.getElementById('branch-circuits').value) || 0,
    conduitType: document.getElementById('conduit-type').value,
    wireType: document.getElementById('wire-type').value,
    conduitLength: parseFloat(document.getElementById('conduit-length').value) || 0,
    wireDerating: parseFloat(document.getElementById('wire-derating').value) || 1.0,
    outletsCount: parseInt(document.getElementById('outlets-count').value) || 0,
    switchesCount: parseInt(document.getElementById('switches-count').value) || 0,
    gfciCount: parseInt(document.getElementById('gfci-count').value) || 0,
    fixtureCount: parseInt(document.getElementById('fixture-count').value) || 0,
    region: document.getElementById('region').value,
    includeLabor: document.getElementById('include-labor').value === 'yes'
  };
}

function validateInputs(data) {
  const errors = [];
  
  if (data.buildingSqft <= 0) errors.push('Building area must be greater than 0');
  if (data.buildingSqft > 1000000) errors.push('Building area seems too large (max 1,000,000 sq ft)');
  if (data.branchCircuits <= 0) errors.push('Must have at least 1 branch circuit');
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function compute(data) {
  // Load calculations (NEC Article 220)
  const lightingLoad = data.buildingSqft * data.generalLighting; // Watts
  const receptacleLoad = data.buildingSqft * data.receptacleLoad; // Watts
  const hvacLoadW = data.hvacLoad * 1000; // Convert kW to W
  const motorLoadW = data.motorLoad * 746; // Convert HP to W (1 HP = 746 W)
  
  const totalConnectedLoad = lightingLoad + receptacleLoad + hvacLoadW + motorLoadW;
  
  // Apply NEC demand factors (simplified)
  const lightingDemand = lightingLoad * 1.0; // 100% for first 3000W, then reduced
  const receptacleDemand = receptacleLoad * 1.0;
  const hvacDemand = hvacLoadW * 1.25; // 125% for continuous loads
  const motorDemand = motorLoadW * 1.25; // 125% for motor loads
  
  const totalDemandLoad = lightingDemand + receptacleDemand + hvacDemand + motorDemand;
  
  // Determine voltage for calculations
  const voltage = getSystemVoltage(data.voltageSystem);
  const calculatedAmps = totalDemandLoad / voltage / Math.sqrt(data.voltageSystem.includes('3ph') ? 3 : 1);
  
  // Wire sizing based on load and derating
  const adjustedAmps = calculatedAmps / data.wireDerating;
  const feederWireSize = getWireSize(adjustedAmps, data.wireType);
  const branchWireSize = getWireSize(20, data.wireType); // Assume 20A branch circuits
  
  // Conduit sizing
  const feederConduitSize = getConduitSize(feederWireSize, 4); // 4 conductors (3ph + N or 2 hot + N + G)
  const branchConduitSize = getConduitSize(branchWireSize, 3); // 3 conductors (hot, neutral, ground)
  
  // Material quantities
  const feederWireLength = data.feederLength;
  const branchWireLength = data.conduitLength;
  const totalWire12AWG = data.branchCircuits * (branchWireLength * 3); // 3 conductors per circuit
  const totalConduitEMT = data.conduitLength + data.feederLength;
  
  // Panel and device calculations
  const mainPanelSpaces = getPanelSpaces(data.mainPanelSize);
  const subPanelSpaces = data.subPanelSize > 0 ? getPanelSpaces(data.subPanelSize) : 0;
  
  // Check if pricing engine is ready
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded yet, calculations may be inaccurate');
  }
  
  // Cost calculations
  const costs = {
    mainPanel: pricingData.panels[data.mainPanelSize] || 0,
    subPanel: data.subPanelSize > 0 ? (pricingData.panels[data.subPanelSize] || 0) : 0,
    feederWire: getWireCost(feederWireSize, feederWireLength * 4, data.wireType, pricingData), // 4 conductors
    branchWire: (totalWire12AWG / 1000) * pricingData.wire['12AWG'][data.wireType], // Per 1000ft
    conduit: (totalConduitEMT / 10) * (pricingData.conduit[data.conduitType] && pricingData.conduit[data.conduitType]['3/4'] || 25), // Per 10ft stick
    breakers: data.branchCircuits * pricingData.breaker20A,
    outlets: data.outletsCount * pricingData.duplexOutlet,
    switches: data.switchesCount * pricingData.lightSwitch,
    gfci: data.gfciCount * pricingData.gfciOutlet,
    fixtures: data.fixtureCount * pricingData.lightFixture,
    fittings: totalConduitEMT * 0.5 * pricingData.conduitFittings // Estimate 0.5 fittings per foot
  };
  
  const materialCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const laborCost = data.includeLabor ? materialCost * pricingData.laborMultiplier : 0;
  const totalCost = materialCost + laborCost;
  
  return {
    // Load Analysis
    loads: {
      lighting: lightingLoad,
      receptacle: receptacleLoad,
      hvac: hvacLoadW,
      motor: motorLoadW,
      totalConnected: totalConnectedLoad,
      totalDemand: totalDemandLoad
    },
    
    // Electrical Sizing
    calculatedAmps: parseFloat(calculatedAmps.toFixed(1)),
    adjustedAmps: parseFloat(adjustedAmps.toFixed(1)),
    feederWireSize: feederWireSize,
    branchWireSize: branchWireSize,
    feederConduitSize: feederConduitSize,
    branchConduitSize: branchConduitSize,
    
    // Material Quantities
    quantities: {
      mainPanelSpaces: mainPanelSpaces,
      subPanelSpaces: subPanelSpaces,
      feederWireFeet: feederWireLength * 4,
      branchWireFeet: totalWire12AWG,
      conduitFeet: totalConduitEMT,
      breakers: data.branchCircuits,
      outlets: data.outletsCount,
      switches: data.switchesCount,
      gfci: data.gfciCount,
      fixtures: data.fixtureCount
    },
    
    // Costs
    costs: costs,
    materialCost: materialCost,
    laborCost: laborCost,
    totalCost: totalCost,
    
    pricing: pricing
  };
}

function getSystemVoltage(system) {
  const voltages = {
    '120/240-1ph': 240,
    '120/208-3ph': 208,
    '277/480-3ph': 480
  };
  return voltages[system] || 240;
}

function getWireSize(amps, wireType) {
  // Simplified wire sizing based on ampacity (NEC Table 310.15(B)(16))
  const copperAmps = [
    { size: '14AWG', amps: 20 },
    { size: '12AWG', amps: 25 },
    { size: '10AWG', amps: 35 },
    { size: '8AWG', amps: 50 },
    { size: '6AWG', amps: 65 },
    { size: '4AWG', amps: 85 },
    { size: '2AWG', amps: 115 },
    { size: '1AWG', amps: 130 },
    { size: '1/0AWG', amps: 150 },
    { size: '2/0AWG', amps: 175 },
    { size: '3/0AWG', amps: 200 },
    { size: '4/0AWG', amps: 230 }
  ];
  
  for (let wire of copperAmps) {
    if (wire.amps >= amps) {
      return wire.size;
    }
  }
  return '4/0AWG'; // Default to largest
}

function getConduitSize(wireSize, conductorCount) {
  // Simplified conduit fill calculations (NEC Chapter 9)
  const conduitSizes = ['1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"'];
  
  // Basic sizing - would need full NEC tables for precision
  if (wireSize.includes('14') || wireSize.includes('12')) return '1/2"';
  if (wireSize.includes('10') || wireSize.includes('8')) return '3/4"';
  if (wireSize.includes('6') || wireSize.includes('4')) return '1"';
  if (wireSize.includes('2') || wireSize.includes('1')) return '1-1/4"';
  return '1-1/2"';
}

function getPanelSpaces(amperage) {
  const panelSpaces = {
    100: 20,
    200: 40,
    400: 42,
    600: 42,
    800: 42
  };
  return panelSpaces[amperage] || 20;
}

function getWireCost(wireSize, totalFeet, wireType, pricingData) {
  const priceKey = wireSize.replace('AWG', 'AWG');
  const basePrice = pricingData.wire[priceKey] ? pricingData.wire[priceKey][wireType] : pricingData.wire['12AWG'][wireType];
  return (totalFeet / 1000) * basePrice; // Price per 1000ft
}

// Helper function to get wire pricing directly from engine
function getWirePrice(wireSize, wireType) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback for wire');
    const fallbacks = {
      '14AWG': { romex: 120, thhn: 85, 'thhn-al': 45 },
      '12AWG': { romex: 165, thhn: 125, 'thhn-al': 65 },
      '10AWG': { romex: 245, thhn: 185, 'thhn-al': 95 },
      '8AWG': { romex: 385, thhn: 285, 'thhn-al': 145 }
    };
    return fallbacks[wireSize]?.[wireType] || 100;
  }

  // Get base price per foot and convert to per-1000ft for bulk pricing
  if (wireSize === '14AWG') {
    if (wireType === 'romex') return pricing.getPrice('electrical', 'romex_14_2', 'per_linear_foot') * 1000;
    if (wireType === 'thhn') return pricing.getPrice('electrical', 'romex_14_2', 'per_linear_foot') * 750; // THHN bulk discount
    if (wireType === 'thhn-al') return pricing.getPrice('electrical', 'romex_14_2', 'per_linear_foot') * 450; // Aluminum discount
  }
  if (wireSize === '12AWG') {
    if (wireType === 'romex') return pricing.getPrice('electrical', 'romex_12_2', 'per_linear_foot') * 1000;
    if (wireType === 'thhn') return pricing.getPrice('electrical', 'romex_12_2', 'per_linear_foot') * 850;
    if (wireType === 'thhn-al') return pricing.getPrice('electrical', 'romex_12_2', 'per_linear_foot') * 500;
  }
  // Scale up for larger wire sizes
  const base12Price = pricing.getPrice('electrical', 'romex_12_2', 'per_linear_foot');
  if (wireSize === '10AWG') {
    if (wireType === 'romex') return base12Price * 1.4 * 1000;
    if (wireType === 'thhn') return base12Price * 1.5 * 750;
    if (wireType === 'thhn-al') return base12Price * 1.2 * 450;
  }
  if (wireSize === '8AWG') {
    if (wireType === 'romex') return base12Price * 2.8 * 1000;
    if (wireType === 'thhn') return base12Price * 2.2 * 750;
    if (wireType === 'thhn-al') return base12Price * 1.8 * 450;
  }
  
  return base12Price * 1000; // Default fallback
}

// Helper function to get conduit pricing
function getConduitPrice(conduitType, size) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback for conduit');
    const fallbacks = { '1/2': 18, '3/4': 22, '1': 32, '1-1/4': 45, '1-1/2': 58 };
    return fallbacks[size] || 25;
  }

  if (conduitType === 'emt') {
    if (size === '1/2') return pricing.getPrice('electrical', 'conduit_emt_1_2', 'per_linear_foot') * 100;
    if (size === '3/4') return pricing.getPrice('electrical', 'conduit_emt_3_4', 'per_linear_foot') * 100;
    // Scale for larger sizes
    const base34Price = pricing.getPrice('electrical', 'conduit_emt_3_4', 'per_linear_foot');
    if (size === '1') return base34Price * 1.4 * 100;
    if (size === '1-1/4') return base34Price * 2.0 * 100;
    if (size === '1-1/2') return base34Price * 2.6 * 100;
  }
  if (conduitType === 'pvc') {
    // PVC is typically 60% of EMT pricing
    const emtPrice = getConduitPrice('emt', size);
    return emtPrice * 0.6;
  }
  
  return 25; // Default fallback
}

// Helper function to get panel pricing
function getPanelPrice(amperage) {
  if (!pricing.isLoaded) {
    console.warn('⚠️ Pricing engine not loaded, using fallback for panels');
    const fallbacks = { 100: 180, 200: 320, 400: 850, 600: 1200, 800: 1500 };
    return fallbacks[amperage] || 320;
  }

  const base200Price = pricing.getPrice('electrical', 'panel_200_amp', 'per_piece');
  if (amperage === 100) return base200Price * 0.6;
  if (amperage === 200) return base200Price;
  if (amperage === 400) return base200Price * 1.75;
  if (amperage === 600) return base200Price * 2.5;
  if (amperage === 800) return base200Price * 3.1;
  
  return base200Price; // Default to 200A pricing
}

// Labor cost helper functions
function getPanelInstallationCost(amperage) {
  if (!pricing.isLoaded) return amperage * 0.50; // Fallback: $0.50 per amp
  // Panel installation is roughly 4-8 hours depending on size
  const laborHours = amperage <= 100 ? 4 : amperage <= 200 ? 6 : 8;
  const laborRate = pricing.getPrice('labor', 'electrical', 'per_hour') || 75; // $75/hr fallback
  return laborHours * laborRate;
}

function getWireInstallationCost(totalFeet) {
  if (!pricing.isLoaded) return totalFeet * 0.75; // Fallback: $0.75 per foot
  const laborRate = pricing.getPrice('labor', 'electrical', 'per_hour') || 75;
  const feetPerHour = 150; // Typical installation rate
  return (totalFeet / feetPerHour) * laborRate;
}

function getConduitInstallationCost(totalFeet) {
  if (!pricing.isLoaded) return totalFeet * 1.25; // Fallback: $1.25 per foot  
  const laborRate = pricing.getPrice('labor', 'electrical', 'per_hour') || 75;
  const feetPerHour = 60; // Conduit is slower to install
  return (totalFeet / feetPerHour) * laborRate;
}

function getDeviceInstallationCost(deviceCount) {
  if (!pricing.isLoaded) return deviceCount * 15; // Fallback: $15 per device
  const laborRate = pricing.getPrice('labor', 'electrical', 'per_hour') || 75;
  const devicesPerHour = 5; // Typical device installation rate
  return (deviceCount / devicesPerHour) * laborRate;
}

function displayResults(results) {
  const content = document.getElementById('results-content');
  
  content.innerHTML = `
    <div class="results-grid">
      <div class="result-section">
        <h4>Load Analysis</h4>
        <div class="result-item">
          <span class="label">Total Connected Load:</span>
          <span class="value">${formatNumber(results.loads.totalConnected / 1000, 1)} kW</span>
        </div>
        <div class="result-item">
          <span class="label">Total Demand Load:</span>
          <span class="value">${formatNumber(results.loads.totalDemand / 1000, 1)} kW</span>
        </div>
        <div class="result-item">
          <span class="label">Calculated Current:</span>
          <span class="value">${results.calculatedAmps} Amps</span>
        </div>
        <div class="result-item">
          <span class="label">Adjusted Current:</span>
          <span class="value">${results.adjustedAmps} Amps (after derating)</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Electrical Distribution</h4>
        <div class="result-item">
          <span class="label">Main Panel:</span>
          <span class="value">${results.quantities.mainPanelSpaces} spaces</span>
        </div>
        ${results.quantities.subPanelSpaces > 0 ? `
        <div class="result-item">
          <span class="label">Sub Panel:</span>
          <span class="value">${results.quantities.subPanelSpaces} spaces</span>
        </div>
        ` : ''}
        <div class="result-item">
          <span class="label">Feeder Wire Size:</span>
          <span class="value">${results.feederWireSize}</span>
        </div>
        <div class="result-item">
          <span class="label">Branch Wire Size:</span>
          <span class="value">${results.branchWireSize}</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Material Quantities</h4>
        <div class="result-item">
          <span class="label">Feeder Wire:</span>
          <span class="value">${formatNumber(results.quantities.feederWireFeet)} ft</span>
        </div>
        <div class="result-item">
          <span class="label">Branch Circuit Wire:</span>
          <span class="value">${formatNumber(results.quantities.branchWireFeet)} ft</span>
        </div>
        <div class="result-item">
          <span class="label">Conduit:</span>
          <span class="value">${formatNumber(results.quantities.conduitFeet)} ft</span>
        </div>
        <div class="result-item">
          <span class="label">Circuit Breakers:</span>
          <span class="value">${results.quantities.breakers} ea (20A)</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Devices & Fixtures</h4>
        ${results.quantities.outlets > 0 ? `
        <div class="result-item">
          <span class="label">Duplex Outlets:</span>
          <span class="value">${results.quantities.outlets} ea</span>
        </div>
        ` : ''}
        ${results.quantities.switches > 0 ? `
        <div class="result-item">
          <span class="label">Light Switches:</span>
          <span class="value">${results.quantities.switches} ea</span>
        </div>
        ` : ''}
        ${results.quantities.gfci > 0 ? `
        <div class="result-item">
          <span class="label">GFCI Outlets:</span>
          <span class="value">${results.quantities.gfci} ea</span>
        </div>
        ` : ''}
        ${results.quantities.fixtures > 0 ? `
        <div class="result-item">
          <span class="label">Light Fixtures:</span>
          <span class="value">${results.quantities.fixtures} ea</span>
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
        <div class="result-item">
          <span class="label">Cost per Sq Ft:</span>
          <span class="value">${formatCurrency(results.totalCost / parseFloat(document.getElementById('building-sqft').value))}</span>
        </div>
      </div>
    </div>
  `;
}

export function explain(data) {
  const results = compute(data);
  
  return `
    <div class="explanation-content">
      <h4>Electrical Load Calculation Methodology</h4>
      
      <h5>1. Connected Load Calculation (NEC Article 220)</h5>
      <p>General Lighting: ${data.buildingSqft} sq ft × ${data.generalLighting} W/sq ft = ${formatNumber(results.loads.lighting)} W</p>
      <p>Receptacles: ${data.buildingSqft} sq ft × ${data.receptacleLoad} W/sq ft = ${formatNumber(results.loads.receptacle)} W</p>
      <p>HVAC Load: ${data.hvacLoad} kW × 1000 = ${formatNumber(results.loads.hvac)} W</p>
      <p>Motor Load: ${data.motorLoad} HP × 746 W/HP = ${formatNumber(results.loads.motor)} W</p>
      <p><strong>Total Connected Load: ${formatNumber(results.loads.totalConnected)} W</strong></p>
      
      <h5>2. Demand Load Calculation</h5>
      <p>Applies NEC demand factors for continuous loads (125% for HVAC and motors)</p>
      <p><strong>Total Demand Load: ${formatNumber(results.loads.totalDemand)} W (${formatNumber(results.loads.totalDemand/1000, 1)} kW)</strong></p>
      
      <h5>3. Current Calculation</h5>
      <p>System Voltage: ${getSystemVoltage(data.voltageSystem)}V ${data.voltageSystem.includes('3ph') ? '(3-phase)' : '(1-phase)'}</p>
      <p>Calculated Current: ${formatNumber(results.loads.totalDemand)} W ÷ ${getSystemVoltage(data.voltageSystem)}V ${data.voltageSystem.includes('3ph') ? '÷ √3' : ''} = ${results.calculatedAmps} A</p>
      <p>Adjusted for Derating: ${results.calculatedAmps} A ÷ ${data.wireDerating} = ${results.adjustedAmps} A</p>
      
      <h5>4. Wire Sizing (NEC Table 310.15(B)(16))</h5>
      <p>Feeder Wire: ${results.feederWireSize} (rated for ${results.adjustedAmps}A+)</p>
      <p>Branch Circuits: ${results.branchWireSize} (20A circuits)</p>
      
      <h5>5. Conduit Sizing (NEC Chapter 9)</h5>
      <p>Feeder Conduit: ${results.feederConduitSize} (based on ${results.feederWireSize} wire, 4 conductors)</p>
      <p>Branch Conduit: ${results.branchConduitSize} (based on ${results.branchWireSize} wire, 3 conductors)</p>
      
      <div class="formula-note">
        <p><strong>NEC Standards Applied:</strong></p>
        <ul>
          <li>Article 220: Branch Circuit, Feeder, and Service Load Calculations</li>
          <li>Table 220.12: General Lighting Loads by Occupancy</li>
          <li>Table 310.15(B)(16): Allowable Ampacities of Insulated Conductors</li>
          <li>Article 314: Outlet, Device, Pull, and Junction Boxes; Conduit Bodies; Fittings; and Handhole Enclosures</li>
          <li>Chapter 9: Tables for conductor and conduit fill calculations</li>
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
  saveState('electrical', formData);
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
  saveState('electrical', {});
  updateLightingLoads(); // Restore default lighting loads
}

function exportResults(format) {
  const data = collectFormData();
  const results = compute(data);
  
  const exportData = {
    'Project': 'Electrical Materials Calculation',
    'Date': new Date().toLocaleDateString(),
    'Building Area (sq ft)': data.buildingSqft,
    'Total Demand Load (kW)': formatNumber(results.loads.totalDemand/1000, 1),
    'Calculated Current (A)': results.calculatedAmps,
    'Feeder Wire Size': results.feederWireSize,
    'Branch Circuits': data.branchCircuits,
    'Material Cost': formatCurrency(results.materialCost),
    'Total Cost': formatCurrency(results.totalCost)
  };
  
  const filename = `electrical-calculation-${new Date().toISOString().split('T')[0]}`;
  
  switch(format) {
    case 'csv':
      exportToCsv(exportData, filename);
      break;
    case 'xlsx':
      exportToXlsx(exportData, filename);
      break;
    case 'pdf':
      exportToPdf(exportData, filename, 'Electrical Materials Calculation');
      break;
  }
}

export function meta() {
  return {
    id: "electrical",
    title: "Professional Electrical Calculator",
    category: "mep",
    description: "Calculate electrical materials including wire, conduit, panels, and devices with NEC compliance and load calculations"
  };
}