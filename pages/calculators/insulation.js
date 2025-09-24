import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateArea,
  formatters
} from '../../utils/calculatorUtils';

export default function InsulationCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '8'
  });

  const [insulationType, setInsulationType] = useState('fiberglass');
  const [rValue, setRValue] = useState('R13');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const insulationTypes = {
    fiberglass: {
      name: 'Fiberglass Batts',
      R13: { price: 1.20, thickness: '3.5"', coverage: 88 },
      R15: { price: 1.35, thickness: '3.5"', coverage: 88 },
      R19: { price: 1.60, thickness: '6.25"', coverage: 49 },
      R30: { price: 2.40, thickness: '9.5"', coverage: 49 }
    },
    cellulose: {
      name: 'Blown-in Cellulose',
      R13: { price: 1.45, thickness: '3.7"', coverage: 36 },
      R19: { price: 2.10, thickness: '5.4"', coverage: 36 },
      R30: { price: 3.25, thickness: '8.6"', coverage: 36 },
      R38: { price: 4.10, thickness: '10.8"', coverage: 36 }
    },
    foam: {
      name: 'Spray Foam',
      R13: { price: 3.50, thickness: '2.2"', coverage: 200 },
      R19: { price: 5.25, thickness: '3.2"', coverage: 200 },
      R30: { price: 8.25, thickness: '5.0"', coverage: 200 }
    },
    rockwool: {
      name: 'Mineral Wool',
      R15: { price: 1.85, thickness: '3.5"', coverage: 59 },
      R23: { price: 2.65, thickness: '5.5"', coverage: 40 },
      R30: { price: 3.45, thickness: '7.25"', coverage: 32 }
    }
  };

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.height = validatePositiveNumber(dimensions.height, 'Height');

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

    // Calculate insulation requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);

    const insulation = insulationTypes[insulationType];
    const rValueData = insulation[rValue];

    if (!rValueData) {
      setErrors({ general: 'Selected R-value not available for this insulation type' });
      return;
    }

    // Calculate areas
    const wallArea = calculateArea.walls(length, width, height);
    const ceilingArea = calculateArea.rectangle(length, width);

    // For walls, subtract typical door/window openings (15% reduction)
    const actualWallArea = wallArea * 0.85;
    const totalArea = actualWallArea + ceilingArea;

    // Calculate material requirements
    const coverage = rValueData.coverage; // sq ft per bag/roll
    const bagsNeeded = Math.ceil(totalArea / coverage);

    // Material costs
    const materialCost = totalArea * rValueData.price;

    // Installation costs (varies by type)
    let laborMultiplier = 1.5; // Default for fiberglass
    if (insulationType === 'cellulose') laborMultiplier = 2.0;
    if (insulationType === 'foam') laborMultiplier = 3.0;
    if (insulationType === 'rockwool') laborMultiplier = 1.7;

    const laborCost = materialCost * laborMultiplier;

    // Additional materials (vapor barrier, tools, etc.)
    const vaporBarrierCost = totalArea * 0.25;
    const miscCost = materialCost * 0.1;

    const totalMaterialCost = materialCost + vaporBarrierCost + miscCost;
    const totalCost = totalMaterialCost + laborCost;

    // Energy savings estimate (simplified)
    const annualSavings = totalArea * 0.15; // Rough estimate $0.15 per sq ft annually

    const calculatedResults = {
      wallArea: formatters.area(actualWallArea),
      ceilingArea: formatters.area(ceilingArea),
      totalArea: formatters.area(totalArea),
      insulationType: insulation.name,
      rValue: rValue,
      thickness: rValueData.thickness,
      bagsNeeded: formatters.count(bagsNeeded),
      materialCost: formatters.currency(materialCost),
      vaporBarrierCost: formatters.currency(vaporBarrierCost),
      miscCost: formatters.currency(miscCost),
      totalMaterialCost: formatters.currency(totalMaterialCost),
      laborCost: formatters.currency(laborCost),
      estimatedCost: formatters.currency(totalCost),
      annualSavings: formatters.currency(annualSavings)
    };

    setResults(calculatedResults);
    trackCalculatorUse('insulation', calculatedResults);
  };

  const availableRValues = Object.keys(insulationTypes[insulationType] || {}).filter(key => key.startsWith('R'));

  return (
    <CalculatorLayout
      title="Insulation Calculator"
      description="Calculate insulation materials and costs for walls and ceilings. Get accurate estimates for fiberglass, cellulose, spray foam, and mineral wool insulation."
      results={results}
      inputs={dimensions}
      calculatorType="insulation"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Room Length (feet)</label>
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
            <label htmlFor="width">Room Width (feet)</label>
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
            <label htmlFor="height">Wall Height (feet)</label>
            <input
              type="number"
              id="height"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
              placeholder="8"
              className={errors.height ? 'error' : ''}
              step="0.5"
            />
            {errors.height && <span className="error-message">{errors.height}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="insulationType">Insulation Type</label>
            <select
              id="insulationType"
              value={insulationType}
              onChange={(e) => {
                setInsulationType(e.target.value);
                // Reset R-value when changing type
                const newAvailableRValues = Object.keys(insulationTypes[e.target.value] || {}).filter(key => key.startsWith('R'));
                if (newAvailableRValues.length > 0 && !newAvailableRValues.includes(rValue)) {
                  setRValue(newAvailableRValues[0]);
                }
              }}
            >
              <option value="fiberglass">Fiberglass Batts</option>
              <option value="cellulose">Blown-in Cellulose</option>
              <option value="foam">Spray Foam</option>
              <option value="rockwool">Mineral Wool</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rValue">R-Value</label>
            <select
              id="rValue"
              value={rValue}
              onChange={(e) => setRValue(e.target.value)}
            >
              {availableRValues.map(rv => (
                <option key={rv} value={rv}>{rv}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Insulation</button>
        </div>

        <div className="formula-display">
          <h3>Calculation Details</h3>
          <code>
            Wall Area = (Length + Width) × 2 × Height × 0.85 (door/window reduction)<br/>
            Ceiling Area = Length × Width<br/>
            Includes vapor barrier and installation costs<br/>
            Energy savings are estimated based on improved thermal performance
          </code>
        </div>
      </form>
    </CalculatorLayout>
  );
}