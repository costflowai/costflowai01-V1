// Unit conversion and formatting utilities

export function formatCurrency(amount, precision = 2) {
  if (!amount || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(amount);
}

export function formatNumber(num, precision = 1) {
  if (!num || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  }).format(num);
}

export function formatPercent(num, precision = 1) {
  if (!num || isNaN(num)) return '0%';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(num / 100);
}

// Area conversions
export function sqftToSqyd(sqft) {
  return sqft / 9;
}

export function sqydToSqft(sqyd) {
  return sqyd * 9;
}

// Length conversions
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

// Volume conversions
export function cubicFeetToYards(cubicFeet) {
  return cubicFeet / 27;
}

export function cubicYardsToFeet(cubicYards) {
  return cubicYards * 27;
}

export function gallonsToLiters(gallons) {
  return gallons * 3.78541;
}

export function litersToGallons(liters) {
  return liters / 3.78541;
}