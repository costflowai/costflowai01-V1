// Calculator Registry - Central registry for all calculators
// Uses lazy imports for performance

export const calculatorRegistry = [
  {
    id: 'concrete',
    module: () => import('./concrete.js'),
    description: 'Calculate concrete volume, materials, and costs for slabs, foundations, and structural elements'
  },
  {
    id: 'framing',
    module: () => import('./framing.js'),
    description: 'Estimate lumber quantities and costs for wood and steel framing systems'
  },
  {
    id: 'drywall',
    module: () => import('./drywall.js'),
    description: 'Calculate drywall sheets, mud, tape, and finishing materials'
  },
  {
    id: 'paint',
    module: () => import('./paint.js'),
    description: 'Estimate paint quantities, primer, and coating materials for interior and exterior surfaces'
  },
  {
    id: 'roofing',
    module: () => import('./roofing.js'),
    description: 'Calculate roofing materials including shingles, underlayment, and accessories'
  },
  {
    id: 'flooring',
    module: () => import('./flooring.js'),
    description: 'Estimate flooring materials for tile, hardwood, carpet, and other floor finishes'
  },
  {
    id: 'plumbing',
    module: () => import('./plumbing.js'),
    description: 'Calculate pipe, fittings, and plumbing fixture requirements'
  },
  {
    id: 'electrical',
    module: () => import('./electrical.js'),
    description: 'Estimate electrical materials including wire, conduit, panels, and devices'
  },
  {
    id: 'hvac',
    module: () => import('./hvac.js'),
    description: 'Calculate HVAC system components, ductwork, and equipment sizing'
  },
  {
    id: 'earthwork',
    module: () => import('./earthwork.js'),
    description: 'Estimate excavation, fill, grading, and site preparation quantities'
  },
  {
    id: 'masonry',
    module: () => import('./masonry.js'),
    description: 'Calculate brick, block, stone, and mortar requirements'
  },
  {
    id: 'steel',
    module: () => import('./steel.js'),
    description: 'Estimate structural steel quantities and connection materials'
  },
  {
    id: 'asphalt',
    module: () => import('./asphalt.js'),
    description: 'Calculate asphalt paving materials and quantities for roads and parking'
  },
  {
    id: 'siteconcrete',
    module: () => import('./siteconcrete.js'),
    description: 'Estimate site concrete for sidewalks, curbs, and paved areas'
  },
  {
    id: 'doorswindows',
    module: () => import('./doorswindows.js'),
    description: 'Calculate door and window quantities, hardware, and trim materials'
  },
  {
    id: 'insulation',
    module: () => import('./insulation.js'),
    description: 'Estimate insulation materials for walls, roofs, and thermal barriers'
  },
  {
    id: 'firestop',
    module: () => import('./firestop.js'),
    description: 'Calculate firestop materials and fire-rated assembly components'
  },
  {
    id: 'waterproof',
    module: () => import('./waterproof.js'),
    description: 'Estimate waterproofing membranes, coatings, and protection systems'
  },
  {
    id: 'demolition',
    module: () => import('./demolition.js'),
    description: 'Calculate demolition quantities, disposal, and site clearing requirements'
  },
  {
    id: 'genconds',
    module: () => import('./genconds.js'),
    description: 'Estimate general conditions including supervision, utilities, and temporary facilities'
  },
  {
    id: 'fees',
    module: () => import('./fees.js'),
    description: 'Calculate permit fees, inspections, and regulatory compliance costs'
  }
];

// Helper function to get calculator by ID
export function getCalculator(id) {
  return calculatorRegistry.find(calc => calc.id === id);
}

// Helper function to get calculators by category
export function getCalculatorsByCategory() {
  const categories = {};

  // We'll need to load each module to get the category from meta()
  // For now, return the registry as-is until meta() is called
  return calculatorRegistry;
}

// Async helper to load and get meta for all calculators
export async function getAllCalculatorMeta() {
  const metaPromises = calculatorRegistry.map(async (entry) => {
    const module = await entry.module();
    const meta = module.meta();
    return {
      ...meta,
      description: entry.description
    };
  });

  return await Promise.all(metaPromises);
}