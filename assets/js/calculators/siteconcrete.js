import { Bus } from '../core/bus.js';
import { Units } from '../core/units.js';
import { Validate } from '../core/validate.js';
import { Pricing } from '../core/pricing.js';
import { Export } from '../core/export.js';
import { Store } from '../core/store.js';
import { UI } from '../core/ui.js';

class SiteConcreteCalculator {
  constructor() {
    this.id = 'siteconcrete';
    this.name = 'Site Concrete Calculator';
    this.description = 'Calculate concrete volume and materials for curbs, sidewalks, and site concrete elements';

    this.state = {
      // Element types and dimensions
      elements: [
        {
          id: 'element-1',
          type: 'sidewalk', // sidewalk, curb, driveway, apron, pad
          length: 100, // feet
          width: 4, // feet
          thickness: 4, // inches
          quantity: 1
        }
      ],

      // Concrete specifications
      concreteStrength: '3000', // PSI
      concreteType: 'standard', // standard, air-entrained, fiber

      // Reinforcement
      reinforcementType: 'none', // none, wwm, rebar, fiber
      rebarSize: '#4',
      rebarSpacing: 24, // inches on center

      // Base and subgrade
      subbaseThickness: 4, // inches
      subbaseType: 'gravel', // gravel, sand, crushed-stone

      // Finishing
      finishType: 'broom', // broom, float, exposed-aggregate, stamped
      jointSpacing: 8, // feet
      sealerRequired: true,

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
    this.elements = {
      // Concrete specifications
      concreteStrength: document.getElementById('concrete-strength'),
      concreteType: document.getElementById('concrete-type'),

      // Reinforcement
      reinforcementType: document.getElementById('reinforcement-type'),
      rebarSize: document.getElementById('rebar-size'),
      rebarSpacing: document.getElementById('rebar-spacing'),

      // Base and subgrade
      subbaseThickness: document.getElementById('subbase-thickness'),
      subbaseType: document.getElementById('subbase-type'),

      // Finishing
      finishType: document.getElementById('finish-type'),
      jointSpacing: document.getElementById('joint-spacing'),
      sealerRequired: document.getElementById('sealer-required'),

      // Regional settings
      region: document.getElementById('region'),
      wastePercent: document.getElementById('waste-percent'),

      // Containers
      elementsContainer: document.getElementById('elements-container'),
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

    this.renderElements();
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

    // Add element button
    const addElementBtn = document.getElementById('add-element');
    if (addElementBtn) {
      addElementBtn.addEventListener('click', () => this.addElement());
    }

    // Reinforcement type change
    if (this.elements.reinforcementType) {
      this.elements.reinforcementType.addEventListener('change', () => {
        this.toggleReinforcementInputs();
      });
    }
  }

  updateStateFromForm() {
    // Update state from form elements
    Object.keys(this.elements).forEach(key => {
      if (this.elements[key] && typeof this.state[key] !== 'object') {
        if (this.elements[key].type === 'checkbox') {
          this.state[key] = this.elements[key].checked;
        } else {
          const value = parseFloat(this.elements[key].value) || this.elements[key].value || 0;
          this.state[key] = value;
        }
      }
    });

    // Update elements data
    this.updateElementsFromForm();

    // Store state
    Store.set(`calc-${this.id}-state`, this.state);
  }

  updateElementsFromForm() {
    const elementItems = document.querySelectorAll('.element-item');
    this.state.elements = [];

    elementItems.forEach((item, index) => {
      const elementId = item.dataset.elementId || `element-${index + 1}`;
      const type = item.querySelector('.element-type').value;
      const length = parseFloat(item.querySelector('.element-length').value) || 0;
      const width = parseFloat(item.querySelector('.element-width').value) || 0;
      const thickness = parseFloat(item.querySelector('.element-thickness').value) || 0;
      const quantity = parseFloat(item.querySelector('.element-quantity').value) || 1;

      this.state.elements.push({
        id: elementId,
        type,
        length,
        width,
        thickness,
        quantity
      });
    });
  }

  loadStoredData() {
    const stored = Store.get(`calc-${this.id}-state`);
    if (stored) {
      Object.assign(this.state, stored);
      this.bindFormElements();
      this.toggleReinforcementInputs();
    }
  }

  toggleReinforcementInputs() {
    const rebarInputs = document.querySelector('.rebar-inputs');
    if (rebarInputs) {
      rebarInputs.style.display = this.state.reinforcementType === 'rebar' ? 'block' : 'none';
    }
  }

  addElement() {
    const newElement = {
      id: `element-${Date.now()}`,
      type: 'sidewalk',
      length: 20,
      width: 4,
      thickness: 4,
      quantity: 1
    };

    this.state.elements.push(newElement);
    this.renderElements();
    this.calculate();
  }

  removeElement(elementId) {
    this.state.elements = this.state.elements.filter(el => el.id !== elementId);
    this.renderElements();
    this.calculate();
  }

  renderElements() {
    if (!this.elements.elementsContainer) return;

    const elementsHtml = this.state.elements.map(element => `
      <div class="element-item" data-element-id="${element.id}">
        <div class="element-header">
          <label>
            Element Type:
            <select class="element-type">
              <option value="sidewalk" ${element.type === 'sidewalk' ? 'selected' : ''}>Sidewalk</option>
              <option value="curb" ${element.type === 'curb' ? 'selected' : ''}>Curb</option>
              <option value="driveway" ${element.type === 'driveway' ? 'selected' : ''}>Driveway</option>
              <option value="apron" ${element.type === 'apron' ? 'selected' : ''}>Apron</option>
              <option value="pad" ${element.type === 'pad' ? 'selected' : ''}>Equipment Pad</option>
            </select>
          </label>
          <button type="button" class="remove-element" onclick="window.siteConcreteCalc.removeElement('${element.id}')">Remove</button>
        </div>
        <div class="element-dimensions">
          <label>
            Length (ft):
            <input type="number" class="element-length" value="${element.length}" step="0.1" min="0">
          </label>
          <label>
            Width (ft):
            <input type="number" class="element-width" value="${element.width}" step="0.1" min="0">
          </label>
          <label>
            Thickness (in):
            <input type="number" class="element-thickness" value="${element.thickness}" step="0.25" min="0">
          </label>
          <label>
            Quantity:
            <input type="number" class="element-quantity" value="${element.quantity}" step="1" min="1">
          </label>
        </div>
      </div>
    `).join('');

    this.elements.elementsContainer.innerHTML = elementsHtml;

    // Add event listeners to new inputs
    this.elements.elementsContainer.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', () => {
        this.updateStateFromForm();
        this.calculate();
      });
      input.addEventListener('input', () => {
        this.updateStateFromForm();
        this.calculate();
      });
    });
  }

  calculate() {
    try {
      const results = {
        elements: this.calculateElementVolumes(),
        totals: {},
        reinforcement: {},
        subbase: {},
        finishing: {},
        costs: {}
      };

      // Calculate totals
      results.totals = this.calculateTotals(results.elements);

      // Calculate reinforcement if needed
      if (this.state.reinforcementType !== 'none') {
        results.reinforcement = this.calculateReinforcement(results.elements);
      }

      // Calculate subbase
      results.subbase = this.calculateSubbase(results.elements);

      // Calculate finishing
      results.finishing = this.calculateFinishing(results.elements);

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

  calculateElementVolumes() {
    return this.state.elements.map(element => {
      const area = element.length * element.width * element.quantity;
      const volume = area * (element.thickness / 12); // Convert inches to feet
      const volumeYards = volume / 27; // Convert to cubic yards

      return {
        ...element,
        area: area,
        volume: volume, // cubic feet
        volumeYards: volumeYards, // cubic yards
        perimeter: (element.length + element.width) * 2 * element.quantity,
        linearFeet: element.type === 'curb' ? element.length * element.quantity : 0
      };
    });
  }

  calculateTotals(elementResults) {
    const totalArea = elementResults.reduce((sum, el) => sum + el.area, 0);
    const totalVolume = elementResults.reduce((sum, el) => sum + el.volume, 0);
    const totalVolumeYards = elementResults.reduce((sum, el) => sum + el.volumeYards, 0);
    const totalPerimeter = elementResults.reduce((sum, el) => sum + el.perimeter, 0);
    const totalLinearFeet = elementResults.reduce((sum, el) => sum + el.linearFeet, 0);

    // Concrete ordering (add waste)
    const concreteYardsOrdered = Math.ceil(totalVolumeYards * (1 + this.state.wastePercent / 100) * 4) / 4; // Round to quarter yard

    return {
      area: totalArea,
      volume: totalVolume,
      volumeYards: totalVolumeYards,
      concreteYardsOrdered: concreteYardsOrdered,
      perimeter: totalPerimeter,
      linearFeet: totalLinearFeet
    };
  }

  calculateReinforcement(elementResults) {
    if (this.state.reinforcementType === 'none') return {};

    const totalArea = elementResults.reduce((sum, el) => sum + el.area, 0);

    if (this.state.reinforcementType === 'wwm') {
      // Welded wire mesh - typically 6x6 W1.4xW1.4
      const meshRolls = Math.ceil(totalArea / 750); // 5'x150' rolls = 750 sq ft

      return {
        type: 'WWM',
        meshRolls: meshRolls,
        coverage: totalArea,
        specification: '6x6-W1.4xW1.4'
      };
    }

    if (this.state.reinforcementType === 'rebar') {
      // Calculate rebar grid
      const spacingFeet = this.state.rebarSpacing / 12;

      let totalRebarLength = 0;
      elementResults.forEach(element => {
        const lengthBars = Math.ceil(element.width / spacingFeet) + 1;
        const widthBars = Math.ceil(element.length / spacingFeet) + 1;

        const lengthBarsFeet = lengthBars * element.length * element.quantity;
        const widthBarsFeet = widthBars * element.width * element.quantity;

        totalRebarLength += lengthBarsFeet + widthBarsFeet;
      });

      // Standard rebar lengths are 20 feet
      const standardBars = Math.ceil(totalRebarLength / 20);

      return {
        type: 'Rebar',
        size: this.state.rebarSize,
        spacing: this.state.rebarSpacing,
        totalLength: totalRebarLength,
        standardBars: standardBars,
        coverage: totalArea
      };
    }

    if (this.state.reinforcementType === 'fiber') {
      // Fiber reinforced concrete
      const fiberPounds = Math.ceil(totalArea * 0.1); // Rough estimate

      return {
        type: 'Fiber',
        pounds: fiberPounds,
        coverage: totalArea,
        specification: 'Synthetic macro fiber'
      };
    }

    return {};
  }

  calculateSubbase(elementResults) {
    if (this.state.subbaseThickness <= 0) return {};

    const totalArea = elementResults.reduce((sum, el) => sum + el.area, 0);
    const subbaseVolume = totalArea * (this.state.subbaseThickness / 12); // cubic feet
    const subbaseYards = subbaseVolume / 27; // cubic yards
    const subbaseTons = subbaseYards * 1.5; // Approximate tons (varies by material)

    return {
      type: this.state.subbaseType,
      thickness: this.state.subbaseThickness,
      area: totalArea,
      volume: subbaseVolume,
      yards: subbaseYards,
      tons: subbaseTons
    };
  }

  calculateFinishing(elementResults) {
    const totalArea = elementResults.reduce((sum, el) => sum + el.area, 0);
    const totalPerimeter = elementResults.reduce((sum, el) => sum + el.perimeter, 0);

    // Control joints
    const jointSpacing = this.state.jointSpacing;
    let totalJointLength = 0;

    elementResults.forEach(element => {
      const lengthJoints = Math.floor(element.length / jointSpacing) * element.width * element.quantity;
      const widthJoints = Math.floor(element.width / jointSpacing) * element.length * element.quantity;
      totalJointLength += lengthJoints + widthJoints;
    });

    const finishing = {
      finishType: this.state.finishType,
      area: totalArea,
      jointLength: totalJointLength,
      jointSpacing: jointSpacing
    };

    // Sealer calculation
    if (this.state.sealerRequired) {
      // Concrete sealer typically covers 250-300 sq ft per gallon
      const sealerGallons = Math.ceil(totalArea / 275);
      finishing.sealer = {
        required: true,
        gallons: sealerGallons,
        coverage: totalArea
      };
    }

    // Edging for sidewalks and driveways
    const edgeableElements = elementResults.filter(el =>
      ['sidewalk', 'driveway', 'apron'].includes(el.type)
    );
    const edgeLinearFeet = edgeableElements.reduce((sum, el) => sum + el.perimeter, 0);

    if (edgeLinearFeet > 0) {
      finishing.edging = {
        linearFeet: edgeLinearFeet,
        type: 'Expansion joint material'
      };
    }

    return finishing;
  }

  calculateCosts(results) {
    const pricing = Pricing.getRegionalPricing(this.state.region);
    const concretePricing = pricing.concrete || {};

    let materialCosts = 0;
    let laborCosts = 0;

    // Concrete cost
    const concretePrice = concretePricing.readyMix?.price || 120; // per cubic yard
    const concreteCost = results.totals.concreteYardsOrdered * concretePrice;
    materialCosts += concreteCost;

    // Concrete placement labor
    const placementLabor = (concretePricing.placement?.price || 45) * results.totals.area;
    laborCosts += placementLabor;

    // Reinforcement costs
    if (results.reinforcement.type) {
      if (results.reinforcement.type === 'WWM') {
        const meshCost = (concretePricing.wwm?.price || 125) * results.reinforcement.meshRolls;
        materialCosts += meshCost;
      } else if (results.reinforcement.type === 'Rebar') {
        const rebarCost = (concretePricing.rebar?.price || 0.85) * results.reinforcement.totalLength;
        const rebarLaborCost = (concretePricing.rebarInstallation?.price || 0.45) * results.reinforcement.totalLength;
        materialCosts += rebarCost;
        laborCosts += rebarLaborCost;
      } else if (results.reinforcement.type === 'Fiber') {
        const fiberCost = (concretePricing.fiber?.price || 2.50) * results.reinforcement.pounds;
        materialCosts += fiberCost;
      }
    }

    // Subbase costs
    if (results.subbase.yards) {
      const subbaseCost = (concretePricing.subbase?.price || 35) * results.subbase.yards;
      const subbaseLabor = (concretePricing.subbaseInstallation?.price || 15) * results.subbase.yards;
      materialCosts += subbaseCost;
      laborCosts += subbaseLabor;
    }

    // Finishing costs
    const finishingLabor = (concretePricing.finishing?.price || 2.50) * results.totals.area;
    laborCosts += finishingLabor;

    // Joint sealing
    if (results.finishing.jointLength > 0) {
      const jointSealCost = (concretePricing.jointSeal?.price || 1.25) * results.finishing.jointLength;
      materialCosts += jointSealCost;
    }

    // Sealer costs
    if (results.finishing.sealer) {
      const sealerCost = (concretePricing.sealer?.price || 35) * results.finishing.sealer.gallons;
      const sealerLabor = (concretePricing.sealerApplication?.price || 0.75) * results.totals.area;
      materialCosts += sealerCost;
      laborCosts += sealerLabor;
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
      pricePerSqFt: total / results.totals.area,
      pricePerYard: total / results.totals.concreteYardsOrdered
    };
  }

  applyWasteFactor(results) {
    const wasteFactor = 1 + (this.state.wastePercent / 100);

    // Most materials already have waste applied at ordering stage
    // This is mainly for informational purposes
    return {
      concreteYardsWithWaste: results.totals.concreteYardsOrdered,
      note: 'Waste factor already applied to concrete ordering'
    };
  }

  displayResults() {
    if (!this.state.results || !this.elements.resultsContainer) return;

    const results = this.state.results;

    let resultsHtml = `
      <div class="result-group">
        <h3>Concrete Requirements</h3>
        <div class="result-item">
          <span>Total Area:</span>
          <span>${results.totals.area.toLocaleString()} sq ft</span>
        </div>
        <div class="result-item">
          <span>Concrete Volume:</span>
          <span>${results.totals.volumeYards.toFixed(2)} cu yd</span>
        </div>
        <div class="result-item">
          <span>Concrete to Order:</span>
          <span>${results.totals.concreteYardsOrdered} cu yd</span>
        </div>
        <div class="result-detail">
          <small>Includes ${this.state.wastePercent}% waste factor</small>
        </div>
      </div>
    `;

    // Reinforcement section
    if (results.reinforcement.type) {
      resultsHtml += `
        <div class="result-group">
          <h3>Reinforcement (${results.reinforcement.type})</h3>
      `;

      if (results.reinforcement.type === 'WWM') {
        resultsHtml += `
          <div class="result-item">
            <span>Mesh rolls (${results.reinforcement.specification}):</span>
            <span>${results.reinforcement.meshRolls} rolls</span>
          </div>
        `;
      } else if (results.reinforcement.type === 'Rebar') {
        resultsHtml += `
          <div class="result-item">
            <span>Rebar size:</span>
            <span>${results.reinforcement.size}</span>
          </div>
          <div class="result-item">
            <span>Total length:</span>
            <span>${results.reinforcement.totalLength.toFixed(1)} ft</span>
          </div>
          <div class="result-item">
            <span>Standard bars (20 ft):</span>
            <span>${results.reinforcement.standardBars} bars</span>
          </div>
        `;
      } else if (results.reinforcement.type === 'Fiber') {
        resultsHtml += `
          <div class="result-item">
            <span>Fiber reinforcement:</span>
            <span>${results.reinforcement.pounds} lbs</span>
          </div>
        `;
      }

      resultsHtml += `</div>`;
    }

    // Subbase section
    if (results.subbase.yards) {
      resultsHtml += `
        <div class="result-group">
          <h3>Subbase (${results.subbase.type})</h3>
          <div class="result-item">
            <span>Thickness:</span>
            <span>${results.subbase.thickness}"</span>
          </div>
          <div class="result-item">
            <span>Volume:</span>
            <span>${results.subbase.yards.toFixed(2)} cu yd</span>
          </div>
          <div class="result-item">
            <span>Approximate weight:</span>
            <span>${results.subbase.tons.toFixed(1)} tons</span>
          </div>
        </div>
      `;
    }

    // Finishing section
    resultsHtml += `
      <div class="result-group">
        <h3>Finishing</h3>
        <div class="result-item">
          <span>Finish type:</span>
          <span>${results.finishing.finishType}</span>
        </div>
        <div class="result-item">
          <span>Control joints:</span>
          <span>${results.finishing.jointLength.toFixed(0)} linear ft</span>
        </div>
    `;

    if (results.finishing.sealer) {
      resultsHtml += `
        <div class="result-item">
          <span>Sealer required:</span>
          <span>${results.finishing.sealer.gallons} gallons</span>
        </div>
      `;
    }

    if (results.finishing.edging) {
      resultsHtml += `
        <div class="result-item">
          <span>Edging material:</span>
          <span>${results.finishing.edging.linearFeet.toFixed(0)} linear ft</span>
        </div>
      `;
    }

    resultsHtml += `</div>`;

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
            <small>$${results.costs.pricePerSqFt.toFixed(2)} per sq ft | $${results.costs.pricePerYard.toFixed(0)} per cu yd</small>
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

    const exportData = {
      project: 'Site Concrete Calculator Results',
      date: new Date().toLocaleDateString(),
      inputs: {
        'Concrete Strength': `${this.state.concreteStrength} PSI`,
        'Concrete Type': this.state.concreteType,
        'Reinforcement': this.state.reinforcementType,
        'Finish Type': this.state.finishType,
        'Waste Factor': `${this.state.wastePercent}%`,
        'Region': this.state.region
      },
      elements: {},
      totals: {
        'Total Area': `${results.totals.area.toLocaleString()} sq ft`,
        'Concrete Volume': `${results.totals.volumeYards.toFixed(2)} cu yd`,
        'Concrete to Order': `${results.totals.concreteYardsOrdered} cu yd`
      },
      costs: {
        'Material Cost': `$${results.costs.materials.toLocaleString()}`,
        'Labor Cost': `$${results.costs.labor.toLocaleString()}`,
        'Overhead': `$${results.costs.overhead.toLocaleString()}`,
        'Profit': `$${results.costs.profit.toLocaleString()}`,
        'Total Cost': `$${results.costs.total.toLocaleString()}`,
        'Cost per Sq Ft': `$${results.costs.pricePerSqFt.toFixed(2)}`,
        'Cost per Cu Yd': `$${results.costs.pricePerYard.toFixed(0)}`
      }
    };

    // Add elements breakdown
    results.elements.forEach((element, index) => {
      exportData.elements[`Element ${index + 1} (${element.type})`] = {
        'Dimensions': `${element.length}' x ${element.width}' x ${element.thickness}"`,
        'Quantity': element.quantity,
        'Area': `${element.area.toFixed(1)} sq ft`,
        'Volume': `${element.volumeYards.toFixed(2)} cu yd`
      };
    });

    // Add reinforcement if present
    if (results.reinforcement.type) {
      exportData.reinforcement = {
        'Type': results.reinforcement.type
      };

      if (results.reinforcement.meshRolls) {
        exportData.reinforcement['Mesh Rolls'] = `${results.reinforcement.meshRolls}`;
      }
      if (results.reinforcement.standardBars) {
        exportData.reinforcement['Rebar Bars'] = `${results.reinforcement.standardBars}`;
        exportData.reinforcement['Rebar Length'] = `${results.reinforcement.totalLength.toFixed(1)} ft`;
      }
      if (results.reinforcement.pounds) {
        exportData.reinforcement['Fiber Weight'] = `${results.reinforcement.pounds} lbs`;
      }
    }

    // Add subbase if present
    if (results.subbase.yards) {
      exportData.subbase = {
        'Type': results.subbase.type,
        'Thickness': `${results.subbase.thickness}"`,
        'Volume': `${results.subbase.yards.toFixed(2)} cu yd`,
        'Weight': `${results.subbase.tons.toFixed(1)} tons`
      };
    }

    Export.exportData(exportData, `site-concrete-calculation-${Date.now()}`, format);
  }

  // Legacy compute function for testing
  compute() {
    if (!this.state.results) return null;

    const results = this.state.results;
    const output = {
      area: results.totals.area,
      volumeYards: results.totals.volumeYards,
      concreteYardsOrdered: results.totals.concreteYardsOrdered,
      totalCost: results.costs.total
    };

    return output;
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.siteConcreteCalc = new SiteConcreteCalculator();
});

// Legacy exports for compatibility
export function init(el) {
  // Initialize calculator UI in the provided element
  window.siteConcreteCalc = new SiteConcreteCalculator();
}

export function compute(state) {
  // Legacy compute for testing: 100 sq ft @ 4" thick should return reasonable volume
  const area = state?.area || 400; // 100 ft x 4 ft = 400 sq ft
  const thickness = state?.thickness || 4; // inches

  const volume = area * (thickness / 12); // cubic feet
  const volumeYards = volume / 27; // cubic yards
  const concreteOrdered = Math.ceil(volumeYards * 1.1 * 4) / 4; // with waste, rounded to quarter yard

  return {
    ok: true,
    area: area,
    volumeYards: volumeYards,
    concreteOrdered: concreteOrdered
  };
}

export function explain(state) {
  return "Calculates concrete volume, reinforcement, subbase, and finishing materials for curbs, sidewalks, driveways, and site concrete elements.";
}

export function meta() {
  return {
    id: "siteconcrete",
    title: "Site Concrete Calculator",
    category: "sitework"
  };
}

export { SiteConcreteCalculator };