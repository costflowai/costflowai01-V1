// Registry Smoke Test - Validates all calculator modules
// Ensures every registry entry exists and exposes required exports

import { describe, it, expect } from '@jest/globals';
import { calculatorRegistry } from '../assets/js/calculators/registry.js';

describe('Calculator Registry', () => {
  it('should have 21 calculators registered', () => {
    expect(calculatorRegistry).toHaveLength(21);
  });

  it('should have unique calculator IDs', () => {
    const ids = calculatorRegistry.map(calc => calc.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all required registry properties', () => {
    calculatorRegistry.forEach(calc => {
      expect(calc).toHaveProperty('id');
      expect(calc).toHaveProperty('module');
      expect(calc).toHaveProperty('description');

      expect(typeof calc.id).toBe('string');
      expect(typeof calc.module).toBe('function');
      expect(typeof calc.description).toBe('string');

      expect(calc.id.length).toBeGreaterThan(0);
      expect(calc.description.length).toBeGreaterThan(10);
    });
  });

  describe('Calculator Module Exports', () => {
    // Test each calculator module individually
    const expectedCalculators = [
      'concrete', 'framing', 'drywall', 'paint', 'roofing', 'flooring',
      'plumbing', 'electrical', 'hvac', 'earthwork', 'masonry', 'steel',
      'asphalt', 'siteconcrete', 'doorswindows', 'insulation', 'firestop',
      'waterproof', 'demolition', 'genconds', 'fees'
    ];

    expectedCalculators.forEach(calcId => {
      it(`should load ${calcId} module and expose required exports`, async () => {
        const registryEntry = calculatorRegistry.find(calc => calc.id === calcId);
        expect(registryEntry).toBeDefined();

        // Dynamically import the module
        const module = await registryEntry!.module();

        // Verify required exports exist
        expect(module).toHaveProperty('init');
        expect(module).toHaveProperty('compute');
        expect(module).toHaveProperty('explain');
        expect(module).toHaveProperty('meta');

        // Verify export types
        expect(typeof module.init).toBe('function');
        expect(typeof module.compute).toBe('function');
        expect(typeof module.explain).toBe('function');
        expect(typeof module.meta).toBe('function');

        // Test meta() function returns required properties
        const meta = module.meta();
        expect(meta).toHaveProperty('id');
        expect(meta).toHaveProperty('title');
        expect(meta).toHaveProperty('category');

        expect(typeof meta.id).toBe('string');
        expect(typeof meta.title).toBe('string');
        expect(typeof meta.category).toBe('string');

        expect(meta.id).toBe(calcId);
      });

      it(`should have compute function return proper error for ${calcId}`, async () => {
        const registryEntry = calculatorRegistry.find(calc => calc.id === calcId);
        const module = await registryEntry!.module();

        const result = module.compute({});

        expect(result).toHaveProperty('ok');
        expect(result).toHaveProperty('msg');
        expect(result.ok).toBe(false);
        expect(result.msg).toBe('Not implemented');
      });

      it(`should have explain function return placeholder for ${calcId}`, async () => {
        const registryEntry = calculatorRegistry.find(calc => calc.id === calcId);
        const module = await registryEntry!.module();

        const explanation = module.explain({});

        expect(typeof explanation).toBe('string');
        expect(explanation).toBe('TBD');
      });
    });
  });

  describe('Calculator Categories', () => {
    const expectedCategories = [
      'structural', 'finishing', 'exterior', 'mep', 'sitework',
      'thermal', 'safety', 'protection', 'project'
    ];

    it('should only use valid categories', async () => {
      const allMeta = await Promise.all(
        calculatorRegistry.map(async entry => {
          const module = await entry.module();
          return module.meta();
        })
      );

      const usedCategories = new Set(allMeta.map(meta => meta.category));

      usedCategories.forEach(category => {
        expect(expectedCategories).toContain(category);
      });
    });

    it('should have at least one calculator per major category', async () => {
      const allMeta = await Promise.all(
        calculatorRegistry.map(async entry => {
          const module = await entry.module();
          return module.meta();
        })
      );

      const usedCategories = new Set(allMeta.map(meta => meta.category));

      // Core categories that should be present
      const coreCategories = ['structural', 'finishing', 'mep', 'sitework'];

      coreCategories.forEach(category => {
        expect(usedCategories).toContain(category);
      });
    });
  });
});