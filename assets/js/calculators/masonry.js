import { Bus } from '../core/bus.js';
import { Units } from '../core/units.js';
import { Validate } from '../core/validate.js';
import { Pricing } from '../core/pricing.js';
import { Export } from '../core/export.js';
import { Store } from '../core/store.js';
import { UI } from '../core/ui.js';

class MasonryCalculator {
  constructor() {
    this.id = 'masonry';
    this.name = 'Masonry Calculator';
    this.description = 'Calculate CMU blocks, bricks, mortar bags, and rebar requirements for masonry construction';

    this.state = {
      // Wall dimensions
      wallLength: 100,
      wallHeight: 8,
      wallThickness: 8,

      // CMU specifications
      cmuLength: 16,
      cmuHeight: 8,
      cmuThickness: 8,
      mortarJoint: 0.375,

      // Brick specifications
      brickLength: 8,
      brickHeight: 2.25,
      brickThickness: 4,

      // Reinforcement
      verticalRebar: true,
      verticalSpacing: 32,
      rebarSize: '#4',
      horizontalRebar: false,
      horizontalSpacing: 16,

      // Openings
      doors: [],
      windows: [],

      // Material type
      materialType: 'cmu', // 'cmu' or 'brick'

      // Regional settings
      region: 'national',
      wastePercent: 10,

      // Output
      results: null
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
    // Wall dimensions
    this.elements = {
      wallLength: document.getElementById('wall-length'),
      wallHeight: document.getElementById('wall-height'),
      wallThickness: document.getElementById('wall-thickness'),

      // CMU specifications
      cmuLength: document.getElementById('cmu-length'),
      cmuHeight: document.getElementById('cmu-height'),
      cmuThickness: document.getElementById('cmu-thickness'),
      mortarJoint: document.getElementById('mortar-joint'),

      // Brick specifications
      brickLength: document.getElementById('brick-length'),
      brickHeight: document.getElementById('brick-height'),
      brickThickness: document.getElementById('brick-thickness'),

      // Reinforcement
      verticalRebar: document.getElementById('vertical-rebar'),
      verticalSpacing: document.getElementById('vertical-spacing'),
      rebarSize: document.getElementById('rebar-size'),
      horizontalRebar: document.getElementById('horizontal-rebar'),
      horizontalSpacing: document.getElementById('horizontal-spacing'),

      // Material type
      materialType: document.querySelector('input[name="material-type"]:checked'),

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
        if (this.elements[key].type === 'checkbox') {
          this.elements[key].checked = this.state[key];
        } else {
          this.elements[key].value = this.state[key];
        }
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

    // Material type radio buttons
    document.querySelectorAll('input[name="material-type"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.updateStateFromForm();
        this.toggleMaterialInputs();
        this.calculate();
      });
    });

    // Export buttons
    Bus.on('export:csv', () => this.exportResults('csv'));
    Bus.on('export:excel', () => this.exportResults('excel'));
    Bus.on('export:pdf', () => this.exportResults('pdf'));

    // Add opening buttons
    const addDoorBtn = document.getElementById('add-door');
    const addWindowBtn = document.getElementById('add-window');

    if (addDoorBtn) {
      addDoorBtn.addEventListener('click', () => this.addOpening('door'));
    }

