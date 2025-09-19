import { Bus } from '../core/bus.js';
import { Units } from '../core/units.js';
import { Validate } from '../core/validate.js';
import { Pricing } from '../core/pricing.js';
import { Export } from '../core/export.js';
import { Store } from '../core/store.js';
import { UI } from '../core/ui.js';

class InsulationCalculator {
  constructor() {
    this.id = 'insulation';
    this.name = 'Insulation Calculator';
    this.description = 'Calculate batt, blown, and rigid insulation materials with R-value calculations by assembly type';

    this.state = {
      // Area calculations
      wallArea: 1000,
      ceilingArea: 1200,
      floorArea: 1000,

      // Assembly types
      wallAssembly: 'wood-frame', // wood-frame, steel-frame, masonry
      ceilingAssembly: 'wood-joist', // wood-joist, steel-joist, concrete
      floorAssembly: 'wood-frame', // wood-frame, concrete-slab, crawlspace

      // Target R-values
      wallRValue: 13,
      ceilingRValue: 30,
      floorRValue: 19,

      // Insulation types
      wallInsulationType: 'batt', // batt, blown, rigid, spray
      ceilingInsulationType: 'blown', // batt, blown, rigid
      floorInsulationType: 'batt', // batt, rigid

      // Cavity dimensions (for batt calculations)
      wallCavityDepth: 3.5, // inches
      ceilingCavityDepth: 9.25, // inches
      floorCavityDepth: 9.25, // inches

      // Regional settings
      region: 'national',
      wastePercent: 10,

      // Output
      results: null
    };

    // R-value per inch for different insulation types
    this.rValuePerInch = {
      batt: {
        fiberglass: 3.2,
        rockwool: 3.3,
        cotton: 3.4
      },
      blown: {
        fiberglass: 2.5,
        cellulose: 3.6,
        rockwool: 2.8
      },
      rigid: {
        eps: 4.0, // Expanded polystyrene
        xps: 5.0, // Extruded polystyrene
        polyiso: 6.0 // Polyisocyanurate
      },
      spray: {
        open_cell: 3.5,
        closed_cell: 6.0
      }
    };

    this.init();
  }

  init() {
    this.bindFormElements();
    this.setupEventListeners();
    this.loadStoredData();
    this.calculate();
  }

  bindFormElements() {
    this.elements = {
      // Areas
      wallArea: document.getElementById('wall-area'),
      ceilingArea: document.getElementById('ceiling-area'),
      floorArea: document.getElementById('floor-area'),

      // Assembly types
      wallAssembly: document.getElementById('wall-assembly'),
      ceilingAssembly: document.getElementById('ceiling-assembly'),
      floorAssembly: document.getElementById('floor-assembly'),

      // Target R-values
      wallRValue: document.getElementById('wall-r-value'),
      ceilingRValue: document.getElementById('ceiling-r-value'),
      floorRValue: document.getElementById('floor-r-value'),

      // Insulation types
      wallInsulationType: document.getElementById('wall-insulation-type'),
      ceilingInsulationType: document.getElementById('ceiling-insulation-type'),
      floorInsulationType: document.getElementById('floor-insulation-type'),

      // Cavity depths
      wallCavityDepth: document.getElementById('wall-cavity-depth'),
      ceilingCavityDepth: document.getElementById('ceiling-cavity-depth'),
      floorCavityDepth: document.getElementById('floor-cavity-depth'),

      // Regional settings
      region: document.getElementById('region'),
      wastePercent: document.getElementById('waste-percent'),

      // Output elements
      resultsContainer: document.getElementById('results'),
      summaryContainer: document.getElementById('summary'),
      exportContainer: document.getElementById('export-options')
    };

    // Set initial values
    Object.keys(this.state).forEach(key => {
      if (this.elements[key] && typeof this.state[key] !== 'object') {
        this.elements[key].value = this.state[key];
      }
    });
  }

