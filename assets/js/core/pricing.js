// Pricing data loader with regional factor support
// Loads base pricing and applies regional adjustments

import { bus, EVENTS } from './bus.js';

class PricingEngine {
  constructor() {
    this.basePricing = null;
    this.regionalFactors = null;
    this.currentRegion = 'default';
    this.isLoaded = false;
  }

  /**
   * Initialize pricing engine by loading base data and region
   * @param {string} region - Region code (e.g., 'us', 'ca')
   */
  async init(region = 'us') {
    try {
      await this.loadBasePricing();
      await this.loadRegionalFactors(region);
      this.currentRegion = region;
      this.isLoaded = true;

      bus.emit(EVENTS.PRICING_UPDATED, {
        region: this.currentRegion,
        loaded: true
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize pricing engine:', error);
      bus.emit(EVENTS.DATA_ERROR, { type: 'pricing', error: error.message });
      return false;
    }
  }

  /**
   * Load base pricing data
   */
  async loadBasePricing() {
    const response = await fetch('/assets/data/pricing.base.json');
    if (!response.ok) {
      throw new Error(`Failed to load base pricing: ${response.status}`);
    }
    this.basePricing = await response.json();
  }

  /**
   * Load regional factors
   * @param {string} region - Region code
   */
  async loadRegionalFactors(region) {
    const response = await fetch(`/assets/data/regions/${region}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load regional factors for ${region}: ${response.status}`);
    }
    this.regionalFactors = await response.json();
  }

  /**
   * Get price for a material/service with regional adjustment
   * @param {string} category - Material category (e.g., 'concrete', 'rebar')
   * @param {string} item - Specific item (e.g., 'ready_mix_3000psi')
   * @param {string} unit - Price unit (e.g., 'per_cubic_yard')
   * @returns {number} Adjusted price
   */
  getPrice(category, item, unit = 'base') {
    if (!this.isLoaded) {
      console.warn('Pricing engine not loaded');
      return 0;
    }

    const basePrice = this.getBasePrice(category, item, unit);
    const factor = this.getRegionalFactor(category, item);

    return basePrice * factor;
  }

  /**
   * Get base price without regional adjustment
   */
  getBasePrice(category, item, unit = 'base') {
    if (!this.basePricing || !this.basePricing[category]) {
      console.warn(`Category ${category} not found in pricing`);
      return 0;
    }

    const categoryData = this.basePricing[category];
    const itemData = categoryData[item];

    if (!itemData) {
      console.warn(`Item ${item} not found in category ${category}`);
      return 0;
    }

    // Handle different price structures
    if (typeof itemData === 'number') {
      return itemData;
    }

    if (itemData[unit] !== undefined) {
      return itemData[unit];
    }

    if (itemData.price !== undefined) {
      return itemData.price;
    }

    console.warn(`Price unit ${unit} not found for ${category}.${item}`);
    return 0;
  }

  /**
   * Get regional factor for adjustment
   */
  getRegionalFactor(category, item) {
    if (!this.regionalFactors) {
      return 1.0;
    }

    // Try specific item factor first
    if (this.regionalFactors[category] && this.regionalFactors[category][item]) {
      return this.regionalFactors[category][item];
    }

    // Fall back to category factor
    if (this.regionalFactors[category] && typeof this.regionalFactors[category] === 'number') {
      return this.regionalFactors[category];
    }

    // Fall back to general factor
    if (this.regionalFactors.general) {
      return this.regionalFactors.general;
    }

    return 1.0;
  }

  /**
   * Get all available categories
   */
  getCategories() {
    return this.basePricing ? Object.keys(this.basePricing) : [];
  }

  /**
   * Get all items in a category
   */
  getCategoryItems(category) {
    if (!this.basePricing || !this.basePricing[category]) {
      return [];
    }
    return Object.keys(this.basePricing[category]);
  }

  /**
   * Calculate material cost with quantity
   * @param {string} category - Material category
   * @param {string} item - Specific item
   * @param {number} quantity - Quantity needed
   * @param {string} unit - Price unit
   * @returns {object} Cost breakdown
   */
  calculateMaterialCost(category, item, quantity, unit = 'base') {
    const unitPrice = this.getPrice(category, item, unit);
    const totalCost = unitPrice * quantity;
    const basePrice = this.getBasePrice(category, item, unit);
    const factor = this.getRegionalFactor(category, item);

    return {
      unitPrice,
      quantity,
      totalCost,
      basePrice,
      regionalFactor: factor,
      region: this.currentRegion,
      breakdown: {
        base: basePrice * quantity,
        adjustment: (unitPrice - basePrice) * quantity
      }
    };
  }

  /**
   * Get pricing summary for display
   */
  getPricingSummary() {
    return {
      region: this.currentRegion,
      loaded: this.isLoaded,
      categories: this.getCategories().length,
      lastUpdated: this.regionalFactors?.last_updated || null
    };
  }

  /**
   * Switch to different region
   * @param {string} region - New region code
   */
  async switchRegion(region) {
    if (region === this.currentRegion) {
      return true;
    }

    try {
      await this.loadRegionalFactors(region);
      this.currentRegion = region;

      bus.emit(EVENTS.PRICING_UPDATED, {
        region: this.currentRegion,
        loaded: true
      });

      return true;
    } catch (error) {
      console.error(`Failed to switch to region ${region}:`, error);
      return false;
    }
  }

  /**
   * Get current pricing state
   */
  getState() {
    return {
      region: this.currentRegion,
      loaded: this.isLoaded,
      basePricingLoaded: !!this.basePricing,
      regionalFactorsLoaded: !!this.regionalFactors
    };
  }
}

// Create global pricing engine instance
export const pricing = new PricingEngine();

// Export class for custom instances
export { PricingEngine };

// Convenience functions for common operations
export function getPrice(category, item, unit) {
  return pricing.getPrice(category, item, unit);
}

export function calculateCost(category, item, quantity, unit) {
  return pricing.calculateMaterialCost(category, item, quantity, unit);
}

export async function initPricing(region = 'us') {
  return await pricing.init(region);
}

// Material-specific helpers for concrete calculator
export function getConcretePricing() {
  return {
    readyMix3000: pricing.getPrice('concrete', 'ready_mix_3000psi', 'per_cubic_yard'),
    readyMix4000: pricing.getPrice('concrete', 'ready_mix_4000psi', 'per_cubic_yard'),
    fiber: pricing.getPrice('concrete', 'fiber_mesh', 'per_cubic_yard'),
    delivery: pricing.getPrice('concrete', 'delivery', 'per_load')
  };
}

export function getRebarPricing() {
  return {
    grade60_4: pricing.getPrice('rebar', 'grade60_4', 'per_linear_foot'),
    grade60_5: pricing.getPrice('rebar', 'grade60_5', 'per_linear_foot'),
    mesh6x6: pricing.getPrice('rebar', 'mesh_6x6', 'per_square_foot'),
    tieWire: pricing.getPrice('rebar', 'tie_wire', 'per_pound')
  };
}

export function getLaborPricing() {
  return {
    excavation: pricing.getPrice('labor', 'excavation', 'per_square_foot'),
    forming: pricing.getPrice('labor', 'forming', 'per_linear_foot'),
    placement: pricing.getPrice('labor', 'concrete_placement', 'per_cubic_yard'),
    finishing: pricing.getPrice('labor', 'finishing', 'per_square_foot')
  };
}