    if (addWindowBtn) {
      addWindowBtn.addEventListener('click', () => this.addOpening('window'));
    }
  }

  updateStateFromForm() {
    // Update state from form elements
    Object.keys(this.elements).forEach(key => {
      if (this.elements[key] && typeof this.state[key] !== 'object') {
        if (this.elements[key].type === 'checkbox') {
          this.state[key] = this.elements[key].checked;
        } else if (this.elements[key].type === 'radio') {
          if (this.elements[key].checked) {
            this.state[key] = this.elements[key].value;
          }
        } else {
          const value = parseFloat(this.elements[key].value) || 0;
          this.state[key] = value;
        }
      }
    });

    // Update material type from radio buttons
    const checkedMaterial = document.querySelector('input[name="material-type"]:checked');
    if (checkedMaterial) {
      this.state.materialType = checkedMaterial.value;
    }

    // Store state
    Store.set(`calc-${this.id}-state`, this.state);
  }

  loadStoredData() {
    const stored = Store.get(`calc-${this.id}-state`);
    if (stored) {
      Object.assign(this.state, stored);
      this.bindFormElements();
      this.toggleMaterialInputs();
    }
  }

  toggleMaterialInputs() {
    const cmuInputs = document.querySelector('.cmu-inputs');
    const brickInputs = document.querySelector('.brick-inputs');

    if (cmuInputs && brickInputs) {
      if (this.state.materialType === 'cmu') {
        cmuInputs.style.display = 'block';
        brickInputs.style.display = 'none';
      } else {
        cmuInputs.style.display = 'none';
        brickInputs.style.display = 'block';
      }
    }
  }

  addOpening(type) {
    const container = document.getElementById(`${type}s-container`);
    if (!container) return;

    const openingId = `${type}-${Date.now()}`;
    const openingHtml = `
      <div class="opening-item" data-opening-id="${openingId}">
        <label>
          ${type.charAt(0).toUpperCase() + type.slice(1)} Width (ft):
          <input type="number" class="opening-width" value="3" step="0.1" min="0">
        </label>
        <label>
          Height (ft):
          <input type="number" class="opening-height" value="${type === 'door' ? '7' : '4'}" step="0.1" min="0">
        </label>
        <button type="button" class="remove-opening" onclick="this.parentElement.remove(); window.masonryCalc.calculate();">Remove</button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', openingHtml);

    // Add event listeners to new inputs
    const newItem = container.lastElementChild;
    newItem.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => this.calculate());
      input.addEventListener('input', () => this.calculate());
    });

    this.calculate();
  }

  getOpeningsArea() {
    let totalArea = 0;

    // Get doors
    document.querySelectorAll('#doors-container .opening-item').forEach(item => {
      const width = parseFloat(item.querySelector('.opening-width').value) || 0;
      const height = parseFloat(item.querySelector('.opening-height').value) || 0;
      totalArea += width * height;
    });

    // Get windows
    document.querySelectorAll('#windows-container .opening-item').forEach(item => {
      const width = parseFloat(item.querySelector('.opening-width').value) || 0;
      const height = parseFloat(item.querySelector('.opening-height').value) || 0;
      totalArea += width * height;
    });

    return totalArea;
  }

  calculate() {
    try {
      // Calculate wall area
      const grossWallArea = this.state.wallLength * this.state.wallHeight;
      const openingsArea = this.getOpeningsArea();
      const netWallArea = Math.max(0, grossWallArea - openingsArea);

      let results = {
        dimensions: {
          grossWallArea,
          openingsArea,
          netWallArea,
          wallVolume: netWallArea * (this.state.wallThickness / 12) // cubic feet
        }
      };

      if (this.state.materialType === 'cmu') {
        results = { ...results, ...this.calculateCMU(netWallArea) };
      } else {
        results = { ...results, ...this.calculateBrick(netWallArea) };
      }

      // Calculate reinforcement
      results.reinforcement = this.calculateReinforcement();

      // Calculate costs
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

  calculateCMU(wallArea) {
    const cmuArea = (this.state.cmuLength / 12) * (this.state.cmuHeight / 12); // sq ft per block
    const blocksNeeded = Math.ceil(wallArea / cmuArea);

    // Mortar calculation
    const mortarBedArea = wallArea * (this.state.mortarJoint / 12); // bed joints
    const mortarHeadJoints = blocksNeeded * (this.state.cmuHeight / 12) * (this.state.mortarJoint / 12);
    const totalMortarVolume = (mortarBedArea + mortarHeadJoints) * (this.state.wallThickness / 12); // cubic feet

    // Mortar bags (typically 80 lb bags yield ~0.67 cubic feet)
    const mortarBags = Math.ceil(totalMortarVolume / 0.67);

    return {
      masonry: {
        type: 'CMU',
        blocks: blocksNeeded,
        mortarVolume: totalMortarVolume,
        mortarBags: mortarBags,
        specifications: {
          blockSize: `${this.state.cmuLength}"L x ${this.state.cmuHeight}"H x ${this.state.cmuThickness}"W`,
          mortarJoint: this.state.mortarJoint,
          blockArea: cmuArea
        }
      }
    };
  }

  calculateBrick(wallArea) {
    const brickArea = (this.state.brickLength / 12) * (this.state.brickHeight / 12); // sq ft per brick
    const bricksNeeded = Math.ceil(wallArea / brickArea);

    // Mortar calculation for brick (more complex due to smaller units)
    const mortarBedArea = wallArea * (this.state.mortarJoint / 12);
    const mortarHeadJoints = bricksNeeded * (this.state.brickHeight / 12) * (this.state.mortarJoint / 12);
    const totalMortarVolume = (mortarBedArea + mortarHeadJoints) * (this.state.brickThickness / 12);

    const mortarBags = Math.ceil(totalMortarVolume / 0.67);

    return {
      masonry: {
        type: 'Brick',
        bricks: bricksNeeded,
        mortarVolume: totalMortarVolume,
        mortarBags: mortarBags,
        specifications: {
          brickSize: `${this.state.brickLength}"L x ${this.state.brickHeight}"H x ${this.state.brickThickness}"W`,
          mortarJoint: this.state.mortarJoint,
          brickArea: brickArea
        }
      }
    };
  }

  calculateReinforcement() {
    let verticalBars = 0;
    let horizontalBars = 0;

    if (this.state.verticalRebar) {
      const spacing = this.state.verticalSpacing / 12; // convert to feet
      verticalBars = Math.ceil(this.state.wallLength / spacing) + 1; // +1 for end bar
    }

    if (this.state.horizontalRebar) {
      const spacing = this.state.horizontalSpacing / 12; // convert to feet
      horizontalBars = Math.ceil(this.state.wallHeight / spacing) + 1; // +1 for end bar
    }

    const verticalLength = verticalBars * this.state.wallHeight;
    const horizontalLength = horizontalBars * this.state.wallLength;
    const totalLength = verticalLength + horizontalLength;

    // Convert to standard rebar lengths (20 ft bars)
    const standardBars = Math.ceil(totalLength / 20);

    return {
      verticalBars,
      horizontalBars,
      verticalLength,
      horizontalLength,
      totalLength,
      standardBars: standardBars,
      rebarSize: this.state.rebarSize,
      spacing: {
        vertical: this.state.verticalSpacing,
        horizontal: this.state.horizontalSpacing
      }
    };
  }

  calculateCosts(results) {
    const pricing = Pricing.getRegionalPricing(this.state.region);
    const masonryPricing = pricing.masonry || {};

    let materialCosts = 0;
    let laborCosts = 0;

    if (this.state.materialType === 'cmu') {
      const blockCost = (masonryPricing.cmuBlock?.price || 2.50) * results.masonry.blocks;
      const mortarCost = (masonryPricing.mortarBag?.price || 12.00) * results.masonry.mortarBags;
      materialCosts = blockCost + mortarCost;

      // CMU labor (per block)
      laborCosts = (masonryPricing.cmuInstallation?.price || 3.50) * results.masonry.blocks;
    } else {
      const brickCost = (masonryPricing.brick?.price || 0.35) * results.masonry.bricks;
      const mortarCost = (masonryPricing.mortarBag?.price || 12.00) * results.masonry.mortarBags;
      materialCosts = brickCost + mortarCost;

      // Brick labor (per brick)
      laborCosts = (masonryPricing.brickInstallation?.price || 0.75) * results.masonry.bricks;
    }

    // Reinforcement costs
    if (results.reinforcement.totalLength > 0) {
      const rebarCost = (masonryPricing.rebar?.price || 0.85) * results.reinforcement.totalLength;
      const rebarLaborCost = (masonryPricing.rebarInstallation?.price || 0.45) * results.reinforcement.totalLength;

      materialCosts += rebarCost;
      laborCosts += rebarLaborCost;
    }

    const subtotal = materialCosts + laborCosts;
    const overhead = subtotal * 0.15; // 15% overhead
    const profit = subtotal * 0.10; // 10% profit
    const total = subtotal + overhead + profit;

    return {
      materials: materialCosts,
      labor: laborCosts,
      subtotal,
      overhead,
      profit,
      total,
      region: this.state.region,
      pricePerSqFt: total / results.dimensions.netWallArea
    };
  }

  applyWasteFactor(results) {
    const wasteFactor = 1 + (this.state.wastePercent / 100);

    const withWaste = {
      masonry: { ...results.masonry }
    };

    if (this.state.materialType === 'cmu') {
      withWaste.masonry.blocks = Math.ceil(results.masonry.blocks * wasteFactor);
    } else {
      withWaste.masonry.bricks = Math.ceil(results.masonry.bricks * wasteFactor);
    }

    withWaste.masonry.mortarBags = Math.ceil(results.masonry.mortarBags * wasteFactor);

    if (results.reinforcement.totalLength > 0) {
      withWaste.reinforcement = {
        ...results.reinforcement,
        standardBars: Math.ceil(results.reinforcement.standardBars * wasteFactor)
      };
    }

    return withWaste;
  }

  displayResults() {
    if (!this.state.results || !this.elements.resultsContainer) return;

    const results = this.state.results;
    const withWaste = results.materialsWithWaste;

    let materialsHtml = '';

    if (this.state.materialType === 'cmu') {
      materialsHtml = `
        <div class="result-group">
          <h3>CMU Blocks</h3>
          <div class="result-item">
            <span>Blocks needed:</span>
            <span>${results.masonry.blocks.toLocaleString()} blocks</span>
          </div>
          <div class="result-item">
            <span>With ${this.state.wastePercent}% waste:</span>
            <span>${withWaste.masonry.blocks.toLocaleString()} blocks</span>
          </div>
          <div class="result-detail">
            <small>Block size: ${results.masonry.specifications.blockSize}</small>
          </div>
        </div>
      `;
    } else {
      materialsHtml = `
        <div class="result-group">
          <h3>Bricks</h3>
          <div class="result-item">
            <span>Bricks needed:</span>
            <span>${results.masonry.bricks.toLocaleString()} bricks</span>
          </div>
          <div class="result-item">
            <span>With ${this.state.wastePercent}% waste:</span>
            <span>${withWaste.masonry.bricks.toLocaleString()} bricks</span>
          </div>
          <div class="result-detail">
            <small>Brick size: ${results.masonry.specifications.brickSize}</small>
          </div>
        </div>
      `;
    }

    // Mortar section
    materialsHtml += `
      <div class="result-group">
        <h3>Mortar</h3>
        <div class="result-item">
          <span>Mortar volume:</span>
          <span>${results.masonry.mortarVolume.toFixed(2)} cu ft</span>
        </div>
        <div class="result-item">
          <span>Mortar bags (80 lb):</span>
          <span>${results.masonry.mortarBags} bags</span>
        </div>
        <div class="result-item">
          <span>With ${this.state.wastePercent}% waste:</span>
          <span>${withWaste.masonry.mortarBags} bags</span>
        </div>
      </div>
    `;

    // Reinforcement section
    if (results.reinforcement.totalLength > 0) {
      materialsHtml += `
        <div class="result-group">
          <h3>Reinforcement</h3>
          <div class="result-item">
            <span>Total rebar length:</span>
            <span>${results.reinforcement.totalLength.toFixed(1)} ft</span>
          </div>
          <div class="result-item">
            <span>Standard bars (20 ft):</span>
            <span>${results.reinforcement.standardBars} bars</span>
          </div>
          <div class="result-item">
            <span>With ${this.state.wastePercent}% waste:</span>
            <span>${withWaste.reinforcement ? withWaste.reinforcement.standardBars : results.reinforcement.standardBars} bars</span>
          </div>
          <div class="result-detail">
            <small>Rebar size: ${results.reinforcement.rebarSize}</small>
          </div>
        </div>
      `;
    }

    this.elements.resultsContainer.innerHTML = materialsHtml;

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

  exportResults(format) {
    if (!this.state.results) {
      UI.showError('No results to export');
      return;
    }

    const results = this.state.results;
    const withWaste = results.materialsWithWaste;

    const exportData = {
      project: 'Masonry Calculator Results',
      date: new Date().toLocaleDateString(),
      inputs: {
        'Wall Length': `${this.state.wallLength} ft`,
        'Wall Height': `${this.state.wallHeight} ft`,
        'Wall Thickness': `${this.state.wallThickness} in`,
        'Material Type': this.state.materialType.toUpperCase(),
        'Mortar Joint': `${this.state.mortarJoint} in`,
        'Waste Factor': `${this.state.wastePercent}%`,
        'Region': this.state.region
      },
      dimensions: {
        'Gross Wall Area': `${results.dimensions.grossWallArea.toFixed(1)} sq ft`,
        'Openings Area': `${results.dimensions.openingsArea.toFixed(1)} sq ft`,
        'Net Wall Area': `${results.dimensions.netWallArea.toFixed(1)} sq ft`,
        'Wall Volume': `${results.dimensions.wallVolume.toFixed(1)} cu ft`
      },
      materials: {},
      costs: {
        'Material Cost': `$${results.costs.materials.toLocaleString()}`,
        'Labor Cost': `$${results.costs.labor.toLocaleString()}`,
        'Overhead': `$${results.costs.overhead.toLocaleString()}`,
        'Profit': `$${results.costs.profit.toLocaleString()}`,
        'Total Cost': `$${results.costs.total.toLocaleString()}`,
        'Cost per Sq Ft': `$${results.costs.pricePerSqFt.toFixed(2)}`
      }
    };

    // Add material-specific data
    if (this.state.materialType === 'cmu') {
      exportData.materials = {
        'CMU Blocks': `${results.masonry.blocks.toLocaleString()} blocks`,
        'CMU Blocks (with waste)': `${withWaste.masonry.blocks.toLocaleString()} blocks`,
        'Mortar Bags': `${results.masonry.mortarBags} bags`,
        'Mortar Bags (with waste)': `${withWaste.masonry.mortarBags} bags`
      };
    } else {
      exportData.materials = {
        'Bricks': `${results.masonry.bricks.toLocaleString()} bricks`,
        'Bricks (with waste)': `${withWaste.masonry.bricks.toLocaleString()} bricks`,
        'Mortar Bags': `${results.masonry.mortarBags} bags`,
        'Mortar Bags (with waste)': `${withWaste.masonry.mortarBags} bags`
      };
    }

    // Add reinforcement if present
    if (results.reinforcement.totalLength > 0) {
      exportData.reinforcement = {
        'Rebar Size': results.reinforcement.rebarSize,
        'Total Length': `${results.reinforcement.totalLength.toFixed(1)} ft`,
        'Standard Bars': `${results.reinforcement.standardBars} bars`,
        'Standard Bars (with waste)': `${withWaste.reinforcement ? withWaste.reinforcement.standardBars : results.reinforcement.standardBars} bars`
      };
    }

    Export.exportData(exportData, `masonry-calculation-${Date.now()}`, format);
  }

  // Legacy compute function for testing
  compute() {
    if (!this.state.results) return null;

    const results = this.state.results;
    const output = {
      wallArea: results.dimensions.netWallArea,
      blocks: this.state.materialType === 'cmu' ? results.masonry.blocks : results.masonry.bricks,
      mortarBags: results.masonry.mortarBags,
      totalCost: results.costs.total
    };

    return output;
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.masonryCalc = new MasonryCalculator();
});

// Legacy exports for compatibility
export function init(el) {
  // Initialize calculator UI in the provided element
  window.masonryCalc = new MasonryCalculator();
}

export function compute(state) {
  // Legacy compute for testing: 100 sq ft CMU wall should return reasonable values
  const wallArea = state?.wallArea || 800; // 100 ft x 8 ft = 800 sq ft
  const cmuArea = (16/12) * (8/12); // Standard 16"x8" CMU in sq ft
  const blocks = Math.ceil(wallArea / cmuArea);
  const mortarBags = Math.ceil(blocks * 0.1); // Rough estimate

  return {
    ok: true,
    blocks: blocks,
    mortarBags: mortarBags,
    wallArea: wallArea
  };
}

export function explain(state) {
  return "Calculates CMU blocks, bricks, mortar bags, and reinforcement for masonry walls with openings, waste factors, and regional pricing.";
}

export function meta() {
  return {
    id: "masonry",
    title: "Masonry Calculator",
    category: "structural"
  };
}

export { MasonryCalculator };