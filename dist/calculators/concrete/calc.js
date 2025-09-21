// Concrete Calculator Implementation
// Using the core calculator engine

import { initCalculator } from '../_engine/core.js';
import { calculateConcreteVolume, calculateMaterialCost, calculateLaborCost, calculateOverheadAndProfit } from '../_engine/formulas.js';

// Calculator configuration
const concreteConfig = {
    name: 'concrete',
    inputs: [
        {
            name: 'length',
            required: true,
            min: 0,
            max: 1000
        },
        {
            name: 'width',
            required: true,
            min: 0,
            max: 1000
        },
        {
            name: 'thickness',
            required: true,
            min: 0,
            max: 48
        },
        {
            name: 'wasteFactor',
            required: false,
            min: 0,
            max: 1
        }
    ],
    compute: calculateConcrete,
    outputs: [
        {
            key: 'volume',
            label: 'Total Volume',
            format: { type: 'unit', unit: 'yd³', decimals: 2 }
        },
        {
            key: 'area',
            label: 'Slab Area',
            format: { type: 'unit', unit: 'ft²', decimals: 0 }
        },
        {
            key: 'baseVolume',
            label: 'Base Volume (no waste)',
            format: { type: 'unit', unit: 'yd³', decimals: 2 }
        },
        {
            key: 'wasteVolume',
            label: 'Waste Allowance',
            format: { type: 'unit', unit: 'yd³', decimals: 2 }
        },
        {
            key: 'materialCost',
            label: 'Est. Material Cost',
            format: { type: 'currency', decimals: 0 }
        },
        {
            key: 'totalEstimate',
            label: 'Total Project Estimate',
            format: { type: 'currency', decimals: 0 }
        }
    ]
};

/**
 * Calculate concrete requirements and costs
 * @param {Object} inputs - User inputs
 * @returns {Object} Calculation results
 */
function calculateConcrete(inputs) {
    const { length, width, thickness, wasteFactor = 0.2 } = inputs;

    // Basic volume calculations
    const volumeCalc = calculateConcreteVolume(length, width, thickness, wasteFactor);
    const area = length * width;

    // Cost estimates (placeholder values - would normally come from pricing API/database)
    const concretePrice = 150; // per cubic yard
    const laborRate = 75; // per hour
    const laborHours = volumeCalc.totalVolume * 0.5; // rough estimate

    // Material cost calculation
    const materialCost = calculateMaterialCost(
        volumeCalc.totalVolume,
        concretePrice,
        0.10 // 10% material markup
    );

    // Labor cost calculation
    const laborCost = calculateLaborCost(
        laborHours,
        laborRate,
        0.35 // 35% labor burden
    );

    // Overhead and profit
    const subtotal = materialCost.totalCost + laborCost.totalCost;
    const finalCost = calculateOverheadAndProfit(subtotal, 0.10, 0.10);

    return {
        // Volume information
        volume: volumeCalc.totalVolume,
        baseVolume: volumeCalc.cubicYards,
        wasteVolume: volumeCalc.wasteAmount,
        area: area,

        // Cost breakdown
        materialCost: materialCost.totalCost,
        laborCost: laborCost.totalCost,
        overheadCost: finalCost.overheadAmount,
        profitCost: finalCost.profitAmount,
        totalEstimate: finalCost.total,

        // Additional details for advanced display
        details: {
            cubicFeet: volumeCalc.cubicFeet,
            wasteFactor: wasteFactor,
            concretePrice: concretePrice,
            laborHours: laborHours,
            laborRate: laborRate
        }
    };
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        initCalculator(concreteConfig);
        console.log('Concrete calculator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize concrete calculator:', error);
    }
});