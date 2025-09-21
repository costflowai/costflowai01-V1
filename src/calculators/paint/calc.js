// Paint Calculator Implementation

import { initCalculator } from '../_engine/core.js';
import { calculateMaterialCost, calculateLaborCost, calculateOverheadAndProfit } from '../_engine/formulas.js';

const paintConfig = {
    name: 'paint',
    inputs: [
        { name: 'totalArea', required: true, min: 0, max: 10000 },
        { name: 'doorArea', required: false, min: 0, max: 1000 },
        { name: 'windowArea', required: false, min: 0, max: 1000 },
        { name: 'coats', required: false, min: 1, max: 5 },
        { name: 'coverage', required: false, min: 200, max: 500 }
    ],
    compute: calculatePaint,
    outputs: [
        {
            key: 'netArea',
            label: 'Net Surface Area',
            format: { type: 'unit', unit: 'ft²', decimals: 0 }
        },
        {
            key: 'paintArea',
            label: 'Total Paint Area',
            format: { type: 'unit', unit: 'ft²', decimals: 0 }
        },
        {
            key: 'gallons',
            label: 'Paint Required',
            format: { type: 'unit', unit: 'gal', decimals: 1 }
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

function calculatePaint(inputs) {
    const { totalArea, doorArea = 0, windowArea = 0, coats = 2, coverage = 350 } = inputs;

    // Calculate net area
    const netArea = totalArea - doorArea - windowArea;

    // Calculate total paint area (net area × number of coats)
    const paintArea = netArea * parseFloat(coats);

    // Calculate gallons needed
    const gallonsRaw = paintArea / parseFloat(coverage);
    const gallons = Math.ceil(gallonsRaw * 4) / 4; // Round up to nearest quart

    // Cost estimates
    const paintPrice = 45; // per gallon
    const laborRate = 50; // per hour
    const laborHours = netArea * 0.015; // 0.015 hours per sq ft

    const materialCost = calculateMaterialCost(
        gallons * paintPrice,
        1, // already calculated total
        0.10 // 10% waste factor
    );

    const laborCost = calculateLaborCost(laborHours, laborRate, 0.35);
    const subtotal = materialCost.materialCost + laborCost.totalCost;
    const finalCost = calculateOverheadAndProfit(subtotal, 0.10, 0.10);

    return {
        netArea: netArea,
        paintArea: paintArea,
        gallons: gallons,
        materialCost: materialCost.totalCost,
        laborCost: laborCost.totalCost,
        totalEstimate: finalCost.total
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initCalculator(paintConfig);
});