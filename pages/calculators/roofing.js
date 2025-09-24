import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  formatters
} from '../../utils/calculatorUtils';

export default function RoofingCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    pitch: '4'
  });

  const [roofType, setRoofType] = useState('asphalt');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const roofTypes = {
    asphalt: { name: 'Asphalt Shingles', sqftPrice: 3.50, laborMultiplier: 1.0, lifespan: '15-30 years' },
    metal: { name: 'Metal Roofing', sqftPrice: 8.50, laborMultiplier: 1.2, lifespan: '40-70 years' },
    tile: { name: 'Clay/Concrete Tile', sqftPrice: 6.00, laborMultiplier: 1.8, lifespan: '50-100 years' },
    slate: { name: 'Slate Roofing', sqftPrice: 12.00, laborMultiplier: 2.0, lifespan: '75-150 years' },
    rubber: { name: 'Rubber Membrane', sqftPrice: 4.75, laborMultiplier: 1.1, lifespan: '30-50 years' }
  };

  const pitchFactors = {
    '2': 1.02,
    '3': 1.06,
    '4': 1.12,
    '5': 1.18,
    '6': 1.25,
    '8': 1.42,
    '10': 1.67,
    '12': 2.0
  };

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.pitch = validatePositiveNumber(dimensions.pitch, 'Roof Pitch');

    // Remove null errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) {
        delete newErrors[key];
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Calculate roofing requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const pitch = dimensions.pitch;

    const roof = roofTypes[roofType];
    const pitchFactor = pitchFactors[pitch] || 1.12;

    // Base area
    const baseArea = length * width;

    // Actual roof area accounting for pitch
    const roofArea = baseArea * pitchFactor;

    // Add waste factor (typically 10-15% for roofing)
    const totalArea = roofArea * 1.15;

    // Calculate squares (100 sq ft units)
    const squares = totalArea / 100;

    // Material costs
    const materialCost = totalArea * roof.sqftPrice;

    // Labor costs
    const baseLaborRate = 2.50; // per sq ft
    const laborCost = totalArea * baseLaborRate * roof.laborMultiplier;

    // Additional costs (underlayment, flashing, nails, etc.)
    const underlaymentCost = totalArea * 0.75;
    const flashingCost = (length + width) * 2 * 8; // Perimeter × $8/ft
    const miscCost = materialCost * 0.15; // 15% for nails, ridge caps, etc.

    const totalMaterialCost = materialCost + underlaymentCost + flashingCost + miscCost;
    const totalCost = totalMaterialCost + laborCost;

    const calculatedResults = {
      baseArea: formatters.area(baseArea),
      roofArea: formatters.area(roofArea),
      totalAreaWithWaste: formatters.area(totalArea),
      squares: formatters.number(squares, 1) + ' squares',
      roofType: roof.name,
      lifespan: roof.lifespan,
      materialCost: formatters.currency(materialCost),
      underlaymentCost: formatters.currency(underlaymentCost),
      flashingCost: formatters.currency(flashingCost),
      miscCost: formatters.currency(miscCost),
      totalMaterialCost: formatters.currency(totalMaterialCost),
      laborCost: formatters.currency(laborCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('roofing', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Roofing Calculator"
      description="Calculate roofing materials and costs for your project. Get accurate estimates for asphalt, metal, tile, slate, and rubber roofing systems."
      results={results}
      inputs={dimensions}
      calculatorType="roofing"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Roof Length (feet)</label>
            <input
              type="number"
              id="length"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              placeholder="Enter roof length"
              className={errors.length ? 'error' : ''}
              step="0.1"
            />
            {errors.length && <span className="error-message">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="width">Roof Width (feet)</label>
            <input
              type="number"
              id="width"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              placeholder="Enter roof width"
              className={errors.width ? 'error' : ''}
              step="0.1"
            />
            {errors.width && <span className="error-message">{errors.width}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pitch">Roof Pitch (rise over 12)</label>
            <select
              id="pitch"
              value={dimensions.pitch}
              onChange={(e) => setDimensions({...dimensions, pitch: e.target.value})}
            >
              <option value="2">2/12 (Low slope)</option>
              <option value="3">3/12</option>
              <option value="4">4/12 (Standard)</option>
              <option value="5">5/12</option>
              <option value="6">6/12</option>
              <option value="8">8/12 (Steep)</option>
              <option value="10">10/12</option>
              <option value="12">12/12 (Very steep)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="roofType">Roofing Material</label>
            <select
              id="roofType"
              value={roofType}
              onChange={(e) => setRoofType(e.target.value)}
            >
              <option value="asphalt">Asphalt Shingles</option>
              <option value="metal">Metal Roofing</option>
              <option value="tile">Clay/Concrete Tile</option>
              <option value="slate">Slate Roofing</option>
              <option value="rubber">Rubber Membrane</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Roofing</button>
        </div>

        <div className="formula-display">
          <h3>Calculation Method</h3>
          <code>
            Base Area = Length × Width<br/>
            Roof Area = Base Area × Pitch Factor<br/>
            Total Area = Roof Area × 1.15 (waste factor)<br/>
            Includes materials, underlayment, flashing, and labor
          </code>
        </div>
      </form>
    </CalculatorLayout>
  );
}