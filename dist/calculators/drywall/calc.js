// Drywall Calculator Implementation

import { initCalculator } from '../_engine/core.js';
import { calculateDrywallSheets, calculateJointCompound, calculateMaterialCost, calculateLaborCost, calculateOverheadAndProfit } from '../_engine/formulas.js';

const drywallConfig = {
    name: 'drywall',
    inputs: [
        { name: 'totalArea', required: true, min: 0, max: 10000 },
        { name: 'doorArea', required: false, min: 0, max: 1000 },
        { name: 'windowArea', required: false, min: 0, max: 1000 },
        { name: 'sheetSize', required: false, min: 16, max: 64 },
        { name: 'wasteFactor', required: false, min: 0, max: 1 }
    ],
    compute: calculateDrywall,
    outputs: [
        {
            key: 'netArea',
            label: 'Net Wall Area',
            format: { type: 'unit', unit: 'ft²', decimals: 0 }
        },
        {
            key: 'sheets',
            label: 'Drywall Sheets',
            format: { type: 'number', decimals: 0 }
        },
        {
            key: 'compound',
            label: 'Joint Compound',
            format: { type: 'unit', unit: 'lbs', decimals: 0 }
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

function calculateDrywall(inputs) {
    const { totalArea, doorArea = 0, windowArea = 0, sheetSize = 32, wasteFactor = 0.10 } = inputs;

    // Calculate net area
    const netArea = totalArea - doorArea - windowArea;

    // Calculate sheets needed
    const sheetCalc = calculateDrywallSheets(netArea, parseFloat(sheetSize), wasteFactor);

    // Calculate joint compound
    const compoundCalc = calculateJointCompound(sheetCalc.totalSheets);

    // Cost estimates
    const sheetPrice = 15; // per sheet
    const compoundPrice = 25; // per 50lb bucket
    const laborRate = 45; // per hour
    const laborHours = netArea * 0.02; // 0.02 hours per sq ft

    const materialCost = calculateMaterialCost(
        sheetCalc.totalSheets * sheetPrice + compoundCalc.buckets * compoundPrice,
        1, // already calculated total
        0.10
    );

    const laborCost = calculateLaborCost(laborHours, laborRate, 0.35);
    const subtotal = materialCost.materialCost + laborCost.totalCost;
    const finalCost = calculateOverheadAndProfit(subtotal, 0.10, 0.10);

    return {
        netArea: netArea,
        sheets: sheetCalc.totalSheets,
        compound: compoundCalc.totalPounds,
        materialCost: materialCost.totalCost,
        laborCost: laborCost.totalCost,
        totalEstimate: finalCost.total
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initCalculator(drywallConfig);
});