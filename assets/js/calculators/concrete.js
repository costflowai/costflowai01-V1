// Concrete Slab Pro Calculator
// Comprehensive concrete slab calculation with business logic

import { FormBinder, setupExportHandlers } from '../core/ui.js';
import { initPricing, getConcretePricing, getRebarPricing, getLaborPricing, calculateCost } from '../core/pricing.js';
import { saveState, loadState } from '../core/store.js';
import { calculateConcreteVolume, addWaste, calculateArea, calculatePerimeter, formatCurrency, formatNumber, feetToInches, inchesToFeet } from '../core/units.js';
import { COMMON_SCHEMAS } from '../core/validate.js';
import { bus, EVENTS } from '../core/bus.js';

class ConcreteSlabCalculator {
  constructor() {
    this.name = 'concrete-slab-pro';
    this.version = '1.0';
    this.form = null;
    this.formBinder = null;
    this.results = null;
    this.state = this.getInitialState();
  }

  /**
   * Initialize the calculator
   */
  async init() {
    try {
      // Initialize pricing
      await initPricing('us');

      // Get form element
      this.form = document.getElementById('concrete-calculator-form');
      if (!this.form) {
        throw new Error('Concrete calculator form not found');
      }

      // Setup form binding
      this.formBinder = new FormBinder(this.form, this);
      this.formBinder.init({
        schema: this.getValidationSchema(),
        autoCalculate: false
      });

      // Setup export handlers
      setupExportHandlers(this);

      // Load saved state
      this.loadSavedState();

      // Setup event listeners
      this.setupEventListeners();

      bus.emit(EVENTS.CALCULATOR_LOADED, { calculator: this.name });

      return true;
    } catch (error) {
      console.error('Failed to initialize concrete calculator:', error);
      return false;
    }
  }

  /**
   * Get validation schema for the form
   */
  getValidationSchema() {
    return {
      length: [
        { type: 'required', message: 'Length is required' },
        { type: 'measurement', min: 1, max: 1000, units: 'ft', message: 'Length must be between 1-1000 feet' }
      ],
      width: [
        { type: 'required', message: 'Width is required' },
        { type: 'measurement', min: 1, max: 1000, units: 'ft', message: 'Width must be between 1-1000 feet' }
      ],
      thickness: [
        { type: 'required', message: 'Thickness is required' },
        { type: 'number', min: 2, max: 24, message: 'Thickness must be between 2-24 inches' }
      ],
      concreteStrength: [
        { type: 'required', message: 'Concrete strength is required' },
        { type: 'select', choices: ['3000', '4000', '5000'], message: 'Please select a valid concrete strength' }
      ],
      waste: [
        { type: 'number', min: 0, max: 50, message: 'Waste must be between 0-50%' }
      ],
      rebarGrid: [
        { type: 'select', choices: ['none', '12', '18', '24'], message: 'Please select a rebar grid option' }
      ],
      rebarSize: [
        { type: 'select', choices: ['3', '4', '5'], message: 'Please select a rebar size' }
      ],
      includeLabor: [
        { type: 'select', choices: ['yes', 'no'], message: 'Please specify if labor should be included' }
      ],
      addFiberMesh: [
        { type: 'select', choices: ['yes', 'no'], message: 'Please specify if fiber mesh should be added' }
      ]
    };
  }