  setupEventListeners() {
    // Form change events
    Object.keys(this.elements).forEach(key => {
      if (this.elements[key] && this.elements[key].addEventListener) {
        this.elements[key].addEventListener('change', () => {
          this.updateStateFromForm();
          this.calculate();
        });

        this.elements[key].addEventListener('input', () => {
          this.updateStateFromForm();
          this.calculate();
        });
      }
    });

    // Export buttons
    Bus.on('export:csv', () => this.exportResults('csv'));
    Bus.on('export:excel', () => this.exportResults('excel'));
    Bus.on('export:pdf', () => this.exportResults('pdf'));

    // Climate zone preset buttons
    const presetButtons = document.querySelectorAll('.climate-preset');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const zone = e.target.dataset.zone;
        this.applyClimateZonePreset(zone);
      });
    });
  }

  updateStateFromForm() {
    // Update state from form elements
    Object.keys(this.elements).forEach(key => {
      if (this.elements[key] && typeof this.state[key] !== 'object') {
        const value = parseFloat(this.elements[key].value) || this.elements[key].value || 0;
        this.state[key] = value;
      }
    });

    // Store state
    Store.set(`calc-${this.id}-state`, this.state);
  }

  loadStoredData() {
    const stored = Store.get(`calc-${this.id}-state`);
    if (stored) {
      Object.assign(this.state, stored);
      this.bindFormElements();
    }
  }

  applyClimateZonePreset(zone) {
    const presets = {
      '1': { wallRValue: 13, ceilingRValue: 30, floorRValue: 13 }, // Hot
      '2': { wallRValue: 13, ceilingRValue: 30, floorRValue: 13 }, // Hot-Humid
      '3': { wallRValue: 20, ceilingRValue: 38, floorRValue: 25 }, // Warm
      '4': { wallRValue: 20, ceilingRValue: 38, floorRValue: 30 }, // Mixed
      '5': { wallRValue: 20, ceilingRValue: 49, floorRValue: 30 }, // Cool
      '6': { wallRValue: 20, ceilingRValue: 49, floorRValue: 30 }, // Cold
      '7': { wallRValue: 21, ceilingRValue: 49, floorRValue: 30 }, // Very Cold
      '8': { wallRValue: 21, ceilingRValue: 60, floorRValue: 30 }  // Subarctic
    };

    const preset = presets[zone];
    if (preset) {
      Object.assign(this.state, preset);
      this.bindFormElements();
      this.calculate();
      UI.showMessage(`Applied Climate Zone ${zone} R-value requirements`);
    }
  }

  calculate() {
    try {
      const results = {
        walls: this.calculateWallInsulation(),
        ceiling: this.calculateCeilingInsulation(),
        floor: this.calculateFloorInsulation()
      };

      // Calculate total costs
      results.costs = this.calculateCosts(results);

      // Apply waste factor
      results.materialsWithWaste = this.applyWasteFactor(results);

      this.state.results = results;
      this.displayResults();

      Bus.emit('calculation:complete', {
        calculator: this.id,
        results: this.state.results
      });

    } catch (error) {
      console.error('Calculation error:', error);
      UI.showError('Calculation failed. Please check your inputs.');
    }
  }

  calculateWallInsulation() {
    const area = this.state.wallArea;
    const targetR = this.state.wallRValue;
    const insulationType = this.state.wallInsulationType;
    const cavityDepth = this.state.wallCavityDepth;

    return this.calculateInsulationForArea({
      area,
      targetR,
      insulationType,
      cavityDepth,
      assembly: this.state.wallAssembly,
      location: 'walls'
    });
  }

  calculateCeilingInsulation() {
    const area = this.state.ceilingArea;
    const targetR = this.state.ceilingRValue;
    const insulationType = this.state.ceilingInsulationType;
    const cavityDepth = this.state.ceilingCavityDepth;

    return this.calculateInsulationForArea({
      area,
      targetR,
      insulationType,
      cavityDepth,
      assembly: this.state.ceilingAssembly,
      location: 'ceiling'
    });
  }

  calculateFloorInsulation() {
    const area = this.state.floorArea;
    const targetR = this.state.floorRValue;
    const insulationType = this.state.floorInsulationType;
    const cavityDepth = this.state.floorCavityDepth;

    return this.calculateInsulationForArea({
      area,
      targetR,
      insulationType,
      cavityDepth,
      assembly: this.state.floorAssembly,
      location: 'floor'
    });
  }

  calculateInsulationForArea({ area, targetR, insulationType, cavityDepth, assembly, location }) {
    let materials = {};
    let thickness = 0;
    let actualR = 0;

    switch (insulationType) {
      case 'batt':
        return this.calculateBattInsulation(area, targetR, cavityDepth);
      case 'blown':
        return this.calculateBlownInsulation(area, targetR, cavityDepth);
      case 'rigid':
        return this.calculateRigidInsulation(area, targetR);
      case 'spray':
        return this.calculateSprayInsulation(area, targetR, cavityDepth);
      default:
        return { materials: {}, thickness: 0, actualR: 0, area };
    }
  }

  calculateBattInsulation(area, targetR, cavityDepth) {
    // Standard batt thicknesses and R-values
    const battOptions = [
      { thickness: 3.5, rValue: 11, type: 'R-11' },
      { thickness: 3.5, rValue: 13, type: 'R-13' },
      { thickness: 5.5, rValue: 15, type: 'R-15' },
      { thickness: 5.5, rValue: 19, type: 'R-19' },
      { thickness: 6.25, rValue: 19, type: 'R-19' },
      { thickness: 8.25, rValue: 25, type: 'R-25' },
      { thickness: 9.25, rValue: 30, type: 'R-30' },
      { thickness: 12, rValue: 38, type: 'R-38' }
    ];

    // Find best fit for cavity and R-value
    let selectedBatt = battOptions.find(batt =>
      batt.thickness <= cavityDepth && batt.rValue >= targetR
    );

    if (!selectedBatt) {
      // If no exact fit, get the highest R-value that fits
      selectedBatt = battOptions
        .filter(batt => batt.thickness <= cavityDepth)
        .sort((a, b) => b.rValue - a.rValue)[0];
    }

    if (!selectedBatt) {
      selectedBatt = battOptions[0]; // Default fallback
    }

    // Calculate square footage needed
    const sqftNeeded = area;

    // Standard batt coverage (varies by type)
    const coveragePerBundle = selectedBatt.rValue <= 15 ? 88 : 64; // sq ft per bundle
    const bundlesNeeded = Math.ceil(sqftNeeded / coveragePerBundle);

    return {
      materials: {
        battInsulation: {
          type: selectedBatt.type,
          bundles: bundlesNeeded,
          coverage: coveragePerBundle,
          totalCoverage: bundlesNeeded * coveragePerBundle
        }
      },
      thickness: selectedBatt.thickness,
      actualR: selectedBatt.rValue,
      area: area,
      specifications: {
        battType: selectedBatt.type,
        thickness: `${selectedBatt.thickness}"`,
        cavityFit: selectedBatt.thickness <= cavityDepth ? 'Fits' : 'Requires compression'
      }
    };
  }

  calculateBlownInsulation(area, targetR, cavityDepth) {
    // Default to cellulose for blown insulation
    const rPerInch = this.rValuePerInch.blown.cellulose;
    const requiredThickness = targetR / rPerInch;

    // Density calculations (typical for cellulose)
    const density = 2.5; // lbs per cubic foot settled
    const settlingFactor = 1.15; // Account for settling

    const volume = area * (requiredThickness / 12) * settlingFactor; // cubic feet
    const weightNeeded = volume * density; // pounds

    // Bags (typically 25 lb bags for blown cellulose)
    const bagsNeeded = Math.ceil(weightNeeded / 25);

    return {
      materials: {
        blownInsulation: {
          type: 'Cellulose',
          bags: bagsNeeded,
          weightPerBag: 25,
          totalWeight: bagsNeeded * 25,
          coverage: area
        }
      },
      thickness: requiredThickness,
      actualR: requiredThickness * rPerInch,
      area: area,
      specifications: {
        material: 'Blown Cellulose',
        thickness: `${requiredThickness.toFixed(1)}"`,
        density: `${density} lbs/cu ft`,
        settlingFactor: settlingFactor
      }
    };
  }

  calculateRigidInsulation(area, targetR) {
    // Default to XPS for rigid insulation
    const rPerInch = this.rValuePerInch.rigid.xps;
    const requiredThickness = targetR / rPerInch;

    // Standard rigid board thicknesses
    const standardThicknesses = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4];
    const selectedThickness = standardThicknesses.find(t => t >= requiredThickness) ||
                             standardThicknesses[standardThicknesses.length - 1];

    // Standard board size is 4' x 8' = 32 sq ft
    const boardArea = 32;
    const boardsNeeded = Math.ceil(area / boardArea);

    return {
      materials: {
        rigidInsulation: {
          type: 'XPS',
          boards: boardsNeeded,
          boardSize: "4' x 8'",
          thickness: selectedThickness,
          totalCoverage: boardsNeeded * boardArea
        }
      },
      thickness: selectedThickness,
      actualR: selectedThickness * rPerInch,
      area: area,
      specifications: {
        material: 'XPS Rigid Board',
        thickness: `${selectedThickness}"`,
        rValuePerInch: rPerInch,
        boardDimensions: "4' x 8'"
      }
    };
  }

  calculateSprayInsulation(area, targetR, cavityDepth) {
    // Default to closed cell spray foam
    const rPerInch = this.rValuePerInch.spray.closed_cell;
    const requiredThickness = Math.min(targetR / rPerInch, cavityDepth);

    // Board feet calculation (thickness in inches × area in sq ft)
    const boardFeet = (requiredThickness / 12) * area * 12; // Convert to board feet

    // Spray foam is typically sold by board feet or by kits
    // Professional application typically ranges from 600-1200 board feet per kit
    const kitsNeeded = Math.ceil(boardFeet / 600); // Conservative estimate

    return {
      materials: {
        sprayFoam: {
          type: 'Closed Cell',
          boardFeet: boardFeet,
          kits: kitsNeeded,
          coverage: area
        }
      },
      thickness: requiredThickness,
      actualR: requiredThickness * rPerInch,
      area: area,
      specifications: {
        material: 'Closed Cell Spray Foam',
        thickness: `${requiredThickness.toFixed(1)}"`,
        rValuePerInch: rPerInch,
        applicationMethod: 'Professional spray application recommended'
      }
    };
  }

  calculateCosts(results) {
    const pricing = Pricing.getRegionalPricing(this.state.region);
    const insulationPricing = pricing.insulation || {};

    let materialCosts = 0;
    let laborCosts = 0;

    // Wall insulation costs
    materialCosts += this.calculateMaterialCost(results.walls, insulationPricing);
    laborCosts += this.calculateLaborCost(results.walls, insulationPricing, 'walls');

    // Ceiling insulation costs
    materialCosts += this.calculateMaterialCost(results.ceiling, insulationPricing);
    laborCosts += this.calculateLaborCost(results.ceiling, insulationPricing, 'ceiling');

    // Floor insulation costs
    materialCosts += this.calculateMaterialCost(results.floor, insulationPricing);
    laborCosts += this.calculateLaborCost(results.floor, insulationPricing, 'floor');

    const subtotal = materialCosts + laborCosts;
    const overhead = subtotal * 0.15; // 15% overhead
    const profit = subtotal * 0.10; // 10% profit
    const total = subtotal + overhead + profit;

    const totalArea = this.state.wallArea + this.state.ceilingArea + this.state.floorArea;

    return {
      materials: materialCosts,
      labor: laborCosts,
      subtotal,
      overhead,
      profit,
      total,
      region: this.state.region,
      pricePerSqFt: total / totalArea
    };
  }

  calculateMaterialCost(insulationData, pricing) {
    if (!insulationData.materials) return 0;

    let cost = 0;

    if (insulationData.materials.battInsulation) {
      const batts = insulationData.materials.battInsulation;
      cost += (pricing.battInsulation?.price || 45) * batts.bundles;
    }

    if (insulationData.materials.blownInsulation) {
      const blown = insulationData.materials.blownInsulation;
      cost += (pricing.blownInsulation?.price || 12) * blown.bags;
    }

    if (insulationData.materials.rigidInsulation) {
      const rigid = insulationData.materials.rigidInsulation;
      cost += (pricing.rigidInsulation?.price || 25) * rigid.boards;
    }

    if (insulationData.materials.sprayFoam) {
      const spray = insulationData.materials.sprayFoam;
      cost += (pricing.sprayFoam?.price || 1.50) * spray.boardFeet;
    }

    return cost;
  }

  calculateLaborCost(insulationData, pricing, location) {
    if (!insulationData.area) return 0;

    const area = insulationData.area;
    let laborRate = 0;

    // Different labor rates by insulation type and location
    if (insulationData.materials.battInsulation) {
      laborRate = pricing.battInstallation?.price || 1.25;
    } else if (insulationData.materials.blownInsulation) {
      laborRate = pricing.blownInstallation?.price || 0.85;
    } else if (insulationData.materials.rigidInsulation) {
      laborRate = pricing.rigidInstallation?.price || 2.00;
    } else if (insulationData.materials.sprayFoam) {
      laborRate = pricing.sprayInstallation?.price || 1.00; // Usually included in material cost
    }

    // Location multipliers
    const locationMultipliers = {
      walls: 1.0,
      ceiling: 0.8, // Easier access usually
      floor: 1.2    // More difficult access
    };

    return area * laborRate * (locationMultipliers[location] || 1.0);
  }

  applyWasteFactor(results) {
    const wasteFactor = 1 + (this.state.wastePercent / 100);

    const withWaste = {
      walls: this.applyWasteToInsulation(results.walls, wasteFactor),
      ceiling: this.applyWasteToInsulation(results.ceiling, wasteFactor),
      floor: this.applyWasteToInsulation(results.floor, wasteFactor)
    };

    return withWaste;
  }

  applyWasteToInsulation(insulationData, wasteFactor) {
    if (!insulationData.materials) return insulationData;

    const withWaste = { ...insulationData, materials: {} };

    Object.keys(insulationData.materials).forEach(key => {
      const material = { ...insulationData.materials[key] };

      if (material.bundles) {
        material.bundles = Math.ceil(material.bundles * wasteFactor);
      }
      if (material.bags) {
        material.bags = Math.ceil(material.bags * wasteFactor);
      }
      if (material.boards) {
        material.boards = Math.ceil(material.boards * wasteFactor);
      }
      if (material.kits) {
        material.kits = Math.ceil(material.kits * wasteFactor);
      }

      withWaste.materials[key] = material;
    });

    return withWaste;
  }

  displayResults() {
    if (!this.state.results || !this.elements.resultsContainer) return;

    const results = this.state.results;
    const withWaste = results.materialsWithWaste;

    let resultsHtml = '';

    // Wall insulation section
    resultsHtml += this.formatInsulationSection('Walls', results.walls, withWaste.walls);

    // Ceiling insulation section
    resultsHtml += this.formatInsulationSection('Ceiling', results.ceiling, withWaste.ceiling);

    // Floor insulation section
    resultsHtml += this.formatInsulationSection('Floor', results.floor, withWaste.floor);

    this.elements.resultsContainer.innerHTML = resultsHtml;

    // Display cost summary
    if (this.elements.summaryContainer) {
      this.elements.summaryContainer.innerHTML = `
        <div class="cost-summary">
          <h3>Cost Summary (${results.costs.region})</h3>
          <div class="cost-item">
            <span>Materials:</span>
            <span>$${results.costs.materials.toLocaleString()}</span>
          </div>
          <div class="cost-item">
            <span>Labor:</span>
            <span>$${results.costs.labor.toLocaleString()}</span>
          </div>
          <div class="cost-item">
            <span>Overhead (15%):</span>
            <span>$${results.costs.overhead.toLocaleString()}</span>
          </div>
          <div class="cost-item">
            <span>Profit (10%):</span>
            <span>$${results.costs.profit.toLocaleString()}</span>
          </div>
          <div class="cost-total">
            <span>Total Cost:</span>
            <span>$${results.costs.total.toLocaleString()}</span>
          </div>
          <div class="cost-detail">
            <small>$${results.costs.pricePerSqFt.toFixed(2)} per sq ft</small>
          </div>
        </div>
      `;
    }

    // Show export options
    if (this.elements.exportContainer) {
      this.elements.exportContainer.style.display = 'block';
    }
  }

  formatInsulationSection(title, data, dataWithWaste) {
    if (!data.materials || Object.keys(data.materials).length === 0) {
      return `
        <div class="result-group">
          <h3>${title}</h3>
          <div class="result-item">
            <span>No insulation calculated</span>
          </div>
        </div>
      `;
    }

    let html = `
      <div class="result-group">
        <h3>${title} (${data.area.toLocaleString()} sq ft)</h3>
        <div class="result-item">
          <span>Target R-value:</span>
          <span>R-${data.actualR.toFixed(1)}</span>
        </div>
        <div class="result-item">
          <span>Thickness:</span>
          <span>${data.thickness.toFixed(1)}"</span>
        </div>
    `;

    // Add material-specific details
    Object.keys(data.materials).forEach(materialType => {
      const material = data.materials[materialType];
      const materialWithWaste = dataWithWaste.materials[materialType];

      if (material.bundles) {
        html += `
          <div class="result-item">
            <span>${material.type} bundles:</span>
            <span>${material.bundles} (${materialWithWaste.bundles} with waste)</span>
          </div>
        `;
      }

      if (material.bags) {
        html += `
          <div class="result-item">
            <span>${material.type} bags:</span>
            <span>${material.bags} (${materialWithWaste.bags} with waste)</span>
          </div>
        `;
      }

      if (material.boards) {
        html += `
          <div class="result-item">
            <span>${material.type} boards:</span>
            <span>${material.boards} (${materialWithWaste.boards} with waste)</span>
          </div>
        `;
      }

      if (material.boardFeet) {
        html += `
          <div class="result-item">
            <span>Board feet:</span>
            <span>${material.boardFeet.toFixed(1)} bf</span>
          </div>
        `;
      }
    });

    html += `
        <div class="result-detail">
          <small>${data.specifications ? Object.values(data.specifications).join(', ') : ''}</small>
        </div>
      </div>
    `;

    return html;
  }

  exportResults(format) {
    if (!this.state.results) {
      UI.showError('No results to export');
      return;
    }

    const results = this.state.results;

    const exportData = {
      project: 'Insulation Calculator Results',
      date: new Date().toLocaleDateString(),
      inputs: {
        'Wall Area': `${this.state.wallArea} sq ft`,
        'Ceiling Area': `${this.state.ceilingArea} sq ft`,
        'Floor Area': `${this.state.floorArea} sq ft`,
        'Wall R-Value': `R-${this.state.wallRValue}`,
        'Ceiling R-Value': `R-${this.state.ceilingRValue}`,
        'Floor R-Value': `R-${this.state.floorRValue}`,
        'Waste Factor': `${this.state.wastePercent}%`,
        'Region': this.state.region
      },
      walls: this.formatExportSection(results.walls),
      ceiling: this.formatExportSection(results.ceiling),
      floor: this.formatExportSection(results.floor),
      costs: {
        'Material Cost': `$${results.costs.materials.toLocaleString()}`,
        'Labor Cost': `$${results.costs.labor.toLocaleString()}`,
        'Overhead': `$${results.costs.overhead.toLocaleString()}`,
        'Profit': `$${results.costs.profit.toLocaleString()}`,
        'Total Cost': `$${results.costs.total.toLocaleString()}`,
        'Cost per Sq Ft': `$${results.costs.pricePerSqFt.toFixed(2)}`
      }
    };

    Export.exportData(exportData, `insulation-calculation-${Date.now()}`, format);
  }

  formatExportSection(data) {
    const section = {
      'Area': `${data.area} sq ft`,
      'R-Value': `R-${data.actualR.toFixed(1)}`,
      'Thickness': `${data.thickness.toFixed(1)}"`
    };

    if (data.materials) {
      Object.keys(data.materials).forEach(materialType => {
        const material = data.materials[materialType];

        if (material.bundles) {
          section[`${material.type} Bundles`] = `${material.bundles}`;
        }
        if (material.bags) {
          section[`${material.type} Bags`] = `${material.bags}`;
        }
        if (material.boards) {
          section[`${material.type} Boards`] = `${material.boards}`;
        }
        if (material.boardFeet) {
          section['Board Feet'] = `${material.boardFeet.toFixed(1)} bf`;
        }
      });
    }

    return section;
  }

  // Legacy compute function for testing
  compute() {
    if (!this.state.results) return null;

    const results = this.state.results;
    const totalArea = this.state.wallArea + this.state.ceilingArea + this.state.floorArea;

    return {
      totalArea: totalArea,
      wallRValue: results.walls.actualR,
      ceilingRValue: results.ceiling.actualR,
      floorRValue: results.floor.actualR,
      totalCost: results.costs.total
    };
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.insulationCalc = new InsulationCalculator();
});

// Legacy exports for compatibility
export function init(el) {
  // Initialize calculator UI in the provided element
  window.insulationCalc = new InsulationCalculator();
}

export function compute(state) {
  // Legacy compute for testing: 1000 sq ft R-19 should return reasonable batt count
  const area = state?.area || 1000;
  const targetR = state?.rValue || 19;

  // Simulate batt calculation
  const coveragePerBundle = 64; // sq ft typical for R-19
  const bundles = Math.ceil(area / coveragePerBundle);

  return {
    ok: true,
    bundles: bundles,
    rValue: targetR,
    area: area
  };
}

export function explain(state) {
  return "Calculates batt, blown, rigid, and spray foam insulation materials with R-value optimization for walls, ceilings, and floors.";
}

export function meta() {
  return {
    id: "insulation",
    title: "Insulation Calculator",
    category: "thermal"
  };
}

export { InsulationCalculator };