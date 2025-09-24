import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateArea,
  formatters
} from '../../utils/calculatorUtils';

export default function FlooringCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    wasteFactor: '10'
  });

  const [flooringType, setFlooringType] = useState('laminate');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const flooringPricing = {
    laminate: { sqft: 3.50, name: 'Laminate Flooring' },
    hardwood: { sqft: 8.00, name: 'Hardwood Flooring' },
    vinyl: { sqft: 2.75, name: 'Vinyl Flooring' },
    tile: { sqft: 4.25, name: 'Ceramic Tile' },
    carpet: { sqft: 2.50, name: 'Carpet' }
  };

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.wasteFactor = validatePositiveNumber(dimensions.wasteFactor, 'Waste Factor');

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

    // Calculate flooring requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const wasteFactor = parseFloat(dimensions.wasteFactor) / 100;

    const baseArea = calculateArea.rectangle(length, width);
    const totalArea = baseArea * (1 + wasteFactor);
    const pricing = flooringPricing[flooringType];
    const materialCost = totalArea * pricing.sqft;

    // Estimate installation (typically 50-100% of material cost)
    const installationCost = materialCost * 0.75;
    const totalCost = materialCost + installationCost;

    const calculatedResults = {
      baseArea: formatters.area(baseArea),
      wasteAllowance: formatters.area(totalArea - baseArea),
      totalArea: formatters.area(totalArea),
      flooringType: pricing.name,
      materialCost: formatters.currency(materialCost),
      installationCost: formatters.currency(installationCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('flooring', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Flooring Calculator"
      description="Calculate flooring materials and costs for your project. Get accurate estimates for laminate, hardwood, vinyl, tile, and carpet installations."
      results={results}
      inputs={dimensions}
      calculatorType="flooring"
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
            <label htmlFor="flooringType">Flooring Type</label>
            <select
              id="flooringType"
              value={flooringType}
              onChange={(e) => setFlooringType(e.target.value)}
            >
              <option value="laminate">Laminate ($3.50/sq ft)</option>
              <option value="hardwood">Hardwood ($8.00/sq ft)</option>
              <option value="vinyl">Vinyl ($2.75/sq ft)</option>
              <option value="tile">Ceramic Tile ($4.25/sq ft)</option>
              <option value="carpet">Carpet ($2.50/sq ft)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="wasteFactor">Waste Factor (%)</label>
            <input
              type="number"
              id="wasteFactor"
              value={dimensions.wasteFactor}
              onChange={(e) => setDimensions({...dimensions, wasteFactor: e.target.value})}
              placeholder="10"
              className={errors.wasteFactor ? 'error' : ''}
              min="5"
              max="20"
            />
            {errors.wasteFactor && <span className="error-message">{errors.wasteFactor}</span>}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Flooring</button>
        </div>
      </form>
    </CalculatorLayout>
  );
}