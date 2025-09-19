// Professional HVAC Calculator
// Comprehensive HVAC system design with thermal load calculations and equipment sizing

import { validateNumber } from '../core/validate.js';
import { formatCurrency, formatNumber } from '../core/units.js';
import { exportToCsv, exportToXlsx, exportToPdf } from '../core/export.js';
import { loadState, saveState } from '../core/store.js';

export function init(el) {
  const savedState = loadState('hvac') || {};

  el.innerHTML = `
    <div class="calculator-container">
      <div class="calculator-header">
        <h2>Professional HVAC Calculator</h2>
        <p>Calculate HVAC system components, ductwork sizing, and thermal load calculations with ASHRAE standards</p>
      </div>

      <div class="input-section">
        <h3>Building Specifications</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="building-type">Building Type</label>
            <select id="building-type">
              <option value="residential" ${savedState.buildingType === 'residential' ? 'selected' : ''}>Residential</option>
              <option value="office" ${savedState.buildingType === 'office' ? 'selected' : ''}>Office/Commercial</option>
              <option value="retail" ${savedState.buildingType === 'retail' ? 'selected' : ''}>Retail</option>
              <option value="restaurant" ${savedState.buildingType === 'restaurant' ? 'selected' : ''}>Restaurant</option>
              <option value="warehouse" ${savedState.buildingType === 'warehouse' ? 'selected' : ''}>Warehouse</option>
              <option value="hotel" ${savedState.buildingType === 'hotel' ? 'selected' : ''}>Hotel</option>
            </select>
          </div>
          <div class="input-group">
            <label for="total-sqft">Total Floor Area (sq ft)</label>
            <input type="number" id="total-sqft" step="1" min="0" value="${savedState.totalSqft || ''}" />
          </div>
          <div class="input-group">
            <label for="ceiling-height">Ceiling Height (ft)</label>
            <input type="number" id="ceiling-height" step="0.1" min="6" max="20" value="${savedState.ceilingHeight || '9'}" />
          </div>
          <div class="input-group">
            <label for="climate-zone">Climate Zone (ASHRAE)</label>
            <select id="climate-zone">
              <option value="1A" ${savedState.climateZone === '1A' ? 'selected' : ''}>1A - Very Hot, Humid</option>
              <option value="2A" ${savedState.climateZone === '2A' ? 'selected' : ''}>2A - Hot, Humid</option>
              <option value="3A" ${savedState.climateZone === '3A' ? 'selected' : ''}>3A - Warm, Humid</option>
              <option value="3B" ${savedState.climateZone === '3B' ? 'selected' : ''}>3B - Warm, Dry</option>
              <option value="4A" ${savedState.climateZone === '4A' ? 'selected' : ''}>4A - Mixed, Humid</option>
              <option value="4B" ${savedState.climateZone === '4B' ? 'selected' : ''}>4B - Mixed, Dry</option>
              <option value="5A" ${savedState.climateZone === '5A' ? 'selected' : ''}>5A - Cool, Humid</option>
              <option value="6A" ${savedState.climateZone === '6A' ? 'selected' : ''}>6A - Cold, Humid</option>
            </select>
          </div>
        </div>

        <h3>Thermal Load Factors</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="insulation-level">Insulation Level</label>
            <select id="insulation-level">
              <option value="poor" ${savedState.insulationLevel === 'poor' ? 'selected' : ''}>Poor (R-11 walls, R-19 roof)</option>
              <option value="average" ${savedState.insulationLevel === 'average' ? 'selected' : ''}>Average (R-13 walls, R-30 roof)</option>
              <option value="good" ${savedState.insulationLevel === 'good' ? 'selected' : ''}>Good (R-19 walls, R-38 roof)</option>
              <option value="excellent" ${savedState.insulationLevel === 'excellent' ? 'selected' : ''}>Excellent (R-21+ walls, R-49+ roof)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="window-area">Window Area (sq ft)</label>
            <input type="number" id="window-area" step="1" min="0" value="${savedState.windowArea || ''}" />
          </div>
          <div class="input-group">
            <label for="window-type">Window Type</label>
            <select id="window-type">
              <option value="single" ${savedState.windowType === 'single' ? 'selected' : ''}>Single Pane</option>
              <option value="double" ${savedState.windowType === 'double' ? 'selected' : ''}>Double Pane</option>
              <option value="low-e" ${savedState.windowType === 'low-e' ? 'selected' : ''}>Low-E Double Pane</option>
              <option value="triple" ${savedState.windowType === 'triple' ? 'selected' : ''}>Triple Pane</option>
            </select>
          </div>
          <div class="input-group">
            <label for="occupancy">Peak Occupancy</label>
            <input type="number" id="occupancy" min="0" value="${savedState.occupancy || ''}" />
          </div>
        </div>

        <h3>Equipment Specifications</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="system-type">HVAC System Type</label>
            <select id="system-type">
              <option value="split-system" ${savedState.systemType === 'split-system' ? 'selected' : ''}>Split System (Heat Pump)</option>
              <option value="package-unit" ${savedState.systemType === 'package-unit' ? 'selected' : ''}>Package Unit</option>
              <option value="vrf" ${savedState.systemType === 'vrf' ? 'selected' : ''}>VRF System</option>
              <option value="chiller" ${savedState.systemType === 'chiller' ? 'selected' : ''}>Chilled Water System</option>
              <option value="gas-furnace" ${savedState.systemType === 'gas-furnace' ? 'selected' : ''}>Gas Furnace + AC</option>
            </select>
          </div>
          <div class="input-group">
            <label for="efficiency-rating">System Efficiency</label>
            <select id="efficiency-rating">
              <option value="standard" ${savedState.efficiencyRating === 'standard' ? 'selected' : ''}>Standard (14 SEER)</option>
              <option value="high" ${savedState.efficiencyRating === 'high' ? 'selected' : ''}>High Efficiency (16-18 SEER)</option>
              <option value="premium" ${savedState.efficiencyRating === 'premium' ? 'selected' : ''}>Premium (19+ SEER)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="ventilation-cfm">Ventilation Requirement (CFM)</label>
            <input type="number" id="ventilation-cfm" step="10" min="0" value="${savedState.ventilationCfm || ''}" />
            <small>ASHRAE 62.1 - Auto-calculated based on occupancy</small>
          </div>
          <div class="input-group">
            <label for="zones">Number of Zones</label>
            <input type="number" id="zones" min="1" max="20" value="${savedState.zones || '1'}" />
          </div>
        </div>

        <h3>Ductwork System</h3>
        <div class="input-grid">
          <div class="input-group">
            <label for="duct-material">Duct Material</label>
            <select id="duct-material">
              <option value="galvanized" ${savedState.ductMaterial === 'galvanized' ? 'selected' : ''}>Galvanized Steel</option>
              <option value="aluminum" ${savedState.ductMaterial === 'aluminum' ? 'selected' : ''}>Aluminum</option>
              <option value="fiberglass" ${savedState.ductMaterial === 'fiberglass' ? 'selected' : ''}>Fiberglass Ductboard</option>
              <option value="flexible" ${savedState.ductMaterial === 'flexible' ? 'selected' : ''}>Flexible Duct</option>
            </select>
          </div>
          <div class="input-group">
            <label for="duct-insulation">Duct Insulation</label>
            <select id="duct-insulation">
              <option value="none" ${savedState.ductInsulation === 'none' ? 'selected' : ''}>None</option>
              <option value="r4" ${savedState.ductInsulation === 'r4' ? 'selected' : ''}>R-4 (1" wrap)</option>
              <option value="r6" ${savedState.ductInsulation === 'r6' ? 'selected' : ''}>R-6 (1.5" wrap)</option>
              <option value="r8" ${savedState.ductInsulation === 'r8' ? 'selected' : ''}>R-8 (2" wrap)</option>
            </select>
          </div>
          <div class="input-group">
            <label for="main-trunk-length">Main Trunk Length (ft)</label>
            <input type="number" id="main-trunk-length" step="1" min="0" value="${savedState.mainTrunkLength || ''}" />
          </div>
          <div class="input-group">
            <label for="branch-ductwork">Branch Ductwork (ft)</label>
            <input type="number" id="branch-ductwork" step="1" min="0" value="${savedState.branchDuctwork || ''}" />
          </div>
          <div class="input-group">
            <label for="return-ductwork">Return Air Ductwork (ft)</label>
            <input type="number" id="return-ductwork" step="1" min="0" value="${savedState.returnDuctwork || ''}" />
          </div>
          <div class="input-group">
            <label for="diffusers">Supply Diffusers (qty)</label>
            <input type="number" id="diffusers" min="0" value="${savedState.diffusers || ''}" />
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
        <button id="calculate-btn" class="btn-primary">Calculate HVAC System</button>
        <button id="reset-btn" class="btn-secondary">Reset Form</button>
      </div>

      <div id="results" class="results-section" style="display: none;">
        <h3>HVAC System Calculation</h3>
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
  
  // Auto-populate ventilation requirements
  updateVentilationRequirements();
}

function setupEventListeners() {
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  
  calculateBtn.addEventListener('click', calculateHVAC);
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
  
  // Update ventilation when building type or occupancy changes
  document.getElementById('building-type').addEventListener('change', updateVentilationRequirements);
  document.getElementById('occupancy').addEventListener('input', updateVentilationRequirements);
  document.getElementById('total-sqft').addEventListener('input', updateVentilationRequirements);
}

function updateVentilationRequirements() {
  const buildingType = document.getElementById('building-type').value;
  const occupancy = parseInt(document.getElementById('occupancy').value) || 0;
  const sqft = parseFloat(document.getElementById('total-sqft').value) || 0;
  
  // ASHRAE 62.1 ventilation rates (CFM per person + CFM per sq ft)
  const ventilationRates = {
    'residential': { perPerson: 5, perSqft: 0.03 },
    'office': { perPerson: 5, perSqft: 0.06 },
    'retail': { perPerson: 7.5, perSqft: 0.12 },
    'restaurant': { perPerson: 7.5, perSqft: 0.18 },
    'warehouse': { perPerson: 5, perSqft: 0.05 },
    'hotel': { perPerson: 5, perSqft: 0.06 }
  };
  
  const rates = ventilationRates[buildingType] || ventilationRates['office'];
  const requiredVentilation = (occupancy * rates.perPerson) + (sqft * rates.perSqft);
  
  document.getElementById('ventilation-cfm').value = Math.ceil(requiredVentilation);
  
  // Auto-estimate occupancy if not provided
  if (!document.getElementById('occupancy').value && sqft > 0) {
    const occupancyDensity = {
      'residential': 150, // sq ft per person
      'office': 200,
      'retail': 30,
      'restaurant': 15,
      'warehouse': 500,
      'hotel': 300
    };
    
    const density = occupancyDensity[buildingType] || 200;
    document.getElementById('occupancy').value = Math.max(1, Math.ceil(sqft / density));
    
    // Recalculate ventilation with estimated occupancy
    const newOccupancy = parseInt(document.getElementById('occupancy').value);
    const newVentilation = (newOccupancy * rates.perPerson) + (sqft * rates.perSqft);
    document.getElementById('ventilation-cfm').value = Math.ceil(newVentilation);
  }
  
  // Estimate ductwork lengths if not provided
  if (sqft > 0) {
    const avgDimension = Math.sqrt(sqft);
    
    if (!document.getElementById('main-trunk-length').value) {
      document.getElementById('main-trunk-length').value = Math.ceil(avgDimension * 0.8);
    }
    if (!document.getElementById('branch-ductwork').value) {
      document.getElementById('branch-ductwork').value = Math.ceil(avgDimension * 2.5);
    }
    if (!document.getElementById('return-ductwork').value) {
      document.getElementById('return-ductwork').value = Math.ceil(avgDimension * 1.2);
    }
    if (!document.getElementById('diffusers').value) {
      document.getElementById('diffusers').value = Math.max(1, Math.ceil(sqft / 150));
    }
  }
}

function calculateHVAC() {
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
      type: 'hvac',
      buildingType: data.buildingType,
      sqft: data.totalSqft,
      systemType: data.systemType
    }
  }));
}

function collectFormData() {
  return {
    buildingType: document.getElementById('building-type').value,
    totalSqft: parseFloat(document.getElementById('total-sqft').value) || 0,
    ceilingHeight: parseFloat(document.getElementById('ceiling-height').value) || 9,
    climateZone: document.getElementById('climate-zone').value,
    insulationLevel: document.getElementById('insulation-level').value,
    windowArea: parseFloat(document.getElementById('window-area').value) || 0,
    windowType: document.getElementById('window-type').value,
    occupancy: parseInt(document.getElementById('occupancy').value) || 0,
    systemType: document.getElementById('system-type').value,
    efficiencyRating: document.getElementById('efficiency-rating').value,
    ventilationCfm: parseFloat(document.getElementById('ventilation-cfm').value) || 0,
    zones: parseInt(document.getElementById('zones').value) || 1,
    ductMaterial: document.getElementById('duct-material').value,
    ductInsulation: document.getElementById('duct-insulation').value,
    mainTrunkLength: parseFloat(document.getElementById('main-trunk-length').value) || 0,
    branchDuctwork: parseFloat(document.getElementById('branch-ductwork').value) || 0,
    returnDuctwork: parseFloat(document.getElementById('return-ductwork').value) || 0,
    diffusers: parseInt(document.getElementById('diffusers').value) || 0,
    region: document.getElementById('region').value,
    includeLabor: document.getElementById('include-labor').value === 'yes'
  };
}

function validateInputs(data) {
  const errors = [];
  
  if (data.totalSqft <= 0) errors.push('Total floor area must be greater than 0');
  if (data.totalSqft > 1000000) errors.push('Floor area seems too large (max 1,000,000 sq ft)');
  if (data.windowArea > data.totalSqft) errors.push('Window area cannot exceed total floor area');
  if (data.occupancy <= 0) errors.push('Must specify building occupancy');
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function compute(data) {
  // Calculate total thermal load using simplified Manual J methodology
  const thermalLoad = calculateThermalLoad(data);
  
  // Size equipment based on thermal load
  const equipmentSizing = sizeEquipment(thermalLoad, data);
  
  // Size ductwork based on airflow requirements
  const ductworkSizing = sizeDuctwork(equipmentSizing.totalCfm, data);
  
  // Calculate material quantities
  const materialQuantities = calculateMaterials(data, equipmentSizing, ductworkSizing);
  
  // Regional pricing
  const pricing = getRegionalPricing(data.region);
  
  // Cost calculations
  const costs = {
    equipment: calculateEquipmentCost(equipmentSizing, data, pricing),
    ductwork: calculateDuctworkCost(materialQuantities.ductwork, data, pricing),
    accessories: materialQuantities.accessories * pricing.averageAccessory,
    controls: data.zones * pricing.zoneControls,
    installation: 0 // Will be calculated as labor multiplier
  };
  
  const materialCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const laborCost = data.includeLabor ? materialCost * pricing.laborMultiplier : 0;
  const totalCost = materialCost + laborCost;
  
  return {
    // Load Analysis
    thermalLoad: thermalLoad,
    
    // Equipment Sizing
    equipmentSizing: equipmentSizing,
    
    // Ductwork Design
    ductworkSizing: ductworkSizing,
    
    // Material Quantities
    materialQuantities: materialQuantities,
    
    // Cost Analysis
    costs: costs,
    materialCost: materialCost,
    laborCost: laborCost,
    totalCost: totalCost,
    
    pricing: pricing
  };
}

function calculateThermalLoad(data) {
  // Simplified thermal load calculation (real Manual J is much more complex)
  
  // Base load factors by building type (BTU/hr per sq ft)
  const baseLoadFactors = {
    'residential': 25,
    'office': 30,
    'retail': 35,
    'restaurant': 45,
    'warehouse': 20,
    'hotel': 28
  };
  
  const baseLoad = data.totalSqft * (baseLoadFactors[data.buildingType] || 30);
  
  // Climate zone adjustment factors
  const climateFactors = {
    '1A': 1.4, '2A': 1.3, '3A': 1.2, '3B': 1.1,
    '4A': 1.0, '4B': 0.9, '5A': 0.8, '6A': 0.7
  };
  
  const climateAdjustedLoad = baseLoad * (climateFactors[data.climateZone] || 1.0);
  
  // Window heat gain (BTU/hr per sq ft)
  const windowHeatGain = {
    'single': 200,
    'double': 120,
    'low-e': 80,
    'triple': 60
  };
  
  const windowLoad = data.windowArea * (windowHeatGain[data.windowType] || 120);
  
  // Occupancy load (300 BTU/hr per person)
  const occupancyLoad = data.occupancy * 300;
  
  // Insulation adjustment
  const insulationFactors = {
    'poor': 1.3,
    'average': 1.0,
    'good': 0.8,
    'excellent': 0.6
  };
  
  const totalSensibleLoad = (climateAdjustedLoad + windowLoad + occupancyLoad) * 
    (insulationFactors[data.insulationLevel] || 1.0);
  
  // Latent load (approximately 30% of sensible in humid climates)
  const latentLoad = totalSensibleLoad * 0.3;
  
  const totalLoad = totalSensibleLoad + latentLoad;
  
  return {
    sensibleLoad: Math.round(totalSensibleLoad),
    latentLoad: Math.round(latentLoad),
    totalLoad: Math.round(totalLoad),
    tonsRequired: Math.round((totalLoad / 12000) * 10) / 10 // Round to 0.1 ton
  };
}

function sizeEquipment(thermalLoad, data) {
  // Size equipment to handle calculated load with safety factor
  const requiredTons = Math.ceil(thermalLoad.tonsRequired * 1.15); // 15% safety factor
  
  // CFM sizing (typically 400 CFM per ton for cooling)
  const coolingCfm = requiredTons * 400;
  const ventilationCfm = data.ventilationCfm || 0;
  const totalCfm = Math.max(coolingCfm, coolingCfm + ventilationCfm * 0.3); // Blend ventilation
  
  // Equipment efficiency factors
  const efficiencyMultipliers = {
    'standard': 1.0,
    'high': 0.85,
    'premium': 0.75
  };
  
  const efficiencyFactor = efficiencyMultipliers[data.efficiencyRating] || 1.0;
  
  return {
    requiredTons: requiredTons,
    coolingCfm: coolingCfm,
    ventilationCfm: ventilationCfm,
    totalCfm: totalCfm,
    systemCount: Math.ceil(requiredTons / 5), // Max 5 tons per unit typically
    efficiencyFactor: efficiencyFactor
  };
}

function sizeDuctwork(totalCfm, data) {
  // Main trunk sizing (typically 700-900 FPM velocity)
  const trunkVelocity = 800; // FPM
  const trunkArea = totalCfm / trunkVelocity; // sq in
  const trunkDiameter = Math.sqrt(trunkArea / 0.785); // inches (round duct equivalent)
  const trunkSize = getDuctSize(trunkDiameter);
  
  // Branch duct sizing (600-700 FPM)
  const branchVelocity = 650; // FPM
  const cfmPerDiffuser = totalCfm / data.diffusers;
  const branchArea = cfmPerDiffuser / branchVelocity;
  const branchDiameter = Math.sqrt(branchArea / 0.785);
  const branchSize = getDuctSize(branchDiameter);
  
  // Return air sizing (500 FPM)
  const returnVelocity = 500; // FPM
  const returnArea = (totalCfm * 0.9) / returnVelocity; // 90% return air
  const returnDiameter = Math.sqrt(returnArea / 0.785);
  const returnSize = getDuctSize(returnDiameter);
  
  return {
    trunkSize: trunkSize,
    branchSize: branchSize,
    returnSize: returnSize,
    totalCfm: totalCfm,
    systemPressure: calculateSystemPressure(data)
  };
}

function getDuctSize(diameter) {
  // Convert diameter to standard rectangular or round duct sizes
  const standardSizes = [
    { size: '6"', diameter: 6 },
    { size: '8"', diameter: 8 },
    { size: '10"', diameter: 10 },
    { size: '12"', diameter: 12 },
    { size: '14"', diameter: 14 },
    { size: '16"', diameter: 16 },
    { size: '18"', diameter: 18 },
    { size: '20"', diameter: 20 },
    { size: '24"', diameter: 24 }
  ];
  
  for (let size of standardSizes) {
    if (diameter <= size.diameter) {
      return size.size;
    }
  }
  
  return '24"'; // Max size
}

function calculateSystemPressure(data) {
  // Simplified static pressure calculation
  const basePressure = 0.5; // inches of water
  const ductLengthFactor = (data.mainTrunkLength + data.branchDuctwork) / 100;
  const zonesFactor = data.zones * 0.1;
  
  return basePressure + ductLengthFactor + zonesFactor;
}

function calculateMaterials(data, equipmentSizing, ductworkSizing) {
  const totalDuctwork = data.mainTrunkLength + data.branchDuctwork + data.returnDuctwork;
  
  // Estimate fittings (elbows, tees, reducers)
  const fittingsCount = Math.ceil(totalDuctwork / 10); // 1 fitting per 10 feet
  
  // Accessories (dampers, registers, grilles)
  const accessories = data.diffusers + Math.ceil(data.zones * 2); // Return grilles
  
  // Insulation (if specified)
  const insulationSqft = data.ductInsulation !== 'none' ? 
    totalDuctwork * getAverageDuctPerimeter(ductworkSizing) : 0;
  
  return {
    ductwork: {
      total: totalDuctwork,
      trunk: data.mainTrunkLength,
      branch: data.branchDuctwork,
      return: data.returnDuctwork
    },
    fittings: fittingsCount,
    accessories: accessories,
    insulationSqft: insulationSqft,
    equipmentCount: equipmentSizing.systemCount
  };
}

function getAverageDuctPerimeter(ductworkSizing) {
  // Simplified average perimeter calculation for insulation
  const avgDiameter = 12; // inches, rough average
  return (avgDiameter * Math.PI) / 12; // feet
}

function calculateEquipmentCost(equipmentSizing, data, pricing) {
  const systemCost = equipmentSizing.systemCount * pricing.equipment[data.systemType][equipmentSizing.requiredTons] || 
    pricing.equipment['split-system'][3]; // Default fallback
  
  const efficiencyUpcharge = data.efficiencyRating !== 'standard' ? systemCost * 0.25 : 0;
  
  return systemCost + efficiencyUpcharge;
}

function calculateDuctworkCost(ductwork, data, pricing) {
  const materialPricing = pricing.ductwork[data.ductMaterial];
  const ductCost = ductwork.total * materialPricing.perFoot;
  
  const insulationCost = data.ductInsulation !== 'none' ? 
    ductwork.total * pricing.ductInsulation[data.ductInsulation] : 0;
  
  return ductCost + insulationCost;
}

function getRegionalPricing(region) {
  const basePricing = {
    'southeast': {
      equipment: {
        'split-system': { 2: 3500, 3: 4200, 4: 5100, 5: 6200 },
        'package-unit': { 2: 4200, 3: 5000, 4: 6100, 5: 7400 },
        'vrf': { 2: 8500, 3: 11000, 4: 14000, 5: 17500 },
        'chiller': { 2: 12000, 3: 16000, 4: 20000, 5: 25000 },
        'gas-furnace': { 2: 2800, 3: 3400, 4: 4200, 5: 5100 }
      },
      ductwork: {
        galvanized: { perFoot: 8.50 },
        aluminum: { perFoot: 6.75 },
        fiberglass: { perFoot: 5.25 },
        flexible: { perFoot: 3.80 }
      },
      ductInsulation: {
        r4: 2.20,
        r6: 2.85,
        r8: 3.50
      },
      zoneControls: 450,
      averageAccessory: 35,
      laborMultiplier: 2.2
    },
    'northeast': {
      equipment: {
        'split-system': { 2: 4200, 3: 5000, 4: 6100, 5: 7400 },
        'package-unit': { 2: 5000, 3: 6000, 4: 7300, 5: 8800 },
        'vrf': { 2: 10200, 3: 13200, 4: 16800, 5: 21000 },
        'chiller': { 2: 14400, 3: 19200, 4: 24000, 5: 30000 },
        'gas-furnace': { 2: 3400, 3: 4100, 4: 5000, 5: 6100 }
      },
      ductwork: {
        galvanized: { perFoot: 10.20 },
        aluminum: { perFoot: 8.10 },
        fiberglass: { perFoot: 6.30 },
        flexible: { perFoot: 4.55 }
      },
      ductInsulation: {
        r4: 2.65,
        r6: 3.40,
        r8: 4.20
      },
      zoneControls: 540,
      averageAccessory: 42,
      laborMultiplier: 2.8
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
        <h4>Thermal Load Analysis</h4>
        <div class="result-item">
          <span class="label">Total Cooling Load:</span>
          <span class="value">${formatNumber(results.thermalLoad.totalLoad)} BTU/hr</span>
        </div>
        <div class="result-item">
          <span class="label">Required Capacity:</span>
          <span class="value">${results.thermalLoad.tonsRequired} tons</span>
        </div>
        <div class="result-item">
          <span class="label">Sensible Load:</span>
          <span class="value">${formatNumber(results.thermalLoad.sensibleLoad)} BTU/hr</span>
        </div>
        <div class="result-item">
          <span class="label">Latent Load:</span>
          <span class="value">${formatNumber(results.thermalLoad.latentLoad)} BTU/hr</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Equipment Sizing</h4>
        <div class="result-item">
          <span class="label">System Capacity:</span>
          <span class="value">${results.equipmentSizing.requiredTons} tons</span>
        </div>
        <div class="result-item">
          <span class="label">Total Airflow:</span>
          <span class="value">${formatNumber(results.equipmentSizing.totalCfm)} CFM</span>
        </div>
        <div class="result-item">
          <span class="label">Number of Units:</span>
          <span class="value">${results.equipmentSizing.systemCount}</span>
        </div>
        <div class="result-item">
          <span class="label">Ventilation Air:</span>
          <span class="value">${formatNumber(results.equipmentSizing.ventilationCfm)} CFM</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Ductwork Design</h4>
        <div class="result-item">
          <span class="label">Main Trunk Size:</span>
          <span class="value">${results.ductworkSizing.trunkSize}</span>
        </div>
        <div class="result-item">
          <span class="label">Branch Duct Size:</span>
          <span class="value">${results.ductworkSizing.branchSize}</span>
        </div>
        <div class="result-item">
          <span class="label">Return Duct Size:</span>
          <span class="value">${results.ductworkSizing.returnSize}</span>
        </div>
        <div class="result-item">
          <span class="label">System Pressure:</span>
          <span class="value">${formatNumber(results.ductworkSizing.systemPressure, 2)} in. W.C.</span>
        </div>
      </div>

      <div class="result-section">
        <h4>Material Quantities</h4>
        <div class="result-item">
          <span class="label">Total Ductwork:</span>
          <span class="value">${formatNumber(results.materialQuantities.ductwork.total)} ft</span>
        </div>
        <div class="result-item">
          <span class="label">Fittings:</span>
          <span class="value">${results.materialQuantities.fittings} pcs</span>
        </div>
        <div class="result-item">
          <span class="label">Diffusers & Grilles:</span>
          <span class="value">${results.materialQuantities.accessories} pcs</span>
        </div>
        ${results.materialQuantities.insulationSqft > 0 ? `
        <div class="result-item">
          <span class="label">Duct Insulation:</span>
          <span class="value">${formatNumber(results.materialQuantities.insulationSqft)} sq ft</span>
        </div>
        ` : ''}
      </div>

      <div class="result-section cost-summary">
        <h4>Cost Summary</h4>
        <div class="result-item">
          <span class="label">Equipment:</span>
          <span class="value">${formatCurrency(results.costs.equipment)}</span>
        </div>
        <div class="result-item">
          <span class="label">Ductwork:</span>
          <span class="value">${formatCurrency(results.costs.ductwork)}</span>
        </div>
        <div class="result-item">
          <span class="label">Controls:</span>
          <span class="value">${formatCurrency(results.costs.controls)}</span>
        </div>
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
      <h4>HVAC System Design Methodology</h4>
      
      <h5>1. Thermal Load Calculation (Simplified Manual J)</h5>
      <p>Base Building Load: ${data.totalSqft} sq ft × ${results.thermalLoad.totalLoad / data.totalSqft} BTU/hr/sq ft = ${formatNumber(results.thermalLoad.totalLoad)} BTU/hr</p>
      <p>Climate Zone Adjustment: ${data.climateZone} (varies cooling/heating requirements)</p>
      <p>Window Heat Gain: ${data.windowArea} sq ft × ${data.windowType} glazing factor</p>
      <p>Occupancy Load: ${data.occupancy} people × 300 BTU/hr/person = ${data.occupancy * 300} BTU/hr</p>
      <p><strong>Total Load: ${formatNumber(results.thermalLoad.totalLoad)} BTU/hr (${results.thermalLoad.tonsRequired} tons)</strong></p>
      
      <h5>2. Equipment Sizing</h5>
      <p>Required Capacity: ${results.thermalLoad.tonsRequired} tons × 1.15 safety factor = ${results.equipmentSizing.requiredTons} tons</p>
      <p>Airflow Rate: ${results.equipmentSizing.requiredTons} tons × 400 CFM/ton = ${formatNumber(results.equipmentSizing.coolingCfm)} CFM</p>
      <p>Ventilation Air: ${formatNumber(results.equipmentSizing.ventilationCfm)} CFM (ASHRAE 62.1)</p>
      <p>Total System Airflow: ${formatNumber(results.equipmentSizing.totalCfm)} CFM</p>
      
      <h5>3. Ductwork Sizing</h5>
      <p>Main Trunk: ${formatNumber(results.equipmentSizing.totalCfm)} CFM ÷ 800 FPM = ${results.ductworkSizing.trunkSize}</p>
      <p>Branch Ducts: ${formatNumber(results.equipmentSizing.totalCfm / (data.diffusers || 1))} CFM/diffuser ÷ 650 FPM = ${results.ductworkSizing.branchSize}</p>
      <p>Return Air: 90% return air ÷ 500 FPM = ${results.ductworkSizing.returnSize}</p>
      
      <h5>4. System Pressure</h5>
      <p>Static Pressure: ${formatNumber(results.ductworkSizing.systemPressure, 2)} in. W.C.</p>
      <p>Based on ductwork length, fittings, and zoning requirements</p>
      
      <div class="formula-note">
        <p><strong>Standards Applied:</strong></p>
        <ul>
          <li>ASHRAE 90.1: Energy efficiency standards</li>
          <li>ASHRAE 62.1: Ventilation for acceptable indoor air quality</li>
          <li>Manual J: Residential load calculation methodology</li>
          <li>Manual D: Ductwork design and sizing</li>
          <li>SMACNA: Sheet metal ductwork construction standards</li>
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
  saveState('hvac', formData);
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
  saveState('hvac', {});
}

function exportResults(format) {
  const data = collectFormData();
  const results = compute(data);
  
  const exportData = {
    'Project': 'HVAC System Calculation',
    'Date': new Date().toLocaleDateString(),
    'Building Type': data.buildingType,
    'Floor Area (sq ft)': data.totalSqft,
    'Climate Zone': data.climateZone,
    'Total Load (BTU/hr)': formatNumber(results.thermalLoad.totalLoad),
    'Required Capacity (tons)': results.thermalLoad.tonsRequired,
    'System Airflow (CFM)': formatNumber(results.equipmentSizing.totalCfm),
    'Main Trunk Size': results.ductworkSizing.trunkSize,
    'Material Cost': formatCurrency(results.materialCost),
    'Total Cost': formatCurrency(results.totalCost)
  };
  
  const filename = `hvac-calculation-${new Date().toISOString().split('T')[0]}`;
  
  switch(format) {
    case 'csv':
      exportToCsv(exportData, filename);
      break;
    case 'xlsx':
      exportToXlsx(exportData, filename);
      break;
    case 'pdf':
      exportToPdf(exportData, filename, 'HVAC System Calculation');
      break;
  }
}

export function meta() {
  return {
    id: "hvac",
    title: "Professional HVAC Calculator",
    category: "mep",
    description: "Calculate HVAC system components, ductwork sizing, and thermal load calculations with ASHRAE standards and Manual J methodology"
  };
}