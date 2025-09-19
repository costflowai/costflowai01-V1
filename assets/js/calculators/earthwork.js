// Earthwork Calculator
// Calculate cut/fill volumes, truckloads, and haul distances

import { FormBinder, setupExportHandlers } from '../core/ui.js';
import { initPricing, calculateCost } from '../core/pricing.js';
import { saveState, loadState } from '../core/store.js';
import { formatCurrency, formatNumber, calculateArea, calculateVolume } from '../core/units.js';
import { bus, EVENTS } from '../core/bus.js';

class EarthworkCalculator {
  constructor() {
    this.name = 'earthwork-calculator';
    this.version = '1.0';
    this.form = null;
    this.formBinder = null;
    this.results = null;
    this.state = this.getInitialState();
  }

  async init() {
    try {
      await initPricing('us');

      this.form = document.getElementById('earthwork-calculator-form');
      if (!this.form) {
        throw new Error('Earthwork calculator form not found');
      }

      this.formBinder = new FormBinder(this.form, this);
      this.formBinder.init({
        schema: this.getValidationSchema(),
        autoCalculate: false
      });

      setupExportHandlers(this);
      this.loadSavedState();
      this.setupEventListeners();

      bus.emit(EVENTS.CALCULATOR_LOADED, { calculator: this.name });
      return true;
    } catch (error) {
      console.error('Failed to initialize earthwork calculator:', error);
      return false;
    }
  }

  getValidationSchema() {
    return {
      length: [
        { type: 'required', message: 'Length is required' },
        { type: 'number', min: 1, max: 10000, message: 'Length must be between 1-10000 feet' }
      ],
      width: [
        { type: 'required', message: 'Width is required' },
        { type: 'number', min: 1, max: 10000, message: 'Width must be between 1-10000 feet' }
      ],
      cutDepth: [
        { type: 'number', min: 0, max: 50, message: 'Cut depth must be between 0-50 feet' }
      ],
      fillDepth: [
        { type: 'number', min: 0, max: 50, message: 'Fill depth must be between 0-50 feet' }
      ],
      haulDistance: [
        { type: 'required', message: 'Haul distance is required' },
        { type: 'number', min: 0, max: 100, message: 'Haul distance must be between 0-100 miles' }
      ],
      truckCapacity: [
        { type: 'required', message: 'Truck capacity is required' },
        { type: 'number', min: 8, max: 20, message: 'Truck capacity must be between 8-20 cubic yards' }
      ],
      soilType: [
        { type: 'required', message: 'Soil type is required' },
        { type: 'select', choices: ['clay', 'sand', 'gravel', 'mixed'], message: 'Please select a valid soil type' }
      ],
      includeLabor: [
        { type: 'select', choices: ['yes', 'no'], message: 'Please specify if labor should be included' }
      ]
    };
  }

