#!/usr/bin/env node

// Test concrete calculator with acceptance criteria
// L=20, W=12, T=4 should yield 3.56 cubic yards

import { calculateConcreteVolume } from '../src/calculators/_engine/formulas.js';

console.log('🧪 Testing Concrete Calculator Acceptance Criteria...');
console.log('');

// Test case: L=20, W=12, T=4
const length = 20;
const width = 12;
const thickness = 4;
const wasteFactor = 0.20; // 20% waste factor

console.log(`Input: Length=${length}ft, Width=${width}ft, Thickness=${thickness}in`);
console.log(`Waste Factor: ${wasteFactor * 100}%`);
console.log('');

const result = calculateConcreteVolume(length, width, thickness, wasteFactor);

console.log('Results:');
console.log(`Volume (without waste): ${result.cubicYards.toFixed(2)} cubic yards`);
console.log(`Volume (with waste): ${result.totalVolume.toFixed(2)} cubic yards`);
console.log('');

// Check acceptance criteria
const expectedVolume = 3.56;
const tolerance = 0.1; // Allow 0.1 cubic yard tolerance

const volumeMatch = Math.abs(result.totalVolume - expectedVolume) <= tolerance;

console.log('🎯 Acceptance Criteria Check:');
console.log(`Expected: ~${expectedVolume} cubic yards`);
console.log(`Actual: ${result.totalVolume.toFixed(2)} cubic yards`);
console.log(`Match: ${volumeMatch ? '✅ PASS' : '❌ FAIL'}`);

if (!volumeMatch) {
    console.log(`Difference: ${Math.abs(result.totalVolume - expectedVolume).toFixed(2)} cubic yards`);
}

console.log('');

// Additional calculations
console.log('📊 Complete Calculation:');
console.log(`Base Volume: ${(length * width * (thickness / 12) / 27).toFixed(2)} cubic yards`);
console.log(`Waste Added: ${(result.totalVolume - result.cubicYards).toFixed(2)} cubic yards`);
console.log(`Total Material: ${result.totalVolume.toFixed(2)} cubic yards`);

process.exit(volumeMatch ? 0 : 1);