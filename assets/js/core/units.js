// Unit conversion and formatting utilities
// Comprehensive unit system for construction calculations

// ============= FORMATTING UTILITIES =============

export function formatCurrency(amount, precision = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(amount);
}

export function formatNumber(num, precision = 1) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  }).format(num);
}

export function formatPercent(num, precision = 1) {
  if (num === null || num === undefined || isNaN(num)) return '0%';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(num / 100);
}

// ============= ROUNDING UTILITIES =============

export function roundToDecimal(num, places = 2) {
  const factor = Math.pow(10, places);
  return Math.round(num * factor) / factor;
}

export function roundUpToDecimal(num, places = 2) {
  const factor = Math.pow(10, places);
  return Math.ceil(num * factor) / factor;
}

export function roundToNearest(num, increment = 1) {
  return Math.round(num / increment) * increment;
}

// Common construction rounding
export function roundToNearestHalf(num) {
  return Math.round(num * 2) / 2;
}

export function roundToNearestQuarter(num) {
  return Math.round(num * 4) / 4;
}

export function roundToNearestEighth(num) {
  return Math.round(num * 8) / 8;
}

// ============= LENGTH CONVERSIONS =============

export function feetToInches(feet) {
  return feet * 12;
}

export function inchesToFeet(inches) {
  return inches / 12;
}

export function feetToMeters(feet) {
  return feet * 0.3048;
}

export function metersToFeet(meters) {
  return meters / 0.3048;
}

export function feetToYards(feet) {
  return feet / 3;
}

export function yardsToFeet(yards) {
  return yards * 3;
}

export function inchesToMeters(inches) {
  return inches * 0.0254;
}

export function metersToInches(meters) {
  return meters / 0.0254;
}

// ============= AREA CONVERSIONS =============

export function sqftToSqyd(sqft) {
  return sqft / 9;
}

export function sqydToSqft(sqyd) {
  return sqyd * 9;
}

export function sqftToSqm(sqft) {
  return sqft * 0.092903;
}

export function sqmToSqft(sqm) {
  return sqm / 0.092903;
}

export function sqinToSqft(sqin) {
  return sqin / 144;
}

export function sqftToSqin(sqft) {
  return sqft * 144;
}

// ============= VOLUME CONVERSIONS =============

export function cubicFeetToYards(cubicFeet) {
  return cubicFeet / 27;
}

export function cubicYardsToFeet(cubicYards) {
  return cubicYards * 27;
}

export function cubicFeetToMeters(cubicFeet) {
  return cubicFeet * 0.0283168;
}

export function cubicMetersToFeet(cubicMeters) {
  return cubicMeters / 0.0283168;
}

export function gallonsToLiters(gallons) {
  return gallons * 3.78541;
}

export function litersToGallons(liters) {
  return liters / 3.78541;
}

export function cubicInchesToFeet(cubicInches) {
  return cubicInches / 1728;
}

export function cubicFeetToInches(cubicFeet) {
  return cubicFeet * 1728;
}

// ============= WEIGHT CONVERSIONS =============

export function poundsToKilograms(pounds) {
  return pounds * 0.453592;
}

export function kilogramsToPounds(kilograms) {
  return kilograms / 0.453592;
}

export function tonsToLbs(tons) {
  return tons * 2000;
}

export function lbsToTons(lbs) {
  return lbs / 2000;
}

// ============= CONSTRUCTION HELPERS =============

/**
 * Calculate area from length and width
 */
export function calculateArea(length, width) {
  return length * width;
}

/**
 * Calculate volume from length, width, and height/thickness
 */
export function calculateVolume(length, width, height) {
  return length * width * height;
}

/**
 * Calculate concrete volume in cubic yards from dimensions in feet/inches
 */
export function calculateConcreteVolume(lengthFt, widthFt, thicknessIn) {
  const thicknessFt = inchesToFeet(thicknessIn);
  const volumeCuFt = calculateVolume(lengthFt, widthFt, thicknessFt);
  return cubicFeetToYards(volumeCuFt);
}

/**
 * Add waste factor to quantity
 */
export function addWaste(quantity, wastePercent) {
  return quantity * (1 + wastePercent / 100);
}

/**
 * Calculate perimeter
 */
export function calculatePerimeter(length, width) {
  return 2 * (length + width);
}

/**
 * Convert decimal feet to feet and inches
 */
export function decimalFeetToFeetInches(decimalFeet) {
  const feet = Math.floor(decimalFeet);
  const inches = roundToNearestEighth((decimalFeet - feet) * 12);
  return { feet, inches };
}

/**
 * Convert feet and inches to decimal feet
 */
export function feetInchesToDecimalFeet(feet, inches) {
  return feet + (inches / 12);
}

/**
 * Parse common construction measurements
 */
export function parseMeasurement(input) {
  if (typeof input === 'number') return input;

  const str = input.toString().trim();

  // Handle formats like "10'6\"", "10' 6\"", "10ft 6in"
  const feetInchesRegex = /(\d+(?:\.\d+)?)'?\s*(\d+(?:\.\d+)?)"?/;
  const match = str.match(feetInchesRegex);

  if (match) {
    const feet = parseFloat(match[1]);
    const inches = parseFloat(match[2]);
    return feetInchesToDecimalFeet(feet, inches);
  }

  // Handle simple decimal
  const decimal = parseFloat(str);
  return isNaN(decimal) ? 0 : decimal;
}

// ============= UNIT CONSTANTS =============

export const UNITS = {
  LENGTH: {
    INCHES: 'in',
    FEET: 'ft',
    YARDS: 'yd',
    METERS: 'm'
  },
  AREA: {
    SQUARE_INCHES: 'sq in',
    SQUARE_FEET: 'sq ft',
    SQUARE_YARDS: 'sq yd',
    SQUARE_METERS: 'sq m'
  },
  VOLUME: {
    CUBIC_INCHES: 'cu in',
    CUBIC_FEET: 'cu ft',
    CUBIC_YARDS: 'cu yd',
    CUBIC_METERS: 'cu m',
    GALLONS: 'gal',
    LITERS: 'L'
  },
  WEIGHT: {
    POUNDS: 'lbs',
    TONS: 'tons',
    KILOGRAMS: 'kg'
  }
};

// ============= VALIDATION HELPERS =============

export function isValidMeasurement(value) {
  if (typeof value === 'number') return !isNaN(value) && value >= 0;
  if (typeof value === 'string') {
    const parsed = parseMeasurement(value);
    return !isNaN(parsed) && parsed >= 0;
  }
  return false;
}