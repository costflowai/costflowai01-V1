// Shared Construction Calculation Formulas
// Standard unit conversions and construction math

/**
 * Volume Calculations
 */

/**
 * Calculate concrete volume with waste factor
 * @param {number} length - Length in feet
 * @param {number} width - Width in feet
 * @param {number} thickness - Thickness in inches
 * @param {number} wasteFactor - Waste percentage (default 20%)
 * @returns {Object} Volume calculations
 */
export function calculateConcreteVolume(length, width, thickness, wasteFactor = 0.2) {
    const cubicFeet = length * width * (thickness / 12);
    const cubicYards = cubicFeet / 27;
    const wasteAmount = cubicYards * wasteFactor;
    const totalVolume = cubicYards + wasteAmount;

    return {
        cubicFeet: cubicFeet,
        cubicYards: cubicYards,
        wasteAmount: wasteAmount,
        totalVolume: totalVolume,
        wasteFactor: wasteFactor
    };
}

/**
 * Area Calculations
 */

/**
 * Calculate rectangular area
 * @param {number} length - Length in feet
 * @param {number} width - Width in feet
 * @returns {number} Area in square feet
 */
export function calculateRectangularArea(length, width) {
    return length * width;
}

/**
 * Calculate wall area minus openings
 * @param {number} length - Wall length in feet
 * @param {number} height - Wall height in feet
 * @param {Array} openings - Array of {width, height} openings
 * @returns {Object} Area calculations
 */
export function calculateWallArea(length, height, openings = []) {
    const grossArea = length * height;
    const openingArea = openings.reduce((total, opening) => {
        return total + (opening.width * opening.height);
    }, 0);
    const netArea = grossArea - openingArea;

    return {
        grossArea: grossArea,
        openingArea: openingArea,
        netArea: netArea
    };
}

/**
 * Paint Coverage Calculations
 */

/**
 * Calculate paint requirements
 * @param {number} area - Area to paint in square feet
 * @param {number} coats - Number of coats (default 2)
 * @param {number} coverage - Coverage per gallon in sq ft (default 350)
 * @returns {Object} Paint calculations
 */
export function calculatePaintCoverage(area, coats = 2, coverage = 350) {
    const totalArea = area * coats;
    const gallons = totalArea / coverage;
    const gallonsRounded = Math.ceil(gallons * 4) / 4; // Round to nearest quart

    return {
        totalArea: totalArea,
        gallons: gallons,
        gallonsRounded: gallonsRounded,
        coats: coats,
        coverage: coverage
    };
}

/**
 * Drywall Calculations
 */

/**
 * Calculate drywall sheets needed
 * @param {number} area - Wall area in square feet
 * @param {number} sheetSize - Sheet size in square feet (default 32 for 4x8)
 * @param {number} wasteFactor - Waste percentage (default 10%)
 * @returns {Object} Drywall calculations
 */
export function calculateDrywallSheets(area, sheetSize = 32, wasteFactor = 0.1) {
    const sheetsNeeded = area / sheetSize;
    const wasteSheets = sheetsNeeded * wasteFactor;
    const totalSheets = Math.ceil(sheetsNeeded + wasteSheets);

    return {
        sheetsNeeded: sheetsNeeded,
        wasteSheets: wasteSheets,
        totalSheets: totalSheets,
        sheetSize: sheetSize
    };
}

/**
 * Calculate joint compound needed
 * @param {number} totalSheets - Number of drywall sheets
 * @param {number} compoundPerSheet - Compound per sheet in pounds (default 0.8)
 * @returns {Object} Compound calculations
 */
export function calculateJointCompound(totalSheets, compoundPerSheet = 0.8) {
    const totalPounds = totalSheets * compoundPerSheet;
    const buckets = Math.ceil(totalPounds / 50); // Assuming 50lb buckets

    return {
        totalPounds: totalPounds,
        buckets: buckets,
        compoundPerSheet: compoundPerSheet
    };
}

/**
 * Insulation Calculations
 */

/**
 * Calculate insulation requirements
 * @param {number} area - Area to insulate in square feet
 * @param {number} thickness - Insulation thickness in inches
 * @param {number} rValue - R-value per inch
 * @returns {Object} Insulation calculations
 */
export function calculateInsulation(area, thickness, rValue) {
    const totalRValue = thickness * rValue;
    const batts = Math.ceil(area / 48); // Assuming 16" wide batts, 3 per 4ft
    const rolls = Math.ceil(area / 75); // Assuming 75 sq ft per roll

    return {
        area: area,
        thickness: thickness,
        totalRValue: totalRValue,
        batts: batts,
        rolls: rolls
    };
}

/**
 * Unit Conversions
 */

/**
 * Convert feet to inches
 * @param {number} feet
 * @returns {number} inches
 */
export function feetToInches(feet) {
    return feet * 12;
}

/**
 * Convert inches to feet
 * @param {number} inches
 * @returns {number} feet
 */
export function inchesToFeet(inches) {
    return inches / 12;
}

/**
 * Convert square feet to square yards
 * @param {number} squareFeet
 * @returns {number} square yards
 */
export function squareFeetToSquareYards(squareFeet) {
    return squareFeet / 9;
}

/**
 * Convert cubic feet to cubic yards
 * @param {number} cubicFeet
 * @returns {number} cubic yards
 */
export function cubicFeetToCubicYards(cubicFeet) {
    return cubicFeet / 27;
}

/**
 * Material Pricing Calculations
 */

/**
 * Calculate material costs with markup
 * @param {number} quantity - Quantity needed
 * @param {number} unitPrice - Price per unit
 * @param {number} markup - Markup percentage (default 15%)
 * @returns {Object} Cost calculations
 */
export function calculateMaterialCost(quantity, unitPrice, markup = 0.15) {
    const materialCost = quantity * unitPrice;
    const markupAmount = materialCost * markup;
    const totalCost = materialCost + markupAmount;

    return {
        quantity: quantity,
        unitPrice: unitPrice,
        materialCost: materialCost,
        markupAmount: markupAmount,
        totalCost: totalCost,
        markup: markup
    };
}

/**
 * Calculate labor costs
 * @param {number} hours - Labor hours
 * @param {number} hourlyRate - Rate per hour
 * @param {number} burden - Labor burden percentage (default 35%)
 * @returns {Object} Labor cost calculations
 */
export function calculateLaborCost(hours, hourlyRate, burden = 0.35) {
    const baseCost = hours * hourlyRate;
    const burdenCost = baseCost * burden;
    const totalCost = baseCost + burdenCost;

    return {
        hours: hours,
        hourlyRate: hourlyRate,
        baseCost: baseCost,
        burdenCost: burdenCost,
        totalCost: totalCost,
        burden: burden
    };
}

/**
 * Calculate overhead and profit
 * @param {number} subtotal - Subtotal before OH&P
 * @param {number} overhead - Overhead percentage (default 10%)
 * @param {number} profit - Profit percentage (default 10%)
 * @returns {Object} OH&P calculations
 */
export function calculateOverheadAndProfit(subtotal, overhead = 0.10, profit = 0.10) {
    const overheadAmount = subtotal * overhead;
    const subtotalWithOverhead = subtotal + overheadAmount;
    const profitAmount = subtotalWithOverhead * profit;
    const total = subtotalWithOverhead + profitAmount;

    return {
        subtotal: subtotal,
        overheadAmount: overheadAmount,
        profitAmount: profitAmount,
        total: total,
        overhead: overhead,
        profit: profit
    };
}