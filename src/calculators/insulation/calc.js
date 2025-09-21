// Insulation Calculator Implementation

import { initCalculator } from '../_engine/core.js';
import { calculateMaterialCost, calculateLaborCost, calculateOverheadAndProfit } from '../_engine/formulas.js';

const insulationConfig = {
    name: 'insulation',
    inputs: [
        { name: 'totalArea', required: true, min: 0, max: 10000 },
        { name: 'cavityDepth', required: false, min: 2, max: 12 },
        { name: 'insulationType', required: false },
        { name: 'targetRValue', required: false, min: 10, max: 60 }
    ],
    compute: calculateInsulation,
    outputs: [
        {
            key: 'area',
            label: 'Area to Insulate',
            format: { type: 'unit', unit: 'ft²', decimals: 0 }
        },
        {
            key: 'thickness',
            label: 'Insulation Thickness',
            format: { type: 'unit', unit: 'in', decimals: 1 }
        },
        {
            key: 'coverage',
            label: 'Material Coverage',
            format: { type: 'unit', unit: 'bags/rolls', decimals: 0 }
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

function calculateInsulation(inputs) {
    const {
        totalArea,
        cavityDepth = 5.5,
        insulationType = 'fiberglass-blown',
        targetRValue = 19
    } = inputs;

    // R-value per inch for different materials
    const rValuePerInch = {
        'fiberglass-batt': 3.2,
        'fiberglass-blown': 2.5,
        'cellulose-blown': 3.6,
        'spray-foam': 3.7
    };

    // Calculate required thickness
    const requiredThickness = Math.min(
        parseFloat(targetRValue) / rValuePerInch[insulationType],
        parseFloat(cavityDepth)
    );

    // Material pricing per sq ft
    const materialPrices = {
        'fiberglass-batt': 1.20,
        'fiberglass-blown': 1.50,
        'cellulose-blown': 1.35,
        'spray-foam': 3.50
    };

    // Calculate coverage (simplified - bags/rolls needed)
    const coveragePerUnit = insulationType.includes('blown') ? 40 : 75; // sq ft per bag/roll
    const unitsNeeded = Math.ceil(totalArea / coveragePerUnit);

    // Cost calculations
    const materialPricePerSqFt = materialPrices[insulationType];
    const laborRate = 55; // per hour
    const laborHours = totalArea * 0.025; // 0.025 hours per sq ft

    const materialCost = calculateMaterialCost(
        totalArea * materialPricePerSqFt,
        1, // already calculated total
        0.10 // 10% waste factor
    );

    const laborCost = calculateLaborCost(laborHours, laborRate, 0.35);
    const subtotal = materialCost.materialCost + laborCost.totalCost;
    const finalCost = calculateOverheadAndProfit(subtotal, 0.10, 0.10);

    return {
        area: totalArea,
        thickness: requiredThickness,
        coverage: unitsNeeded,
        materialCost: materialCost.totalCost,
        laborCost: laborCost.totalCost,
        totalEstimate: finalCost.total
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initCalculator(insulationConfig);
});