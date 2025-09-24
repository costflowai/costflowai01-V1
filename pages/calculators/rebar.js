import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateVolume,
  formatters
} from '../../utils/calculatorUtils';

export default function RebarCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    thickness: '4'
  });

  const [rebarSize, setRebarSize] = useState('#4');
  const [spacing, setSpacing] = useState('12');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const rebarSpecs = {
    '#3': { diameter: 0.375, weightPerFoot: 0.376, price: 0.85, name: '#3 (3/8")' },
    '#4': { diameter: 0.500, weightPerFoot: 0.668, price: 1.20, name: '#4 (1/2")' },
    '#5': { diameter: 0.625, weightPerFoot: 1.043, price: 1.85, name: '#5 (5/8")' },
    '#6': { diameter: 0.750, weightPerFoot: 1.502, price: 2.65, name: '#6 (3/4")' },
    '#7': { diameter: 0.875, weightPerFoot: 2.044, price: 3.60, name: '#7 (7/8")' },
    '#8': { diameter: 1.000, weightPerFoot: 2.670, price: 4.70, name: '#8 (1")' }
  };

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.thickness = validatePositiveNumber(dimensions.thickness, 'Thickness');

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

    // Calculate rebar requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const thickness = parseFloat(dimensions.thickness);
    const spacingInches = parseFloat(spacing);

    const rebar = rebarSpecs[rebarSize];

    // Calculate concrete volume for context
    const volumeCubicFeet = calculateVolume.cubicFeet(length, width, thickness);
    const volumeCubicYards = calculateVolume.cubicYards(volumeCubicFeet);

    // Calculate rebar grid
    const spacingFeet = spacingInches / 12;

    // Longitudinal bars (running length-wise)
    const numLongBars = Math.floor(width / spacingFeet) + 1;
    const longBarLength = length - 0.5; // 3" from each edge = 6" total = 0.5'
    const totalLongLength = numLongBars * longBarLength;

    // Transverse bars (running width-wise)
    const numTransBars = Math.floor(length / spacingFeet) + 1;
    const transBarLength = width - 0.5; // 3" from each edge = 6" total = 0.5'
    const totalTransLength = numTransBars * transBarLength;

    // Total rebar length
    const totalRebarLength = totalLongLength + totalTransLength;

    // Convert to standard lengths (20 ft bars)
    const standardBarLength = 20;
    const totalBars = Math.ceil(totalRebarLength / standardBarLength);

    // Calculate weight
    const totalWeight = totalRebarLength * rebar.weightPerFoot;

    // Calculate costs
    const materialCost = totalBars * standardBarLength * rebar.price;

    // Accessories (tie wire, chairs, etc.)
    const accessoryCost = totalBars * 1.5; // ~$1.50 per bar for accessories

    // Labor (typically $0.50-$1.00 per pound of rebar)
    const laborCost = totalWeight * 0.75;

    const totalCost = materialCost + accessoryCost + laborCost;

    // Rebar percentage of concrete volume
    const rebarPercentage = (totalRebarLength * Math.PI * Math.pow(rebar.diameter / 24, 2)) / volumeCubicFeet * 100;

    const calculatedResults = {
      concreteVolume: formatters.volume(volumeCubicYards, 'cu yd'),
      rebarSize: rebar.name,
      spacing: `${spacing}" on center`,
      longBars: `${numLongBars} bars @ ${formatters.number(longBarLength, 1)} ft each`,
      transBars: `${numTransBars} bars @ ${formatters.number(transBarLength, 1)} ft each`,
      totalLength: formatters.number(totalRebarLength, 0) + ' ft',
      standardBars: formatters.count(totalBars) + ' bars (20 ft)',
      totalWeight: formatters.number(totalWeight, 0) + ' lbs',
      rebarPercentage: formatters.number(rebarPercentage, 2) + '%',
      materialCost: formatters.currency(materialCost),
      accessoryCost: formatters.currency(accessoryCost),
      laborCost: formatters.currency(laborCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('rebar', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Rebar Calculator"
      description="Calculate rebar requirements for concrete slabs, foundations, and structures. Get accurate estimates for rebar quantity, weight, and costs."
      results={results}
      inputs={dimensions}
      calculatorType="rebar"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Slab Length (feet)</label>
            <input
              type="number"
              id="length"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              placeholder="Enter length"
              className={errors.length ? 'error' : ''}
              step="0.1"
            />
            {errors.length && <span className="error-message">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="width">Slab Width (feet)</label>
            <input
              type="number"
              id="width"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              placeholder="Enter width"
              className={errors.width ? 'error' : ''}
              step="0.1"
            />
            {errors.width && <span className="error-message">{errors.width}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="thickness">Slab Thickness (inches)</label>
            <input
              type="number"
              id="thickness"
              value={dimensions.thickness}
              onChange={(e) => setDimensions({...dimensions, thickness: e.target.value})}
              placeholder="4"
              className={errors.thickness ? 'error' : ''}
              step="0.5"
              min="3"
              max="12"
            />
            {errors.thickness && <span className="error-message">{errors.thickness}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rebarSize">Rebar Size</label>
            <select
              id="rebarSize"
              value={rebarSize}
              onChange={(e) => setRebarSize(e.target.value)}
            >
              <option value="#3">#3 (3/8") - Light duty</option>
              <option value="#4">#4 (1/2") - Standard</option>
              <option value="#5">#5 (5/8") - Heavy duty</option>
              <option value="#6">#6 (3/4") - Structural</option>
              <option value="#7">#7 (7/8") - Heavy structural</option>
              <option value="#8">#8 (1") - Very heavy</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="spacing">Rebar Spacing (inches)</label>
            <select
              id="spacing"
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
            >
              <option value="8">8" on center (Heavy reinforcement)</option>
              <option value="12">12" on center (Standard)</option>
              <option value="16">16" on center (Light reinforcement)</option>
              <option value="18">18" on center (Minimal)</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Rebar</button>
        </div>

        <div className="formula-display">
          <h3>Calculation Method</h3>
          <code>
            Rebar grid = (Length ÷ Spacing) + (Width ÷ Spacing)<br/>
            3" clearance from edges on all sides<br/>
            Standard 20-foot rebar lengths<br/>
            Includes tie wire, chairs, and installation labor
          </code>
        </div>
      </form>
    </CalculatorLayout>
  );
}