  async calculate(formData) {
    try {
      const inputs = this.parseInputs(formData);
      this.validateInputs(inputs);

      const calculations = this.calculateVolumes(inputs);
      const trucking = this.calculateTrucking(calculations, inputs);
      const costs = this.calculateCosts(calculations, trucking, inputs);

      this.results = {
        inputs,
        calculations,
        trucking,
        costs,
        timestamp: new Date().toISOString()
      };

      this.saveCurrentState();

      return {
        calculations: this.formatCalculationsForDisplay(calculations),
        trucking: this.formatTruckingForDisplay(trucking),
        costs: this.formatCostsForDisplay(costs)
      };

    } catch (error) {
      console.error('Earthwork calculation error:', error);
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }

  parseInputs(formData) {
    return {
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      cutDepth: parseFloat(formData.cutDepth) || 0,
      fillDepth: parseFloat(formData.fillDepth) || 0,
      haulDistance: parseFloat(formData.haulDistance) || 5,
      truckCapacity: parseFloat(formData.truckCapacity) || 12,
      soilType: formData.soilType || 'mixed',
      includeLabor: formData.includeLabor === 'yes',
      includeCompaction: formData.includeCompaction !== 'no',
      includeTopsoil: formData.includeTopsoil === 'yes'
    };
  }

  validateInputs(inputs) {
    if (inputs.length <= 0 || inputs.width <= 0) {
      throw new Error('Length and width must be greater than 0');
    }
    if (inputs.cutDepth === 0 && inputs.fillDepth === 0) {
      throw new Error('Either cut depth or fill depth must be greater than 0');
    }
    if (inputs.haulDistance < 0) {
      throw new Error('Haul distance cannot be negative');
    }
  }

  calculateVolumes(inputs) {
    const area = calculateArea(inputs.length, inputs.width);

    // Calculate cut volume
    const cutVolume = inputs.cutDepth > 0 ? calculateVolume(inputs.length, inputs.width, inputs.cutDepth) : 0;
    const cutVolumeYards = cutVolume / 27; // Convert to cubic yards

    // Calculate fill volume
    const fillVolume = inputs.fillDepth > 0 ? calculateVolume(inputs.length, inputs.width, inputs.fillDepth) : 0;
    const fillVolumeYards = fillVolume / 27; // Convert to cubic yards

    // Soil factors for volume adjustments
    const soilFactors = {
      clay: { swell: 1.25, shrinkage: 0.95 },
      sand: { swell: 1.15, shrinkage: 0.90 },
      gravel: { swell: 1.20, shrinkage: 0.85 },
      mixed: { swell: 1.20, shrinkage: 0.90 }
    };

    const factor = soilFactors[inputs.soilType];

    // Adjust volumes for soil characteristics
    const cutVolumeLoose = cutVolumeYards * factor.swell; // Volume when excavated (loose)
    const fillVolumeCompacted = fillVolumeYards / factor.shrinkage; // Volume needed before compaction

    // Net volume calculation
    const netCutFill = cutVolumeYards - fillVolumeYards;
    const excessCut = netCutFill > 0 ? netCutFill : 0;
    const importFill = netCutFill < 0 ? Math.abs(netCutFill) : 0;

    return {
      area,
      cutVolume: cutVolumeYards,
      fillVolume: fillVolumeYards,
      cutVolumeLoose,
      fillVolumeCompacted,
      netCutFill,
      excessCut,
      importFill,
      soilFactor: factor
    };
  }

  calculateTrucking(calculations, inputs) {
    // Calculate truck loads needed
    const excessLoads = calculations.excessCut > 0
      ? Math.ceil(calculations.cutVolumeLoose / inputs.truckCapacity)
      : 0;

    const importLoads = calculations.importFill > 0
      ? Math.ceil(calculations.fillVolumeCompacted / inputs.truckCapacity)
      : 0;

    // Calculate round trips and total miles
    const totalLoads = Math.max(excessLoads, importLoads);
    const totalMiles = totalLoads * inputs.haulDistance * 2; // Round trip

    // Estimate trucking time (assume 30 mph average + loading/unloading)
    const hoursPerLoad = (inputs.haulDistance * 2) / 30 + 0.5; // 0.5 hr for loading/unloading
    const totalHours = totalLoads * hoursPerLoad;

    return {
      excessLoads,
      importLoads,
      totalLoads,
      totalMiles,
      totalHours,
      haulDistance: inputs.haulDistance,
      truckCapacity: inputs.truckCapacity
    };
  }

  calculateCosts(calculations, trucking, inputs) {
    const materials = [];
    let laborCost = 0;
    const laborItems = [];

    // Excavation costs
    if (calculations.cutVolume > 0) {
      const excavationCost = calculateCost('earthwork', 'excavation', calculations.cutVolume, 'per_cubic_yard');
      materials.push({
        name: 'Excavation',
        quantity: calculations.cutVolume,
        unit: 'cubic yards',
        cost: excavationCost.totalCost,
        unitPrice: excavationCost.unitPrice
      });

      if (inputs.includeLabor) {
        laborItems.push({
          label: 'Excavation Labor',
          amount: excavationCost.totalCost * 0.6 // 60% of excavation cost is typically labor
        });
      }
    }

    // Fill material costs
    if (calculations.importFill > 0) {
      const fillCost = calculateCost('earthwork', 'fill_material', calculations.fillVolumeCompacted, 'per_cubic_yard');
      materials.push({
        name: 'Engineered Fill Material',
        quantity: calculations.fillVolumeCompacted,
        unit: 'cubic yards',
        cost: fillCost.totalCost,
        unitPrice: fillCost.unitPrice
      });
    }

    // Topsoil if requested
    if (inputs.includeTopsoil) {
      const topsoilVolume = calculations.area * (6 / 12) / 27; // 6" of topsoil
      const topsoilCost = calculateCost('earthwork', 'topsoil', topsoilVolume, 'per_cubic_yard');
      materials.push({
        name: 'Topsoil (6" depth)',
        quantity: topsoilVolume,
        unit: 'cubic yards',
        cost: topsoilCost.totalCost,
        unitPrice: topsoilCost.unitPrice
      });
    }

    // Trucking costs
    if (trucking.totalLoads > 0) {
      let truckingCost;
      if (inputs.haulDistance <= 10) {
        truckingCost = calculateCost('earthwork', 'trucking_10_miles', trucking.totalLoads, 'per_cubic_yard');
      } else {
        const baseCost = calculateCost('earthwork', 'trucking_10_miles', trucking.totalLoads, 'per_cubic_yard');
        const extraMiles = inputs.haulDistance - 10;
        const extraCost = calculateCost('earthwork', 'trucking_per_mile', trucking.totalLoads * extraMiles, 'per_cubic_yard_mile');
        truckingCost = {
          totalCost: baseCost.totalCost + extraCost.totalCost,
          unitPrice: (baseCost.totalCost + extraCost.totalCost) / trucking.totalLoads
        };
      }

      materials.push({
        name: `Trucking (${inputs.haulDistance} miles)`,
        quantity: trucking.totalLoads,
        unit: 'loads',
        cost: truckingCost.totalCost,
        unitPrice: truckingCost.unitPrice
      });
    }

    // Compaction costs
    if (inputs.includeCompaction && calculations.fillVolume > 0) {
      const compactionCost = calculateCost('earthwork', 'compaction', calculations.fillVolume, 'per_cubic_yard');
      materials.push({
        name: 'Mechanical Compaction',
        quantity: calculations.fillVolume,
        unit: 'cubic yards',
        cost: compactionCost.totalCost,
        unitPrice: compactionCost.unitPrice
      });

      if (inputs.includeLabor) {
        laborItems.push({
          label: 'Compaction Labor',
          amount: compactionCost.totalCost * 0.8 // 80% of compaction cost is typically labor/equipment
        });
      }
    }

    const materialsCost = materials.reduce((sum, material) => sum + material.cost, 0);
    laborCost = laborItems.reduce((sum, item) => sum + item.amount, 0);

    const subtotal = materialsCost + laborCost;
    const overhead = subtotal * 0.15; // 15% overhead
    const profit = subtotal * 0.10; // 10% profit
    const total = subtotal + overhead + profit;

    const costItems = [
      { label: 'Materials & Equipment', amount: materialsCost }
    ];

    if (inputs.includeLabor) {
      costItems.push({ label: 'Labor', amount: laborCost });
    }

    costItems.push(
      { label: 'Overhead (15%)', amount: overhead },
      { label: 'Profit (10%)', amount: profit }
    );

    return {
      materials: materialsCost,
      labor: laborCost,
      subtotal,
      overhead,
      profit,
      total,
      items: costItems,
      materialsList: materials
    };
  }

  formatCalculationsForDisplay(calculations) {
    return {
      'Project Area': `${formatNumber(calculations.area)} sq ft`,
      'Cut Volume': `${formatNumber(calculations.cutVolume, 1)} cubic yards`,
      'Fill Volume': `${formatNumber(calculations.fillVolume, 1)} cubic yards`,
      'Net Cut/Fill': `${formatNumber(Math.abs(calculations.netCutFill), 1)} CY ${calculations.netCutFill >= 0 ? 'excess' : 'import'}`,
      'Loose Volume (Cut)': `${formatNumber(calculations.cutVolumeLoose, 1)} cubic yards`
    };
  }

  formatTruckingForDisplay(trucking) {
    return {
      'Total Truck Loads': `${trucking.totalLoads} loads`,
      'Total Miles': `${formatNumber(trucking.totalMiles)} miles`,
      'Estimated Hours': `${formatNumber(trucking.totalHours, 1)} hours`,
      'Truck Capacity': `${trucking.truckCapacity} cubic yards`
    };
  }

  formatCostsForDisplay(costs) {
    return {
      items: costs.items.map(item => ({
        label: item.label,
        amount: item.amount
      })),
      total: costs.total
    };
  }

  getExportData() {
    if (!this.results) {
      throw new Error('No calculation results available for export');
    }

    const { calculations, trucking, costs } = this.results;

    const table = [
      ['Earthwork Calculator Results'],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['PROJECT CALCULATIONS'],
      ['Metric', 'Value'],
      ['Project Area', `${formatNumber(calculations.area)} sq ft`],
      ['Cut Volume', `${formatNumber(calculations.cutVolume, 1)} cubic yards`],
      ['Fill Volume', `${formatNumber(calculations.fillVolume, 1)} cubic yards`],
      ['Net Cut/Fill', `${formatNumber(Math.abs(calculations.netCutFill), 1)} CY ${calculations.netCutFill >= 0 ? 'excess' : 'import'}`],
      [''],
      ['TRUCKING ANALYSIS'],
      ['Total Loads', `${trucking.totalLoads} loads`],
      ['Total Miles', `${formatNumber(trucking.totalMiles)} miles`],
      ['Estimated Hours', `${formatNumber(trucking.totalHours, 1)} hours`],
      [''],
      ['MATERIALS'],
      ['Item', 'Quantity', 'Unit', 'Unit Price', 'Total Cost'],
      ...costs.materialsList.map(m => [
        m.name,
        formatNumber(m.quantity, 1),
        m.unit,
        formatCurrency(m.unitPrice),
        formatCurrency(m.cost)
      ]),
      [''],
      ['COST BREAKDOWN'],
      ['Category', 'Amount'],
      ...costs.items.map(item => [item.label, formatCurrency(item.amount)]),
      [''],
      ['TOTAL PROJECT COST', formatCurrency(costs.total)]
    ];

    return {
      table,
      title: 'Earthwork Calculator Results'
    };
  }

  getEmailData() {
    if (!this.results) {
      throw new Error('No calculation results available for email');
    }

    const subject = 'Earthwork Calculator Results';
    const body = `Earthwork Calculator Results

Project Summary:
- Project Area: ${formatNumber(this.results.calculations.area)} sq ft
- Cut Volume: ${formatNumber(this.results.calculations.cutVolume, 1)} cubic yards
- Fill Volume: ${formatNumber(this.results.calculations.fillVolume, 1)} cubic yards
- Total Cost: ${formatCurrency(this.results.costs.total)}

Generated by CostFlowAI Calculator
${window.location.href}`;

    return { subject, body };
  }

  getState() {
    return {
      inputs: this.state.inputs,
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  loadSavedState() {
    const saved = loadState(this.name);
    if (saved && saved.inputs) {
      this.state.inputs = saved.inputs;
      this.populateForm(saved.inputs);
    }
  }

  saveCurrentState() {
    this.state.results = this.results;
    saveState(this.name, this.state);
  }

  populateForm(inputs) {
    if (!this.form) return;

    Object.entries(inputs).forEach(([key, value]) => {
      const input = this.form.querySelector(`[name="${key}"], #${key}`);
      if (input) {
        input.value = value;
      }
    });
  }

  getInitialState() {
    return {
      inputs: {
        length: '',
        width: '',
        cutDepth: '0',
        fillDepth: '0',
        haulDistance: '5',
        truckCapacity: '12',
        soilType: 'mixed',
        includeLabor: 'yes'
      },
      results: null
    };
  }

  setupEventListeners() {
    bus.on(EVENTS.PRICING_UPDATED, () => {
      console.log('Pricing data updated');
    });

    bus.on(EVENTS.FORM_CHANGED, (data) => {
      if (data.form === 'earthwork-calculator-form') {
        this.state.inputs[data.field] = data.value;
      }
    });
  }
}

// Legacy API for compatibility
export function init(el) {
  const calculator = new EarthworkCalculator();
  calculator.init().then(success => {
    if (success) {
      console.log('Earthwork calculator initialized');
    }
  });
}

export function compute(state) {
  // ROM calculation for testing: 100 CY @ 10 mi → trucks > 0
  const cutVolume = parseFloat(state.cutVolume) || 0;
  const truckCapacity = parseFloat(state.truckCapacity) || 12;
  const haulDistance = parseFloat(state.haulDistance) || 10;

  if (cutVolume > 0) {
    const trucksNeeded = Math.ceil(cutVolume / truckCapacity);
    return {
      ok: true,
      trucksNeeded,
      message: `${trucksNeeded} truck loads needed for ${cutVolume} CY at ${haulDistance} miles`
    };
  }

  return { ok: false, msg: "No cut volume specified" };
}

export function explain(state) {
  return "Professional earthwork calculator for cut/fill analysis, trucking requirements, and cost estimation with soil type adjustments and haul distance calculations.";
}

export function meta() {
  return {
    id: "earthwork",
    title: "Earthwork Calculator",
    category: "sitework",
    description: "Calculate cut/fill volumes, truck loads, haul distances, and earthwork costs",
    features: [
      "Cut and fill volume calculations",
      "Soil type adjustments (swell/shrinkage)",
      "Trucking analysis with haul distances",
      "Labor and equipment cost estimation",
      "Export to CSV/Excel/PDF",
      "Compaction and topsoil options"
    ]
  };
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const calculator = new EarthworkCalculator();
  const initialized = await calculator.init();

  if (initialized) {
    console.log('Earthwork Calculator initialized successfully');
    window.earthworkCalculator = calculator;
  } else {
    console.error('Failed to initialize Earthwork Calculator');
  }
});

export { EarthworkCalculator };