  /**
   * Main calculation function
   */
  async calculate(formData) {
    try {
      // Parse inputs
      const inputs = this.parseInputs(formData);

      // Validate inputs
      this.validateInputs(inputs);

      // Calculate dimensions and volumes
      const calculations = this.calculateDimensions(inputs);

      // Calculate materials
      const materials = this.calculateMaterials(calculations, inputs);

      // Calculate costs
      const costs = this.calculateCosts(materials, calculations, inputs);

      // Store results
      this.results = {
        inputs,
        calculations,
        materials,
        costs,
        timestamp: new Date().toISOString()
      };

      // Save state
      this.saveCurrentState();

      return {
        calculations: this.formatCalculationsForDisplay(calculations),
        materials: this.formatMaterialsForDisplay(materials),
        costs: this.formatCostsForDisplay(costs)
      };

    } catch (error) {
      console.error('Calculation error:', error);
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }

  /**
   * Parse form inputs
   */
  parseInputs(formData) {
    return {
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      thickness: parseFloat(formData.thickness) || 4,
      concreteStrength: formData.concreteStrength || '4000',
      waste: parseFloat(formData.waste) || 5,
      rebarGrid: formData.rebarGrid || 'none',
      rebarSize: formData.rebarSize || '4',
      includeLabor: formData.includeLabor === 'yes',
      addFiberMesh: formData.addFiberMesh === 'yes',
      includeDelivery: formData.includeDelivery !== 'no',
      pumpRequired: formData.pumpRequired === 'yes'
    };
  }

  /**
   * Validate parsed inputs
   */
  validateInputs(inputs) {
    if (inputs.length <= 0 || inputs.width <= 0) {
      throw new Error('Length and width must be greater than 0');
    }
    if (inputs.thickness < 2 || inputs.thickness > 24) {
      throw new Error('Thickness must be between 2 and 24 inches');
    }
    if (inputs.waste < 0 || inputs.waste > 50) {
      throw new Error('Waste percentage must be between 0 and 50');
    }
  }

  /**
   * Calculate dimensions and volumes
   */
  calculateDimensions(inputs) {
    const area = calculateArea(inputs.length, inputs.width);
    const perimeter = calculatePerimeter(inputs.length, inputs.width);
    const volumeCubicYards = calculateConcreteVolume(inputs.length, inputs.width, inputs.thickness);
    const volumeWithWaste = addWaste(volumeCubicYards, inputs.waste);

    // Calculate loads needed (10 yard standard truck)
    const trucksNeeded = Math.ceil(volumeWithWaste / 10);

    return {
      area,
      perimeter,
      volumeCubicYards,
      volumeWithWaste,
      trucksNeeded,
      thicknessFeet: inchesToFeet(inputs.thickness)
    };
  }

  /**
   * Calculate materials needed
   */
  calculateMaterials(calculations, inputs) {
    const materials = [];

    // Concrete
    const concreteType = `ready_mix_${inputs.concreteStrength}psi`;
    const concreteCost = calculateCost('concrete', concreteType, calculations.volumeWithWaste, 'per_cubic_yard');

    materials.push({
      name: `${inputs.concreteStrength} PSI Ready-Mix Concrete`,
      quantity: calculations.volumeWithWaste,
      unit: 'cubic yards',
      cost: concreteCost.totalCost,
      unitPrice: concreteCost.unitPrice
    });

    // Fiber mesh (if selected)
    if (inputs.addFiberMesh) {
      const fiberCost = calculateCost('concrete', 'fiber_mesh', calculations.volumeWithWaste, 'per_cubic_yard');
      materials.push({
        name: 'Fiber Mesh Additive',
        quantity: calculations.volumeWithWaste,
        unit: 'cubic yards',
        cost: fiberCost.totalCost,
        unitPrice: fiberCost.unitPrice
      });
    }

    // Rebar (if selected)
    if (inputs.rebarGrid !== 'none') {
      const rebarMaterials = this.calculateRebarMaterials(calculations, inputs);
      materials.push(...rebarMaterials);
    }

    // Delivery
    if (inputs.includeDelivery) {
      const deliveryCost = calculateCost('concrete', 'delivery', calculations.trucksNeeded, 'per_load');
      materials.push({
        name: 'Concrete Delivery',
        quantity: calculations.trucksNeeded,
        unit: 'loads',
        cost: deliveryCost.totalCost,
        unitPrice: deliveryCost.unitPrice
      });
    }

    // Pump (if required)
    if (inputs.pumpRequired) {
      const pumpCost = calculateCost('equipment', 'concrete_pump', calculations.volumeWithWaste, 'per_cubic_yard');
      materials.push({
        name: 'Concrete Pump',
        quantity: calculations.volumeWithWaste,
        unit: 'cubic yards',
        cost: pumpCost.totalCost,
        unitPrice: pumpCost.unitPrice
      });
    }

    // Base materials
    const baseMaterials = this.calculateBaseMaterials(calculations);
    materials.push(...baseMaterials);

    return materials;
  }

  /**
   * Calculate rebar materials
   */
  calculateRebarMaterials(calculations, inputs) {
    const materials = [];
    const gridSpacing = parseInt(inputs.rebarGrid);
    const rebarSize = inputs.rebarSize;

    // Calculate grid layout
    const lengthBars = Math.floor(calculations.area / (inputs.width * (gridSpacing / 12))) + 1;
    const widthBars = Math.floor(calculations.area / (inputs.length * (gridSpacing / 12))) + 1;

    // Length direction rebar
    const lengthBarsFeet = lengthBars * inputs.length;
    const lengthRebarCost = calculateCost('rebar', `grade60_${rebarSize}`, lengthBarsFeet, 'per_linear_foot');

    materials.push({
      name: `#${rebarSize} Rebar (Length Direction)`,
      quantity: lengthBarsFeet,
      unit: 'linear feet',
      cost: lengthRebarCost.totalCost,
      unitPrice: lengthRebarCost.unitPrice
    });

    // Width direction rebar
    const widthBarsFeet = widthBars * inputs.width;
    const widthRebarCost = calculateCost('rebar', `grade60_${rebarSize}`, widthBarsFeet, 'per_linear_foot');

    materials.push({
      name: `#${rebarSize} Rebar (Width Direction)`,
      quantity: widthBarsFeet,
      unit: 'linear feet',
      cost: widthRebarCost.totalCost,
      unitPrice: widthRebarCost.unitPrice
    });

    // Tie wire (estimate 0.1 lb per intersection)
    const intersections = lengthBars * widthBars;
    const tieWireLbs = intersections * 0.1;
    const tieWireCost = calculateCost('rebar', 'tie_wire', tieWireLbs, 'per_pound');

    materials.push({
      name: 'Rebar Tie Wire',
      quantity: tieWireLbs,
      unit: 'pounds',
      cost: tieWireCost.totalCost,
      unitPrice: tieWireCost.unitPrice
    });

    // Rebar chairs (estimate 1 per 4 sq ft)
    const chairs = Math.ceil(calculations.area / 4);
    const chairsCost = calculateCost('rebar', 'chairs', chairs, 'per_piece');

    materials.push({
      name: 'Rebar Chairs',
      quantity: chairs,
      unit: 'pieces',
      cost: chairsCost.totalCost,
      unitPrice: chairsCost.unitPrice
    });

    return materials;
  }

  /**
   * Calculate base materials
   */
  calculateBaseMaterials(calculations) {
    const materials = [];

    // Gravel base (4" standard)
    const gravelCubicYards = calculations.area * (4/12) / 27;
    const gravelCost = calculateCost('materials', 'gravel_base', gravelCubicYards, 'per_cubic_yard');

    materials.push({
      name: '4" Gravel Base',
      quantity: gravelCubicYards,
      unit: 'cubic yards',
      cost: gravelCost.totalCost,
      unitPrice: gravelCost.unitPrice
    });

    // Vapor barrier
    const vaporBarrierCost = calculateCost('materials', 'vapor_barrier', calculations.area, 'per_square_foot');

    materials.push({
      name: '6-mil Vapor Barrier',
      quantity: calculations.area,
      unit: 'square feet',
      cost: vaporBarrierCost.totalCost,
      unitPrice: vaporBarrierCost.unitPrice
    });

    return materials;
  }

  /**
   * Calculate total costs
   */
  calculateCosts(materials, calculations, inputs) {
    const materialsCost = materials.reduce((sum, material) => sum + material.cost, 0);

    let laborCost = 0;
    const laborItems = [];

    if (inputs.includeLabor) {
      // Excavation
      const excavationCost = calculateCost('labor', 'excavation', calculations.area, 'per_square_foot');
      laborItems.push({
        label: 'Excavation & Grading',
        amount: excavationCost.totalCost
      });

      // Forming
      const formingCost = calculateCost('labor', 'forming', calculations.perimeter, 'per_linear_foot');
      laborItems.push({
        label: 'Form Setup & Stripping',
        amount: formingCost.totalCost
      });

      // Concrete placement
      const placementCost = calculateCost('labor', 'concrete_placement', calculations.volumeWithWaste, 'per_cubic_yard');
      laborItems.push({
        label: 'Concrete Placement',
        amount: placementCost.totalCost
      });

      // Finishing
      const finishingCost = calculateCost('labor', 'finishing', calculations.area, 'per_square_foot');
      laborItems.push({
        label: 'Concrete Finishing',
        amount: finishingCost.totalCost
      });

      laborCost = laborItems.reduce((sum, item) => sum + item.amount, 0);
    }

    const subtotal = materialsCost + laborCost;

    // Calculate overhead percentages
    const gcMarkup = subtotal * 0.15; // 15% GC markup
    const profit = subtotal * 0.10;   // 10% profit
    const bondInsurance = subtotal * 0.025; // 2.5% bond/insurance

    const permits = 125; // Flat permit fee

    const total = subtotal + gcMarkup + profit + bondInsurance + permits;

    const costItems = [
      { label: 'Materials', amount: materialsCost }
    ];

    if (inputs.includeLabor) {
      costItems.push({ label: 'Labor', amount: laborCost });
    }

    costItems.push(
      { label: 'General Contractor (15%)', amount: gcMarkup },
      { label: 'Profit (10%)', amount: profit },
      { label: 'Bond & Insurance (2.5%)', amount: bondInsurance },
      { label: 'Permits', amount: permits }
    );

    return {
      materials: materialsCost,
      labor: laborCost,
      subtotal,
      gcMarkup,
      profit,
      bondInsurance,
      permits,
      total,
      items: costItems,
      laborItems
    };
  }

  /**
   * Format calculations for display
   */
  formatCalculationsForDisplay(calculations) {
    return {
      'Slab Area': `${formatNumber(calculations.area)} sq ft`,
      'Perimeter': `${formatNumber(calculations.perimeter)} ft`,
      'Concrete Volume': `${formatNumber(calculations.volumeCubicYards, 2)} cubic yards`,
      'With Waste': `${formatNumber(calculations.volumeWithWaste, 2)} cubic yards`,
      'Delivery Trucks': `${calculations.trucksNeeded} loads`
    };
  }

  /**
   * Format materials for display
   */
  formatMaterialsForDisplay(materials) {
    return materials.map(material => ({
      name: material.name,
      quantity: formatNumber(material.quantity, 2),
      unit: material.unit,
      cost: material.cost
    }));
  }

  /**
   * Format costs for display
   */
  formatCostsForDisplay(costs) {
    return {
      items: costs.items.map(item => ({
        label: item.label,
        amount: item.amount
      })),
      total: costs.total
    };
  }

  /**
   * Get export data
   */
  getExportData() {
    if (!this.results) {
      throw new Error('No calculation results available for export');
    }

    const { calculations, materials, costs } = this.results;

    const table = [
      ['Concrete Slab Pro Calculator Results'],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['CALCULATIONS'],
      ['Metric', 'Value'],
      ...Object.entries(calculations).map(([key, value]) => [key, value]),
      [''],
      ['MATERIALS'],
      ['Item', 'Quantity', 'Unit', 'Unit Price', 'Total Cost'],
      ...materials.map(m => [
        m.name,
        formatNumber(m.quantity, 2),
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
      title: 'Concrete Slab Pro Calculator Results'
    };
  }

  /**
   * Get email data
   */
  getEmailData() {
    if (!this.results) {
      throw new Error('No calculation results available for email');
    }

    const subject = 'Concrete Slab Calculator Results';
    const body = `Concrete Slab Pro Calculator Results

Project Summary:
- Slab Area: ${formatNumber(this.results.calculations.area)} sq ft
- Concrete Volume: ${formatNumber(this.results.calculations.volumeWithWaste, 2)} cubic yards
- Total Cost: ${formatCurrency(this.results.costs.total)}

Generated by CostFlowAI Calculator
${window.location.href}`;

    return { subject, body };
  }

  /**
   * Get current state
   */
  getState() {
    return {
      inputs: this.state.inputs,
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Load saved state
   */
  loadSavedState() {
    const saved = loadState(this.name);
    if (saved && saved.inputs) {
      this.state.inputs = saved.inputs;
      // Populate form with saved values
      this.populateForm(saved.inputs);
    }
  }

  /**
   * Save current state
   */
  saveCurrentState() {
    this.state.results = this.results;
    saveState(this.name, this.state);
  }

  /**
   * Populate form with values
   */
  populateForm(inputs) {
    if (!this.form) return;

    Object.entries(inputs).forEach(([key, value]) => {
      const input = this.form.querySelector(`[name="${key}"], #${key}`);
      if (input) {
        input.value = value;
      }
    });
  }

  /**
   * Get initial state
   */
  getInitialState() {
    return {
      inputs: {
        length: '',
        width: '',
        thickness: '4',
        concreteStrength: '4000',
        waste: '5',
        rebarGrid: 'none',
        rebarSize: '4',
        includeLabor: 'yes',
        addFiberMesh: 'no'
      },
      results: null
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for pricing updates
    bus.on(EVENTS.PRICING_UPDATED, () => {
      console.log('Pricing data updated');
    });

    // Listen for form changes to update state
    bus.on(EVENTS.FORM_CHANGED, (data) => {
      if (data.form === 'concrete-calculator-form') {
        this.state.inputs[data.field] = data.value;
      }
    });
  }
}

// Legacy API for compatibility with existing system
export function init(el) {
  const calculator = new ConcreteSlabCalculator();
  calculator.init().then(success => {
    if (success) {
      console.log('Concrete calculator initialized');
    }
  });
}

export function compute(state) {
  // For now, return placeholder - full implementation uses new class
  return { ok: false, msg: "Use new ConcreteSlabCalculator class" };
}

export function explain(state) {
  return "Professional concrete slab calculator with material quantities, rebar layout, and comprehensive cost breakdown including labor, overhead, and regional pricing.";
}

export function meta() {
  return {
    id: "concrete",
    title: "Concrete Slab Pro",
    category: "structural",
    description: "Calculate concrete volume, rebar requirements, and total project costs for concrete slabs",
    features: [
      "Accurate concrete volume calculations",
      "Rebar grid layout and quantities",
      "Regional pricing integration",
      "Labor cost estimation",
      "Export to CSV/Excel/PDF",
      "Material waste calculations"
    ]
  };
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const calculator = new ConcreteSlabCalculator();
  const initialized = await calculator.init();

  if (initialized) {
    console.log('Concrete Slab Pro Calculator initialized successfully');
    // Make calculator available globally for debugging
    window.concreteCalculator = calculator;
  } else {
    console.error('Failed to initialize Concrete Slab Pro Calculator');
  }
});

export { ConcreteSlabCalculator };